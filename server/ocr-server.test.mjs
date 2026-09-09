import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { createOcrServer } from './ocr-server.mjs'

const temporaryRoots = []
const servers = []

const createFixture = async () => {
  const root = await mkdtemp(join(tmpdir(), 'stammbaum-ocr-api-'))
  temporaryRoots.push(root)
  const runRoot = join(root, 'book-1', 'run-1')
  await mkdir(join(runRoot, 'text'), { recursive: true })
  await writeFile(
    join(runRoot, 'run.json'),
    JSON.stringify({
      book_id: 'book-1',
      run_id: 'run-1',
      status: 'complete',
      created_at: '2026-09-01T00:00:00Z',
      model: { model_id: 'kraken-pp-ocrv6-medium' },
      input_pages: [{
        page_id: 'page-1',
        page_number: 1,
        section: 'Familienregister 1840',
      }],
    }),
  )
  await writeFile(join(runRoot, 'text', 'page-0001.txt'), 'Anna Weber')
  return root
}

const listen = (server) => new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    if (!address || typeof address === 'string') {
      reject(new Error('Der Testserver hat keinen Port.'))
      return
    }
    resolve(`http://127.0.0.1:${address.port}`)
  })
})

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))))
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('Node OCR server', () => {
  it('reads the requested Linux path through a local JSON API and keeps the source read-only', async () => {
    const root = await createFixture()
    const runPath = join(root, 'book-1', 'run-1', 'run.json')
    const before = await readFile(runPath, 'utf8')
    const server = createOcrServer()
    servers.push(server)
    const baseUrl = await listen(server)

    const response = await fetch(`${baseUrl}/api/ocr/read`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://127.0.0.1:5173',
      },
      body: JSON.stringify({ path: root }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBe('http://127.0.0.1:5173')
    expect(body.pages[0]).toMatchObject({
      bookId: 'book-1',
      modelId: 'kraken-pp-ocrv6-medium',
      text: 'Anna Weber',
    })
    expect(await readFile(runPath, 'utf8')).toBe(before)
  })

  it('returns a client error for an invalid path and supports health checks', async () => {
    const server = createOcrServer()
    servers.push(server)
    const baseUrl = await listen(server)

    const health = await fetch(`${baseUrl}/health`)
    const response = await fetch(`${baseUrl}/api/ocr/read`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: '/definitely/not/an/ocr/path' }),
    })
    const body = await response.json()

    expect(health.status).toBe(200)
    expect(await health.json()).toEqual({ ok: true })
    expect(response.status).toBe(400)
    expect(body).toMatchObject({ error: expect.stringContaining('OCR-Pfad') })
  })
})
