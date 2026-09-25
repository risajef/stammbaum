import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { parseFamilyTreeYaml } from './persistence/yaml'

interface PersonInput {
  id: string
  firstName?: string
}

interface RelationshipInput {
  id: string
  type: 'marriage' | 'parent-child'
  fromId: string
  toId: string
}

const yamlDocument = (
  persons: PersonInput[],
  relationships: RelationshipInput[] = [],
) => JSON.stringify({
  schemaVersion: 1,
  persons: persons.map(({ id, firstName }) => ({
    id,
    firstName: firstName ?? id,
    lastName: 'Test',
    gender: null,
    birthYear: null,
    deathYear: null,
    position: null,
  })),
  relationships: relationships.map((relationship) => ({
    ...relationship,
    ...(relationship.type === 'marriage' ? { startDate: null } : {}),
    status: 'explicit',
    sourceUrl: null,
  })),
})

const fileHandle = (name: string, contents: string) => ({
  getFile: async () => new File([contents], name, { type: 'text/yaml' }),
})

const stubFilePicker = (...selections: Array<Array<{ name: string; contents: string }>>) => {
  const picker = vi.fn()
  selections.forEach((selection) => {
    picker.mockResolvedValueOnce(
      selection.map(({ name, contents }) => fileHandle(name, contents)),
    )
  })
  vi.stubGlobal('showOpenFilePicker', picker)
  return picker
}

const addPerson = async (firstName: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
  fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: firstName } })
  fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Test' } })
  fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
  await screen.findByText(`${firstName} Test`)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('family-tree file fusion', () => {
  it('merges any number of files, resets the prior view, and saves a reopenable result', async () => {
    const firstRelationship = {
      id: 'ruth-shared',
      type: 'parent-child' as const,
      fromId: 'ruth',
      toId: 'shared',
    }
    const sourceFiles = [
      {
        name: 'Ruth.yaml',
        contents: yamlDocument(
          [{ id: 'ruth', firstName: 'Ruth' }, { id: 'shared', firstName: 'Anna' }],
          [firstRelationship],
        ),
      },
      {
        name: 'Ernst.yaml',
        contents: yamlDocument(
          [
            { id: 'ruth', firstName: 'Ruth' },
            { id: 'shared', firstName: 'Anna' },
            { id: 'ernst', firstName: 'Ernst' },
          ],
          [firstRelationship, {
            id: 'shared-ernst',
            type: 'parent-child',
            fromId: 'shared',
            toId: 'ernst',
          }],
        ),
      },
      {
        name: 'Weiterer-Zweig.yaml',
        contents: yamlDocument([{ id: 'guest', firstName: 'Gast' }]),
      },
    ]
    const picker = stubFilePicker(
      [{ name: 'Alt.yaml', contents: yamlDocument([{ id: 'old', firstName: 'Alt' }]) }],
      sourceFiles,
    )
    const write = vi.fn().mockResolvedValue(undefined)
    const close = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('showSaveFilePicker', vi.fn().mockResolvedValue({
      createWritable: vi.fn().mockResolvedValue({ write, close }),
    }))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await screen.findByText('Geöffnet: Alt.yaml')
    fireEvent.click(await screen.findByText('Alt Test'))
    fireEvent.click(screen.getByLabelText('Lokale Ansicht'))
    expect(screen.getByText('1 von 1 sichtbar')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Stammbäume fusionieren' }))

    await waitFor(() => expect(screen.getByText('4 Personen')).toBeVisible())
    expect(picker).toHaveBeenLastCalledWith({ multiple: true })
    expect(screen.getByRole('heading', { name: 'Wähle ein Objekt' })).toBeVisible()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
    expect(screen.getByTestId('rf__edge-ruth-shared')).toBeInTheDocument()
    expect(screen.getByTestId('rf__edge-shared-ernst')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    await waitFor(() => expect(write).toHaveBeenCalledOnce())
    expect(screen.getByText('Gespeichert: fusion.yaml')).toBeVisible()
    const savedYaml = write.mock.calls[0]?.[0] as string
    const parsedSavedTree = parseFamilyTreeYaml(savedYaml)
    expect(parsedSavedTree.ok).toBe(true)
    if (!parsedSavedTree.ok) throw new Error(parsedSavedTree.error.message)
    expect(parsedSavedTree.value.persons).toHaveLength(4)
    expect(parsedSavedTree.value.relationships.map(({ id }) => id)).toEqual([
      'ruth-shared',
      'shared-ernst',
    ])

    picker.mockResolvedValueOnce([fileHandle('fusion.yaml', savedYaml)])
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: fusion.yaml')).toBeVisible())
    expect(screen.getByText('4 Personen')).toBeVisible()
    expect(screen.getByTestId('rf__edge-ruth-shared')).toBeInTheDocument()
  })

  it('warns before replacing dirty work and does not open files when the warning is rejected', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const picker = stubFilePicker([])

    render(<App />)
    await addPerson('Lokal')
    fireEvent.click(screen.getByRole('button', { name: 'Stammbäume fusionieren' }))

    expect(confirm).toHaveBeenCalledWith('Ungespeicherte Änderungen verwerfen?')
    expect(picker).not.toHaveBeenCalled()
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Lokal Test')).toBeVisible()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
  })

  it('keeps dirty work unchanged when equal IDs contain conflicting person data', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const picker = stubFilePicker([
      { name: 'Quelle-A.yaml', contents: yamlDocument([{ id: 'same', firstName: 'Anna' }]) },
      { name: 'Quelle-B.yaml', contents: yamlDocument([{ id: 'same', firstName: 'Anne' }]) },
    ])

    render(<App />)
    await addPerson('Lokal')
    fireEvent.click(screen.getByRole('button', { name: 'Stammbäume fusionieren' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('same')
    expect(alert).toHaveTextContent('Quelle-A.yaml')
    expect(alert).toHaveTextContent('Quelle-B.yaml')
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Lokal Test')).toBeVisible()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
    expect(picker).toHaveBeenCalledWith({ multiple: true })
  })

  it('keeps the current selection and document when the file dialog is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const picker = vi.fn().mockRejectedValue(new Error('Dateiauswahl abgebrochen.'))
    vi.stubGlobal('showOpenFilePicker', picker)

    render(<App />)
    await addPerson('Ada')
    fireEvent.click(screen.getByRole('button', { name: 'Stammbäume fusionieren' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Dateiauswahl abgebrochen.')
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Ada Test')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Person bearbeiten' })).toBeVisible()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
  })

  it('reports an invalid source without replacing the current document', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const picker = stubFilePicker([
      { name: 'Kaputt.yaml', contents: 'not: [valid' },
    ])

    render(<App />)
    await addPerson('Ada')
    fireEvent.click(screen.getByRole('button', { name: 'Stammbäume fusionieren' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Kaputt.yaml')
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Ada Test')).toBeVisible()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
    expect(picker).toHaveBeenCalledWith({ multiple: true })
  })
})
