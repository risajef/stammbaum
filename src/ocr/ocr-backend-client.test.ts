import { describe, expect, it, vi } from 'vitest'

import { readOcrFromBackend } from './ocr-backend-client'

const payload = {
  runs: [],
  pages: [],
  errors: [],
  stats: {
    discoveredRuns: 0,
    selectedRuns: 0,
    skippedRuns: 0,
    readPages: 0,
    skippedPages: 0,
  },
}

describe('OCR backend client', () => {
  it('posts the entered Linux path and parses the normalized response', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200 }),
    )

    const result = await readOcrFromBackend('/home/wer/ocr-gpu-optimized', {
      baseUrl: 'http://127.0.0.1:8787/',
      fetch,
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8787/api/ocr/read',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: '/home/wer/ocr-gpu-optimized' }),
      }),
    )
    expect(result).toMatchObject({ runs: [], pages: [], errors: [], stats: payload.stats })
  })

  it('turns a backend error into a user-facing exception', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'OCR-Pfad muss auf ein Verzeichnis zeigen.' }), {
        status: 400,
      }),
    )

    await expect(
      readOcrFromBackend('/tmp/not-a-directory', { fetch }),
    ).rejects.toThrow('OCR-Pfad muss auf ein Verzeichnis zeigen.')
  })
})
