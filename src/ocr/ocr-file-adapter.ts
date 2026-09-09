export const PRIMARY_OCR_MODEL_ID = 'kraken-pp-ocrv6-medium'
export const SUPPLEMENTAL_OCR_MODEL_ID = 'kraken-german-handwriting-zenodo-7933463'

export interface OcrPage {
  id: string
  runId: string
  bookId: string
  bookLabel?: string | null
  pageId: string
  pageNumber: number
  modelId: string
  section: string | null
  path: string
  text: string
  sourceUrl: string
}

export interface OcrRun {
  id: string
  bookId: string
  modelId: string
  label: string
  reviewUrl: string | null
  createdAt: string
  pageCount: number
  pages: OcrPage[]
}

export interface OcrImportIssue {
  path?: string
  message: string
}

export interface OcrImportStats {
  discoveredRuns: number
  selectedRuns: number
  skippedRuns: number
  readPages: number
  skippedPages: number
}

export interface OcrImportResult {
  runs: OcrRun[]
  pages: OcrPage[]
  errors: OcrImportIssue[]
  stats: OcrImportStats
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const stringValue = (value: unknown, field: string): string => {
  if (typeof value === 'string' && value.trim()) return value
  throw new Error(`OCR-Backend-Antwort enthält kein gültiges Feld „${field}“.`)
}

const nullableStringValue = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null

const positiveIntegerValue = (value: unknown, field: string): number => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  throw new Error(`OCR-Backend-Antwort enthält keine gültige Zahl für „${field}“.`)
}

const positiveOrZeroIntegerValue = (value: unknown, field: string): number => {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value
  throw new Error(`OCR-Backend-Antwort enthält keine gültige Statistik für „${field}“.`)
}

const pageFrom = (value: unknown): OcrPage => {
  if (!isRecord(value)) {
    throw new Error('OCR-Backend-Antwort enthält keine gültige Seite.')
  }
  return {
    id: stringValue(value.id, 'id'),
    runId: stringValue(value.runId, 'runId'),
    bookId: stringValue(value.bookId, 'bookId'),
    bookLabel: nullableStringValue(value.bookLabel),
    pageId: stringValue(value.pageId, 'pageId'),
    pageNumber: positiveIntegerValue(value.pageNumber, 'pageNumber'),
    modelId: stringValue(value.modelId, 'modelId'),
    section: nullableStringValue(value.section),
    path: stringValue(value.path, 'path'),
    text: stringValue(value.text, 'text'),
    sourceUrl: stringValue(value.sourceUrl, 'sourceUrl'),
  }
}

const runFrom = (value: unknown): OcrRun => {
  if (!isRecord(value)) {
    throw new Error('OCR-Backend-Antwort enthält keinen gültigen Lauf.')
  }
  const pages = Array.isArray(value.pages) ? value.pages.map(pageFrom) : []
  return {
    id: stringValue(value.id, 'id'),
    bookId: stringValue(value.bookId, 'bookId'),
    modelId: stringValue(value.modelId, 'modelId'),
    label: stringValue(value.label, 'label'),
    reviewUrl: nullableStringValue(value.reviewUrl),
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    pageCount: positiveIntegerValue(value.pageCount, 'pageCount'),
    pages,
  }
}

const issueFrom = (value: unknown): OcrImportIssue => {
  if (!isRecord(value)) {
    throw new Error('OCR-Backend-Antwort enthält keinen gültigen Importfehler.')
  }
  return {
    path: nullableStringValue(value.path) ?? undefined,
    message: stringValue(value.message, 'message'),
  }
}

const statsFrom = (value: unknown): OcrImportStats => {
  if (!isRecord(value)) {
    throw new Error('OCR-Backend-Antwort enthält keine Importstatistik.')
  }
  return {
    discoveredRuns: positiveOrZeroIntegerValue(value.discoveredRuns, 'discoveredRuns'),
    selectedRuns: positiveOrZeroIntegerValue(value.selectedRuns, 'selectedRuns'),
    skippedRuns: positiveOrZeroIntegerValue(value.skippedRuns, 'skippedRuns'),
    readPages: positiveOrZeroIntegerValue(value.readPages, 'readPages'),
    skippedPages: positiveOrZeroIntegerValue(value.skippedPages, 'skippedPages'),
  }
}

export const parseOcrImportResult = (value: unknown): OcrImportResult => {
  if (!isRecord(value)) {
    throw new Error('OCR-Backend-Antwort ist kein JSON-Objekt.')
  }
  if (!Array.isArray(value.runs) || !Array.isArray(value.pages) || !Array.isArray(value.errors)) {
    throw new Error('OCR-Backend-Antwort enthält keine vollständigen Importdaten.')
  }
  return {
    runs: value.runs.map(runFrom),
    pages: value.pages.map(pageFrom),
    errors: value.errors.map(issueFrom),
    stats: statsFrom(value.stats),
  }
}
