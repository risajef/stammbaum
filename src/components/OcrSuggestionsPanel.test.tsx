import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import OcrSuggestionsPanel from './OcrSuggestionsPanel'
import type { Person } from '../domain/types'
import type { OcrSuggestion } from '../ocr/ocr-suggestions'

const knownPerson: Person = {
  id: 'parent-1',
  firstName: 'Anna',
  lastName: 'Weber',
  gender: 'woman',
  birthYear: null,
  deathYear: null,
  position: null,
}

const suggestion: OcrSuggestion = {
  id: 'suggestion-1',
  newPerson: {
    firstName: 'Lina',
    lastName: 'Weber',
    gender: 'woman',
    birthYear: null,
    deathYear: null,
    position: null,
    comment: null,
  },
  existingPersonId: 'parent-1',
  relationshipType: 'parent-child',
  direction: 'candidate-child',
  reason: 'Klares Tochter-Muster auf Seite 7.',
  score: 86,
  scoreBreakdown: {
    name: 35,
    date: 25,
    gender: 10,
    relationship: 10,
    source: 6,
  },
  scoreReasons: ['Name: 35/35', 'Datum: 25/35'],
  evidence: {
    count: 1,
    sources: [],
  },
  excerpt: 'Lina Weber, Tochter von Anna Weber.',
  source: {
    bookId: 'book-1',
    bookLabel: 'Kirchenbuch 1840',
    pageId: 'page-7',
    runId: 'run-1',
    pageNumber: 7,
    modelId: 'kraken-pp-ocrv6-medium',
    section: 'Familienregister 1840',
    path: 'run-1/text/page-7.txt',
  },
  sourceUrl: 'http://127.0.0.1:8767/review?book_id=book-1&page_id=page-7',
}

describe('OcrSuggestionsPanel', () => {
  it('offers Linux path input and explains the empty suggestion state', () => {
    const onImport = vi.fn()
    const onPathChange = vi.fn()

    render(
      <OcrSuggestionsPanel
        importState={{ status: 'idle', runs: [], pages: [], errors: [] }}
        suggestions={[]}
        persons={[]}
        ocrPath="/home/wer/ocr-gpu-optimized"
        onPathChange={onPathChange}
        onImport={onImport}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'OCR-Pfad (Linux)' }), {
      target: { value: '/home/wer/Code/kirchenbücher/ocr-gpu-optimized' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'OCR-Pfad einlesen' }))

    expect(onPathChange).toHaveBeenCalledWith('/home/wer/Code/kirchenbücher/ocr-gpu-optimized')
    expect(onImport).toHaveBeenCalledOnce()
    expect(screen.getByText('Keine Vorschläge')).toBeVisible()
  })

  it('shows import progress and loaded run summary without technical page links', () => {
    const { rerender } = render(
      <OcrSuggestionsPanel
        importState={{
          status: 'loading',
          backendStatus: 'connecting',
          runs: [],
          pages: [],
          errors: [],
        }}
        suggestions={[]}
        persons={[]}
        ocrPath=""
        onPathChange={vi.fn()}
        onImport={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )

    expect(screen.getByText('OCR wird geladen…')).toBeVisible()
    expect(screen.getByText('OCR-Backend wird kontaktiert…')).toBeVisible()

    rerender(
      <OcrSuggestionsPanel
        importState={{
          status: 'loaded',
          backendStatus: 'connected',
          runs: [{
            id: 'run-1',
            bookId: 'book-1',
            modelId: 'kraken-pp-ocrv6-medium',
            label: 'Kirchenbuch 1840',
            reviewUrl: null,
            createdAt: '2026-09-01T00:00:00Z',
            pageCount: 2,
            pages: [],
          }],
          pages: [
            {
              id: 'run-1:1',
              runId: 'run-1',
              bookId: 'book-1',
              pageId: 'page-1',
              pageNumber: 1,
              modelId: 'kraken-pp-ocrv6-medium',
              section: 'Familienregister 1840',
              path: 'run-1/text/page-1.txt',
              text: 'OCR',
              sourceUrl: 'http://127.0.0.1:8767/review?book_id=book-1&page_id=page-1',
            },
          ],
          errors: [],
        }}
        suggestions={[]}
        persons={[]}
        ocrPath=""
        onPathChange={vi.fn()}
        onImport={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )

    expect(screen.getByText('Kirchenbuch 1840')).toBeVisible()
    expect(screen.getByText('1 Quelle · 1 Seite')).toBeVisible()
    expect(screen.getByText('OCR-Backend verbunden')).toBeVisible()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows understandable import errors while leaving the suggestion list empty', () => {
    render(
      <OcrSuggestionsPanel
        importState={{
          status: 'error',
          backendStatus: 'unreachable',
          runs: [],
          pages: [],
          errors: [{ message: 'Die OCR-Metadatei run.json enthält kein gültiges JSON.' }],
        }}
        suggestions={[]}
        persons={[]}
        ocrPath=""
        onPathChange={vi.fn()}
        onImport={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      '1 OCR-Datei konnte nicht gelesen werden und wurde übersprungen.',
    )
    expect(screen.getByRole('alert')).not.toHaveTextContent('run.json')
    expect(screen.getByText('OCR-Backend nicht erreichbar')).toBeVisible()
    expect(screen.getByText('Keine Vorschläge')).toBeVisible()
  })

  it('hides technical import paths and source links from the visible panel', () => {
    render(
      <OcrSuggestionsPanel
        importState={{
          status: 'loaded',
          runs: [],
          pages: [],
          errors: [{
            path: 'book/run/text/page-0001.txt',
            message: 'OCR-Datei book/run/text/page-0001.txt enthält keinen OCR-Text.',
          }],
        }}
        suggestions={[]}
        persons={[]}
        ocrPath=""
        onPathChange={vi.fn()}
        onImport={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      '1 OCR-Datei konnte nicht gelesen werden und wurde übersprungen.',
    )
    expect(screen.getByRole('alert')).not.toHaveTextContent('book/run/text/page-0001.txt')
  })

  it('shows a complete OCR suggestion card with source metadata and individual actions', () => {
    const onOpen = vi.fn()
    const onReject = vi.fn()
    const onReferencePersonClick = vi.fn()

    render(
      <OcrSuggestionsPanel
        importState={{ status: 'loaded', runs: [], pages: [], errors: [] }}
        suggestions={[suggestion]}
        persons={[knownPerson]}
        ocrPath=""
        onPathChange={vi.fn()}
        onImport={vi.fn()}
        onOpen={onOpen}
        onReferencePersonClick={onReferencePersonClick}
        onReject={onReject}
      />,
    )

    const card = screen.getByRole('article', { name: /Lina Weber/ })
    expect(card).toHaveTextContent('Anna Weber')
    expect(card).toHaveTextContent('Eltern-Kind')
    expect(card).toHaveTextContent('Klares Tochter-Muster')
    expect(card).toHaveTextContent('Lina Weber, Tochter von Anna Weber.')
    expect(screen.getByText('OCR-Vorschlag')).toHaveClass('relationship-origin--ocr-suggestion')
    const link = within(card).getByRole('link', {
      name: 'Kirchenbuch 1840 · PP-OCRv6 · Seite 7',
    })
    expect(link).toHaveAttribute(
      'href',
      'http://127.0.0.1:8767/review?book_id=book-1&page_id=page-7',
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))

    fireEvent.click(within(card).getByRole('button', { name: 'Anna Weber' }))
    fireEvent.click(within(card).getByRole('button', { name: 'Vorschlag bearbeiten' }))
    fireEvent.click(within(card).getByRole('button', { name: 'Vorschlag ablehnen' }))
    expect(onReferencePersonClick).toHaveBeenCalledWith('parent-1')
    expect(onOpen).toHaveBeenCalledWith(suggestion)
    expect(onReject).toHaveBeenCalledWith(suggestion)
  })

  it('keeps an unknown reference person as non-interactive fallback text', () => {
    render(
      <OcrSuggestionsPanel
        importState={{ status: 'loaded', runs: [], pages: [], errors: [] }}
        suggestions={[suggestion]}
        persons={[]}
        ocrPath=""
        onPathChange={vi.fn()}
        onImport={vi.fn()}
        onReferencePersonClick={vi.fn()}
        onReject={vi.fn()}
      />,
    )

    const card = screen.getByRole('article', { name: /Lina Weber/ })
    expect(within(card).getByText('Unbekannte Bezugsperson')).toBeVisible()
    expect(within(card).queryByRole('button', { name: 'Unbekannte Bezugsperson' })).not.toBeInTheDocument()
  })

  it('shows score details and opens the editable person workflow', () => {
    const onOpen = vi.fn()

    render(
      <OcrSuggestionsPanel
        importState={{ status: 'loaded', runs: [], pages: [], errors: [] }}
        suggestions={[suggestion]}
        persons={[knownPerson]}
        ocrPath=""
        onPathChange={vi.fn()}
        onImport={vi.fn()}
        onAccept={vi.fn()}
        onOpen={onOpen}
        onReject={vi.fn()}
      />,
    )

    const card = screen.getByRole('article', { name: /Lina Weber/ })
    expect(card).toHaveTextContent('Bewertung 86/100')
    expect(card).toHaveTextContent('Name: 35/35')
    expect(card).toHaveTextContent('Datum: 25/35')
    expect(card).toHaveTextContent('1 Beleg')

    fireEvent.click(within(card).getByRole('button', { name: 'Vorschlag bearbeiten' }))
    expect(onOpen).toHaveBeenCalledWith(suggestion)
  })
})
