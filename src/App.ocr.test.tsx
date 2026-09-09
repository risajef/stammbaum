import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  open: vi.fn(),
  save: vi.fn(),
  readOcrFromBackend: vi.fn(),
}))

vi.mock('./persistence/file-port', () => ({
  createBrowserFilePort: () => mocks,
}))

vi.mock('./ocr/ocr-backend-client', () => ({
  readOcrFromBackend: mocks.readOcrFromBackend,
}))

import App from './App'

const treeYaml = `schemaVersion: 1
persons:
  - id: parent-1
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
relationships: []`

const ocrResult = {
  runs: [{
    id: 'run-1',
    bookId: 'book-1',
    modelId: 'kraken-pp-ocrv6-medium',
    label: 'Register',
    reviewUrl: null,
    createdAt: '2026-09-01T00:00:00Z',
    pageCount: 1,
    pages: [],
  }],
  pages: [{
    id: 'run-1:1',
    runId: 'run-1',
    bookId: 'book-1',
    bookLabel: 'Register',
    pageId: 'page-1',
    pageNumber: 1,
    modelId: 'kraken-pp-ocrv6-medium',
    section: 'Familienregister 1840',
    path: 'run-1/text/page-0001.txt',
    text: 'Lina Weber, Tochter des Anna Weber.',
    sourceUrl: 'http://127.0.0.1:8767/review?book_id=book-1&page_id=page-1',
  }],
  errors: [],
  stats: {
    discoveredRuns: 1,
    selectedRuns: 1,
    skippedRuns: 0,
    readPages: 1,
    skippedPages: 0,
  },
}

describe('OCR suggestion save workflow', () => {
  beforeEach(() => {
    mocks.open.mockReset()
    mocks.save.mockReset()
    mocks.readOcrFromBackend.mockReset()
    mocks.open.mockResolvedValue({ name: 'base.yaml', contents: treeYaml })
    mocks.readOcrFromBackend.mockResolvedValue(ocrResult)
    mocks.save.mockResolvedValue(undefined)
  })

  it('opens, edits, and saves an OCR suggestion only through the existing save action', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible())

    fireEvent.change(screen.getByRole('textbox', { name: 'OCR-Pfad (Linux)' }), {
      target: { value: '/home/wer/Code/kirchenbücher/ocr-gpu-optimized' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'OCR-Pfad einlesen' }))
    expect(mocks.readOcrFromBackend).toHaveBeenCalledWith('/home/wer/Code/kirchenbücher/ocr-gpu-optimized')
    const card = await screen.findByRole('article', { name: /Lina Weber/ })

    expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Vorschlag bearbeiten' }))
    expect(screen.getByLabelText('Vorname')).toHaveValue('Lina')
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Lina-Marie' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    await waitFor(() => expect(screen.getByText('Ungespeichert')).toBeVisible())
    expect(screen.getAllByText('Lina-Marie Weber').length).toBeGreaterThan(0)
    expect(screen.getByText('OCR-Vorschlag')).toHaveClass('relationship-origin--ocr-suggestion')
    expect(mocks.save).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce())
    expect(mocks.save).toHaveBeenCalledWith(
      expect.stringContaining('origin: ocr-suggestion'),
      'base.yaml',
    )
    expect(card).not.toBeInTheDocument()
  })

  it('cancels an OCR edit without changing the tree or dirty state', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible())
    fireEvent.click(screen.getByRole('button', { name: 'OCR-Pfad einlesen' }))

    const card = await screen.findByRole('article', { name: /Lina Weber/ })
    fireEvent.click(within(card).getByRole('button', { name: 'Vorschlag bearbeiten' }))
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Geändert' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verwerfen' }))

    expect(card).toBeVisible()
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
    expect(mocks.save).not.toHaveBeenCalled()
  })

  it('navigates from an OCR suggestion to its existing reference person', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible())
    fireEvent.click(screen.getByRole('button', { name: 'OCR-Pfad einlesen' }))

    const card = await screen.findByRole('article', { name: /Lina Weber/ })
    fireEvent.click(within(card).getByRole('button', { name: 'Anna Weber' }))

    expect(screen.getByRole('heading', { name: 'Person bearbeiten' })).toBeVisible()
    expect(screen.getByLabelText('Vorname')).toHaveValue('Anna')
    expect(screen.getByLabelText('Nachname')).toHaveValue('Weber')
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
    expect(card).toBeVisible()
    expect(mocks.save).not.toHaveBeenCalled()
  })

  it('searches OCR occurrences for the selected person without changing the tree or suggestions', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible())
    fireEvent.click(screen.getByRole('button', { name: 'OCR-Pfad einlesen' }))

    const suggestionCard = await screen.findByRole('article', { name: /Lina Weber/ })
    fireEvent.change(screen.getByRole('searchbox', { name: 'Personensuche' }), {
      target: { value: 'Anna' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Nächster Treffer' }))

    const searchButton = await screen.findByRole('button', {
      name: 'OCR-Stellen für Anna Weber suchen',
    })
    expect(searchButton).toBeEnabled()
    fireEvent.click(searchButton)

    const match = await screen.findByRole('article', { name: 'OCR-Treffer: Anna Weber' })
    expect(match).toHaveTextContent('Anna Weber')
    expect(match).toHaveTextContent('Lina Weber, Tochter des Anna Weber.')
    expect(suggestionCard).toBeVisible()
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
    expect(mocks.save).not.toHaveBeenCalled()
  })

  it('keeps the OCR card and editor open after an invalid OCR save', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible())
    fireEvent.click(screen.getByRole('button', { name: 'OCR-Pfad einlesen' }))

    const card = await screen.findByRole('article', { name: /Lina Weber/ })
    fireEvent.click(within(card).getByRole('button', { name: 'Vorschlag bearbeiten' }))
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(screen.getByText('Der Vorname ist erforderlich.')).toBeVisible()
    expect(card).toBeVisible()
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
    expect(mocks.save).not.toHaveBeenCalled()
  })

  it('rejects an OCR suggestion without changing the loaded document', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible())
    fireEvent.change(screen.getByRole('textbox', { name: 'OCR-Pfad (Linux)' }), {
      target: { value: '/home/wer/Code/kirchenbücher/ocr-gpu-optimized' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'OCR-Pfad einlesen' }))

    const card = await screen.findByRole('article', { name: /Lina Weber/ })
    fireEvent.click(screen.getByRole('button', { name: 'Vorschlag ablehnen' }))

    await waitFor(() => expect(card).not.toBeInTheDocument())
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Geöffnet: base.yaml')).toBeVisible()
    expect(screen.queryByText('OCR-Vorschlag')).not.toBeInTheDocument()
    expect(mocks.save).not.toHaveBeenCalled()
  })
})
