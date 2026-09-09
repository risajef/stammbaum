import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'

import { readOcrRoot } from './ocr-reader.mjs'

const DEFAULT_PORT = 8787
const MAX_REQUEST_BYTES = 64 * 1024

const isLoopbackOrigin = (origin) => {
  if (!origin) return false
  try {
    const url = new URL(origin)
    return (url.protocol === 'http:' || url.protocol === 'https:')
      && (url.hostname === '127.0.0.1' || url.hostname === 'localhost')
  } catch {
    return false
  }
}

const headersFor = (request) => {
  const origin = typeof request.headers.origin === 'string' && isLoopbackOrigin(request.headers.origin)
    ? request.headers.origin
    : null
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...(origin ? {
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
      vary: 'Origin',
    } : {}),
  }
}

const sendJson = (response, request, status, value) => {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    ...headersFor(request),
    'content-length': Buffer.byteLength(body),
  })
  response.end(body)
}

const readRequestBody = (request) => new Promise((resolve, reject) => {
  let size = 0
  const chunks = []
  request.on('data', (chunk) => {
    size += chunk.length
    if (size > MAX_REQUEST_BYTES) {
      reject(new Error('Die OCR-Anfrage ist zu groß.'))
      request.destroy()
      return
    }
    chunks.push(chunk)
  })
  request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  request.on('error', reject)
})

const requestPathOf = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Die OCR-Anfrage muss ein JSON-Objekt enthalten.')
  }
  if (typeof payload.path !== 'string' || !payload.path.trim()) {
    throw new Error('Die OCR-Anfrage benötigt den Linux-Pfad `path`.')
  }
  return payload.path
}

export const createOcrServer = () => createServer(async (request, response) => {
  const method = request.method ?? 'GET'
  const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname

  if (method === 'OPTIONS') {
    response.writeHead(204, headersFor(request))
    response.end()
    return
  }

  if (method === 'GET' && path === '/health') {
    sendJson(response, request, 200, { ok: true })
    return
  }

  if (method !== 'POST' || path !== '/api/ocr/read') {
    sendJson(response, request, 404, { error: 'Route nicht gefunden.' })
    return
  }

  try {
    const body = await readRequestBody(request)
    let payload
    try {
      payload = JSON.parse(body)
    } catch {
      throw new Error('Die OCR-Anfrage enthält kein gültiges JSON.')
    }
    const result = await readOcrRoot(requestPathOf(payload))
    sendJson(response, request, 200, result)
  } catch (error) {
    sendJson(response, request, 400, {
      error: error instanceof Error ? error.message : 'OCR-Pfad konnte nicht gelesen werden.',
    })
  }
})

export const startOcrServer = ({ port = DEFAULT_PORT, host = '127.0.0.1' } = {}) => {
  const server = createOcrServer()
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, host, () => resolve(server))
  })
}

const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMainModule) {
  const requestedPort = Number(process.env.STAMMBAUM_OCR_PORT ?? DEFAULT_PORT)
  const port = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : DEFAULT_PORT
  startOcrServer({ port })
    .then(() => {
      console.log(`Stammbaum OCR-Backend läuft auf http://127.0.0.1:${port}`)
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
    })
}
