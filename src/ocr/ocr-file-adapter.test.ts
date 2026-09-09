import { describe, expect, it } from 'vitest'

import { parseOcrImportResult } from './ocr-file-adapter'

const stats = {
  discoveredRuns: 1,
  selectedRuns: 1,
  skippedRuns: 0,
  readPages: 1,
  skippedPages: 0,
}

const page = {
  id: 'run-1:1',
  runId: 'run-1',
  bookId: 'book-1',
  bookLabel: 'Kirchenbuch 1840',
  pageId: 'urn:uuid:page-1',
  pageNumber: 1,
  modelId: 'kraken-pp-ocrv6-medium',
  section: 'Familienregister 1840',
  path: 'book-1/run-1/text/page-0001.txt',
  text: 'Anna Weber',
  sourceUrl: 'http://127.0.0.1:8767/review?book_id=book-1&page_id=urn%3Auuid%3Apage-1',
}

describe('OCR backend response adapter', () => {
  it('parses normalized runs, pages, errors, and statistics', () => {
    expect(
      parseOcrImportResult({
        runs: [{
          id: 'run-1',
          bookId: 'book-1',
          modelId: 'kraken-pp-ocrv6-medium',
          label: 'book-1 · PP-OCRv6',
          reviewUrl: null,
          createdAt: '2026-09-01T00:00:00Z',
          pageCount: 1,
          pages: [page],
        }],
        pages: [page],
        errors: [{ path: 'book-1/run-2/run.json', message: 'wurde übersprungen.' }],
        stats,
      }),
    ).toEqual({
      runs: [{
        id: 'run-1',
        bookId: 'book-1',
        modelId: 'kraken-pp-ocrv6-medium',
        label: 'book-1 · PP-OCRv6',
        reviewUrl: null,
        createdAt: '2026-09-01T00:00:00Z',
        pageCount: 1,
        pages: [page],
      }],
      pages: [page],
      errors: [{ path: 'book-1/run-2/run.json', message: 'wurde übersprungen.' }],
      stats,
    })
  })

  it('rejects an incomplete backend payload', () => {
    expect(() => parseOcrImportResult({ runs: [], pages: [], errors: [] })).toThrow(
      'Importstatistik',
    )
  })
})
