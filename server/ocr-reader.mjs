import { readdir, readFile, stat } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'

export const PRIMARY_MODEL_ID = 'kraken-pp-ocrv6-medium'
export const SUPPLEMENTAL_MODEL_ID = 'kraken-german-handwriting-zenodo-7933463'
export const DEFAULT_REVIEW_BASE_URL = 'http://127.0.0.1:8767'

const relevantSectionPrefixes = [
  'familienregister',
  'taufen',
  'heiraten',
  'begrabnisse',
  'begraebnisse',
]

const textValue = (value) => {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

const relativePathOf = (root, path) => {
  const value = relative(root, path).replaceAll('\\', '/')
  return value || basename(path)
}

const issue = (root, path, message) => ({
  path: relativePathOf(root, path),
  message: `OCR-Datei ${relativePathOf(root, path)} ${message}`,
})

const normalizeSection = (value) =>
  textValue(value)
    ?.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de-DE') ?? ''

export const isRelevantOcrSection = (section) => {
  const normalized = normalizeSection(section)
  return relevantSectionPrefixes.some((prefix) => normalized.startsWith(prefix))
}

const modelIdOf = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return null
  const model = metadata.model
  if (typeof model === 'string') return textValue(model)
  if (model && typeof model === 'object') {
    return textValue(model.model_id) ?? textValue(model.modelId) ?? textValue(model.id)
  }
  return textValue(metadata.model_id) ?? textValue(metadata.modelId)
}

const modelNameOf = (metadata, modelId) => {
  const model = metadata.model
  if (model && typeof model === 'object') {
    return textValue(model.model_name) ?? textValue(model.name) ?? modelId
  }
  return modelId
}

const labelOf = (metadata, bookId, modelId) =>
  textValue(metadata.title)
  ?? textValue(metadata.label)
  ?? textValue(metadata.name)
  ?? `${bookId} · ${modelNameOf(metadata, modelId)}`

const priorityOf = (modelId) => {
  if (modelId === PRIMARY_MODEL_ID) return 0
  if (modelId === SUPPLEMENTAL_MODEL_ID) return 1
  return 2
}

const dateValueOf = (value) => {
  const text = textValue(value)
  if (!text) return { timestamp: Number.NEGATIVE_INFINITY, text: '' }
  const timestamp = Date.parse(text)
  return {
    timestamp: Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp,
    text,
  }
}

const isNewer = (candidate, current) => {
  const left = dateValueOf(candidate.createdAt)
  const right = dateValueOf(current.createdAt)
  if (left.timestamp !== right.timestamp) return left.timestamp > right.timestamp
  return left.text > right.text
}

const runKeyOf = (run) => `${run.bookId}\u0000${run.modelId}`

const pageNumberOf = (page) => {
  if (!page || typeof page !== 'object') return null
  const value = page.page_number ?? page.pageNumber
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && /^\d+$/u.test(value)) {
    const number = Number(value)
    return Number.isInteger(number) && number > 0 ? number : null
  }
  return null
}

const pageIdOf = (page, pageNumber) => {
  if (!page || typeof page !== 'object') return null
  return textValue(page.page_id)
    ?? textValue(page.pageId)
    ?? textValue(page.canvas_id)
    ?? textValue(page.canvasId)
    ?? `page-${String(pageNumber).padStart(4, '0')}`
}

const readJson = async (path) => {
  try {
    const contents = await readFile(path, 'utf8')
    const parsed = JSON.parse(contents)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('enthält kein JSON-Objekt.')
    }
    return parsed
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('enthält kein gültiges JSON.')
    }
    if (error instanceof Error && error.message.startsWith('enthält kein JSON-Objekt')) {
      throw error
    }
    throw new Error('konnte nicht gelesen werden.')
  }
}

const findRunFiles = async (root) => {
  const found = []
  const visit = async (directory) => {
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch {
      return
    }

    await Promise.all(entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        await visit(path)
        return
      }
      if (entry.isFile() && entry.name.toLocaleLowerCase('en-US') === 'run.json') {
        found.push(path)
      }
    }))
  }

  await visit(root)
  return found.sort((first, second) => first.localeCompare(second))
}

const metadataRunOf = (path, metadata) => {
  const bookId = textValue(metadata.book_id) ?? textValue(metadata.bookId)
  const runId = textValue(metadata.run_id) ?? textValue(metadata.runId)
  const modelId = modelIdOf(metadata)
  const pages = metadata.input_pages ?? metadata.inputPages

  if (!bookId || !runId || !modelId || !Array.isArray(pages)) {
    throw new Error('enthält unvollständige Laufmetadaten.')
  }

  return {
    bookId,
    runId,
    modelId,
    modelName: modelNameOf(metadata, modelId),
    createdAt: textValue(metadata.created_at) ?? textValue(metadata.createdAt) ?? '',
    label: labelOf(metadata, bookId, modelId),
    reviewUrl: textValue(metadata.review_url) ?? textValue(metadata.reviewUrl),
    runPath: dirname(path),
    pages,
  }
}

const textPathFor = (runPath, pageNumber) => {
  const padded = join(runPath, 'text', `page-${String(pageNumber).padStart(4, '0')}.txt`)
  const plain = join(runPath, 'text', `page-${pageNumber}.txt`)
  return padded === plain ? [padded] : [padded, plain]
}

const readPageText = async (paths) => {
  let lastError
  for (const path of paths) {
    try {
      return { path, text: await readFile(path, 'utf8') }
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error('Datei konnte nicht gelesen werden.')
}

const buildSourceUrl = ({ baseUrl, bookId, pageId }) => {
  const base = textValue(baseUrl) ?? DEFAULT_REVIEW_BASE_URL
  let url
  try {
    url = new URL(base)
  } catch {
    url = new URL(DEFAULT_REVIEW_BASE_URL)
  }
  if (!url.pathname.endsWith('/review')) {
    url.pathname = `${url.pathname.replace(/\/$/u, '')}/review`
  }
  url.search = new URLSearchParams({
    book_id: bookId,
    page_id: pageId,
  }).toString()
  return url.toString()
}

const pageOf = async (root, run, rawPage) => {
  const pageNumber = pageNumberOf(rawPage)
  if (!pageNumber) throw new Error('enthält eine ungültige Seitennummer.')
  if (!isRelevantOcrSection(rawPage.section)) return { ignored: true }

  const pageId = pageIdOf(rawPage, pageNumber)
  const result = await readPageText(textPathFor(run.runPath, pageNumber))
  if (!result.text.trim()) throw new Error('enthält keinen OCR-Text.')

  return {
    ignored: false,
    page: {
      id: `${run.runId}:${pageNumber}`,
      runId: run.runId,
      bookId: run.bookId,
      bookLabel: run.label,
      pageId,
      pageNumber,
      modelId: run.modelId,
      section: textValue(rawPage.section),
      path: relativePathOf(root, result.path),
      text: result.text,
      sourceUrl: buildSourceUrl({
        baseUrl: run.reviewUrl,
        bookId: run.bookId,
        pageId,
      }),
    },
  }
}

export const readOcrRoot = async (inputPath) => {
  if (typeof inputPath !== 'string' || !inputPath.trim()) {
    throw new Error('OCR-Pfad darf nicht leer sein.')
  }
  if (!isAbsolute(inputPath.trim())) {
    throw new Error('OCR-Pfad muss ein absoluter Linux-Pfad sein.')
  }

  const root = resolve(inputPath.trim())
  let rootStats
  try {
    rootStats = await stat(root)
  } catch {
    throw new Error('OCR-Pfad konnte nicht gelesen werden.')
  }
  if (!rootStats.isDirectory()) {
    throw new Error('OCR-Pfad muss auf ein Verzeichnis zeigen.')
  }

  const runPaths = await findRunFiles(root)
  const candidates = []
  const errors = []

  for (const runPath of runPaths) {
    let metadata
    try {
      metadata = await readJson(runPath)
      const run = metadataRunOf(runPath, metadata)
      if (metadata.status !== 'complete') continue
      candidates.push(run)
    } catch (error) {
      errors.push(issue(root, runPath, error instanceof Error ? error.message : 'konnte nicht gelesen werden.'))
    }
  }

  const selectedByKey = new Map()
  for (const candidate of candidates) {
    const key = runKeyOf(candidate)
    const current = selectedByKey.get(key)
    if (!current || isNewer(candidate, current)) selectedByKey.set(key, candidate)
  }

  const selectedRuns = [...selectedByKey.values()].sort((first, second) =>
    first.bookId.localeCompare(second.bookId)
    || priorityOf(first.modelId) - priorityOf(second.modelId)
    || first.runId.localeCompare(second.runId),
  )
  const runs = []
  const pages = []
  let skippedPages = 0

  for (const run of selectedRuns) {
    const runPages = []
    const rawPages = [...run.pages].sort((first, second) =>
      (pageNumberOf(first) ?? 0) - (pageNumberOf(second) ?? 0),
    )

    for (const rawPage of rawPages) {
      try {
        const result = await pageOf(root, run, rawPage)
        if (result.ignored) {
          skippedPages += 1
          continue
        }
        runPages.push(result.page)
        pages.push(result.page)
      } catch (error) {
        errors.push(issue(
          root,
          join(run.runPath, 'text', `page-${String(pageNumberOf(rawPage) ?? 'unknown').padStart(4, '0')}.txt`),
          error instanceof Error ? error.message : 'konnte nicht gelesen werden.',
        ))
      }
    }

    if (runPages.length === 0) {
      errors.push(issue(root, join(run.runPath, 'text'), 'enthält keine relevante, lesbare OCR-Seite.'))
      continue
    }

    runs.push({
      id: run.runId,
      bookId: run.bookId,
      modelId: run.modelId,
      label: run.label,
      reviewUrl: run.reviewUrl,
      createdAt: run.createdAt,
      pageCount: runPages.length,
      pages: runPages,
    })
  }

  const skippedRuns = runPaths.length - runs.length
  if (runPaths.length === 0) {
    errors.push({ message: 'Der OCR-Pfad enthält keine run.json-Laufmetadaten.' })
  }
  if (runs.length === 0 && runPaths.length > 0) {
    errors.push({ message: 'Es konnte kein vollständiger OCR-Lauf mit relevanten Textseiten geladen werden.' })
  }

  return {
    runs,
    pages,
    errors,
    stats: {
      discoveredRuns: runPaths.length,
      selectedRuns: runs.length,
      skippedRuns,
      readPages: pages.length,
      skippedPages,
    },
  }
}
