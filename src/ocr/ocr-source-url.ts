export interface OcrSourceReference {
  bookId: string
  pageId: string
  runId: string
  pageNumber: number
  reviewUrl?: string | null
}

export const DEFAULT_REVIEW_BASE_URL = 'http://127.0.0.1:8767'

export const isHttpSourceUrl = (value: string | null | undefined): value is string => {
  if (!value?.trim()) return false

  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const buildOcrSourceUrl = (
  reference: OcrSourceReference,
  reviewBaseUrl: string = DEFAULT_REVIEW_BASE_URL,
): string => {
  if (isHttpSourceUrl(reference.reviewUrl)) {
    return reference.reviewUrl.trim()
  }

  const baseUrl = isHttpSourceUrl(reviewBaseUrl) ? reviewBaseUrl : DEFAULT_REVIEW_BASE_URL
  const url = new URL(baseUrl)
  if (!url.pathname.endsWith('/review')) {
    url.pathname = `${url.pathname.replace(/\/$/u, '')}/review`
  }
  url.search = new URLSearchParams({
    book_id: reference.bookId,
    page_id: reference.pageId,
  }).toString()
  url.hash = ''
  return url.toString()
}
