import { describe, expect, it } from 'vitest'

import { buildOcrSourceUrl } from './ocr-source-url'

describe('OCR source URLs', () => {
  it('prefers a valid HTTP(S) viewer link supplied by run metadata', () => {
    expect(
      buildOcrSourceUrl({
        bookId: 'book-1',
        pageId: 'page-7',
        runId: 'run-1',
        pageNumber: 7,
        reviewUrl: 'https://review.example/register/42',
      }),
    ).toBe('https://review.example/register/42')
  })

  it('builds an encoded local review URL from run and page evidence', () => {
    expect(
      buildOcrSourceUrl({
        bookId: 'Kirchenbuch 1840/Teil 1',
        pageId: 'urn:uuid:page/12',
        runId: 'Kirchenbuch 1840/Teil 1',
        pageNumber: 12,
      }),
    ).toBe(
      'http://127.0.0.1:8767/review?book_id=Kirchenbuch+1840%2FTeil+1&page_id=urn%3Auuid%3Apage%2F12',
    )
  })

  it('ignores an unsupported metadata URL and still returns an HTTP(S) source', () => {
    const sourceUrl = buildOcrSourceUrl({
      bookId: 'book-1',
      pageId: 'page-1',
      runId: 'run-1',
      pageNumber: 1,
      reviewUrl: 'file:///tmp/page-1',
    })

    expect(sourceUrl).toBe('http://127.0.0.1:8767/review?book_id=book-1&page_id=page-1')
    expect(new URL(sourceUrl).protocol).toMatch(/^https?:$/)
  })
})
