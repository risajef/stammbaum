import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { readOcrRoot } from './ocr-reader.mjs'

const PP_MODEL = 'kraken-pp-ocrv6-medium'
const HTR_MODEL = 'kraken-german-handwriting-zenodo-7933463'

const temporaryRoots = []

const createRun = async (
  root,
  {
    bookId,
    runId,
    modelId,
    createdAt,
    status = 'complete',
    pages,
  },
) => {
  const runRoot = join(root, bookId, runId)
  await mkdir(join(runRoot, 'text'), { recursive: true })
  await writeFile(
    join(runRoot, 'run.json'),
    JSON.stringify({
      book_id: bookId,
      run_id: runId,
      status,
      created_at: createdAt,
      model: { model_id: modelId, model_name: modelId },
      input_pages: pages.map(({ pageNumber, pageId, section }) => ({
        page_id: pageId,
        page_number: pageNumber,
        label: `Seite ${pageNumber}`,
        section,
      })),
    }),
  )

  await Promise.all(
    pages.map(({ pageNumber, text }) =>
      writeFile(
        join(runRoot, 'text', `page-${String(pageNumber).padStart(4, '0')}.txt`),
        text,
      )),
  )
}

const createRoot = async () => {
  const root = await mkdtemp(join(tmpdir(), 'stammbaum-ocr-'))
  temporaryRoots.push(root)
  return root
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('Node OCR reader', () => {
  it('reads the newest complete run per book and model and prioritizes PP-OCRv6', async () => {
    const root = await createRoot()

    await createRun(root, {
      bookId: 'book-1',
      runId: 'pp-old',
      modelId: PP_MODEL,
      createdAt: '2026-09-01T00:00:00Z',
      pages: [{
        pageNumber: 1,
        pageId: 'page-old',
        section: 'Taufen 1840',
        text: 'ALTER LAUF',
      }],
    })
    await createRun(root, {
      bookId: 'book-1',
      runId: 'pp-new',
      modelId: PP_MODEL,
      createdAt: '2026-09-02T00:00:00Z',
      pages: [
        {
          pageNumber: 1,
          pageId: 'page-1',
          section: 'Taufen 1840',
          text: 'PP-OCRV6',
        },
        {
          pageNumber: 2,
          pageId: 'page-2',
          section: 'Namensregister',
          text: 'NICHT AUSWERTEN',
        },
      ],
    })
    await createRun(root, {
      bookId: 'book-1',
      runId: 'htr-new',
      modelId: HTR_MODEL,
      createdAt: '2026-09-03T00:00:00Z',
      pages: [{
        pageNumber: 1,
        pageId: 'page-1',
        section: 'Taufen 1840',
        text: 'HANDSCHRIFT',
      }],
    })
    await createRun(root, {
      bookId: 'book-1',
      runId: 'running',
      modelId: PP_MODEL,
      createdAt: '2026-09-04T00:00:00Z',
      status: 'running',
      pages: [{
        pageNumber: 1,
        pageId: 'page-running',
        section: 'Taufen 1840',
        text: 'NICHT FERTIG',
      }],
    })

    const result = await readOcrRoot(root)

    expect(result.runs.map((run) => run.id)).toEqual(['pp-new', 'htr-new'])
    expect(result.pages.map((page) => page.text)).toEqual(['PP-OCRV6', 'HANDSCHRIFT'])
    expect(result.pages[0]).toMatchObject({
      bookId: 'book-1',
      bookLabel: 'book-1 · kraken-pp-ocrv6-medium',
      pageId: 'page-1',
      modelId: PP_MODEL,
      section: 'Taufen 1840',
    })
    expect(result.pages.every((page) => page.text !== 'NICHT AUSWERTEN')).toBe(true)
    expect(result.stats).toMatchObject({
      discoveredRuns: 4,
      selectedRuns: 2,
      skippedRuns: 2,
    })
  })

  it('rejects an empty or non-directory Linux path before reading files', async () => {
    await expect(readOcrRoot('')).rejects.toThrow('OCR-Pfad')

    const root = await createRoot()
    const filePath = join(root, 'not-a-directory.txt')
    await writeFile(filePath, 'file')

    await expect(readOcrRoot(filePath)).rejects.toThrow('Verzeichnis')
  })
})
