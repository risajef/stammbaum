import { parseOcrImportResult, type OcrImportResult } from './ocr-file-adapter'

export const DEFAULT_OCR_BACKEND_URL = 'http://127.0.0.1:8787'

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>

export interface OcrBackendClientOptions {
  baseUrl?: string
  fetch?: FetchLike
}

const defaultFetch = (): FetchLike => {
  if (typeof window !== 'undefined') return window.fetch.bind(window)
  return globalThis.fetch.bind(globalThis)
}

const errorMessageFrom = (payload: unknown) => {
  if (
    payload !== null
    && typeof payload === 'object'
    && !Array.isArray(payload)
    && typeof (payload as { error?: unknown }).error === 'string'
  ) {
    return (payload as { error: string }).error
  }
  return 'Der OCR-Backend-Prozess hat keine gültige Fehlerbeschreibung geliefert.'
}

export const readOcrFromBackend = async (
  ocrPath: string,
  options: OcrBackendClientOptions = {},
): Promise<OcrImportResult> => {
  if (!ocrPath.trim()) {
    throw new Error('OCR-Pfad darf nicht leer sein.')
  }

  let endpoint: string
  try {
    endpoint = new URL('/api/ocr/read', options.baseUrl ?? DEFAULT_OCR_BACKEND_URL).toString()
  } catch {
    throw new Error('Die OCR-Backend-Adresse ist ungültig.')
  }

  let response: Response
  try {
    response = await (options.fetch ?? defaultFetch())(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: ocrPath.trim() }),
    })
  } catch {
    throw new Error(
      'Der OCR-Backend-Prozess ist nicht erreichbar. Bitte zuerst `npm run backend` starten.',
    )
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('Der OCR-Backend-Prozess hat keine gültige JSON-Antwort geliefert.')
  }

  if (!response.ok) {
    throw new Error(errorMessageFrom(payload))
  }

  try {
    return parseOcrImportResult(payload)
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Der OCR-Backend-Prozess hat ungültige Importdaten geliefert.',
    )
  }
}
