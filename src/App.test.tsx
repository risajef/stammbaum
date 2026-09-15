import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('application workbench', () => {
  it('places person creation in the overview instead of a tool rail', () => {
    render(<App />)

    const overview = screen.getByRole('region', { name: 'Stammbaum-Arbeitsfläche' })

    expect(within(overview).getByRole('button', { name: 'Person anlegen' })).toBeInTheDocument()
    expect(screen.getByText('Übersicht')).toBeInTheDocument()
    expect(screen.queryByRole('complementary', { name: 'Arbeitsbereich' })).not.toBeInTheDocument()
  })

  it('adds a person through the inspector and displays it on the canvas', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Ada' } })
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Lovelace' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('1 Person')).toBeVisible()
  })

  it('shows gender-specific marriage handles only for people with a gender', async () => {
    render(<App />)

    const addPerson = async (firstName: string, gender?: 'woman' | 'man') => {
      fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
      fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: firstName } })
      fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Test' } })
      if (gender) {
        fireEvent.change(screen.getByLabelText('Geschlecht'), { target: { value: gender } })
      }
      fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
      await screen.findByText(`${firstName} Test`)
    }

    await addPerson('Mann', 'man')
    await addPerson('Frau', 'woman')
    await addPerson('Unbekannt')

    const nodeFor = (label: string) => screen.getByText(`${label} Test`).closest('.person-node')

    expect(nodeFor('Mann')?.querySelector('.react-flow__handle-right')).toBeInTheDocument()
    expect(nodeFor('Frau')?.querySelector('.react-flow__handle-left')).toBeInTheDocument()
    expect(nodeFor('Unbekannt')?.querySelector('.react-flow__handle-left')).not.toBeInTheDocument()
    expect(nodeFor('Unbekannt')?.querySelector('.react-flow__handle-right')).not.toBeInTheDocument()
  })

  it('searches visible people by birth date and cycles through matches', async () => {
    render(<App />)

    const addPerson = async (firstName: string, birthYear?: string) => {
      fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
      fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: firstName } })
      fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Test' } })
      if (birthYear) {
        fireEvent.change(screen.getByLabelText('Geburtsdatum'), { target: { value: birthYear } })
      }
      fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
      await screen.findByText(`${firstName} Test`)
    }

    await addPerson('Später', '1920')
    await addPerson('Früher', '1900')
    await addPerson('Unbekannt')

    fireEvent.change(screen.getByLabelText('Personensuche'), { target: { value: 'test' } })
    expect(screen.getByText('3 Treffer')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Nächster Treffer' }))
    await waitFor(() => expect(screen.getByLabelText('Vorname')).toHaveValue('Früher'))

    fireEvent.click(screen.getByRole('button', { name: 'Nächster Treffer' }))
    await waitFor(() => expect(screen.getByLabelText('Vorname')).toHaveValue('Später'))

    fireEvent.click(screen.getByRole('button', { name: 'Nächster Treffer' }))
    await waitFor(() => expect(screen.getByLabelText('Vorname')).toHaveValue('Unbekannt'))

    fireEvent.click(screen.getByRole('button', { name: 'Nächster Treffer' }))
    await waitFor(() => expect(screen.getByLabelText('Vorname')).toHaveValue('Früher'))
  })

  it('clears a selected person when the leaf filter hides it', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Leaf' } })
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    await screen.findByText('Leaf Test')
    expect(screen.getByRole('heading', { name: 'Person bearbeiten' })).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Leafs ausblenden'))

    expect(screen.queryByText('Leaf Test')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wähle ein Objekt' })).toBeInTheDocument()
  })

  it('applies local and blood-relative filters to the selected view', async () => {
    render(<App />)

    const addPerson = async (firstName: string) => {
      fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
      fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: firstName } })
      fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Test' } })
      fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
      await screen.findByText(`${firstName} Test`)
    }

    await addPerson('Erste')
    await addPerson('Zweite')
    await addPerson('Anker')

    fireEvent.click(screen.getByLabelText('Lokale Ansicht'))
    fireEvent.change(screen.getByLabelText('Distanz'), { target: { value: '0' } })

    expect(screen.getByText('1 von 3 sichtbar')).toBeInTheDocument()
    expect(screen.getByText('Anker Test')).toBeInTheDocument()
    expect(screen.queryByText('Zweite Test')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Lokale Ansicht'))
    fireEvent.click(screen.getByLabelText('Nur Blutsverwandte'))

    expect(screen.getByText('1 von 3 sichtbar')).toBeInTheDocument()
    expect(screen.getByText('Anker Test')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Person bearbeiten' })).toBeInTheDocument()
  })

  it('merges the selected person with another node after an irreversible confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)

    const addPerson = async (birthYear: string, deathYear: string) => {
      fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
      fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Anna' } })
      fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Weber' } })
      fireEvent.change(screen.getByLabelText('Geburtsdatum'), { target: { value: birthYear } })
      fireEvent.change(screen.getByLabelText('Todesdatum'), { target: { value: deathYear } })
      fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
      await screen.findAllByText('Anna Weber')
    }

    await addPerson('1834', '')
    await addPerson('', '1901')

    fireEvent.click(screen.getByRole('button', { name: 'Mit anderer Person fusionieren' }))
    expect(screen.getByText(/zweite Person/i)).toBeVisible()

    const selectedNode = document.querySelector('.person-node--selected')
    const otherNode = [...document.querySelectorAll('.person-node')]
      .find((node) => node !== selectedNode)
    expect(selectedNode).toBeTruthy()
    expect(otherNode).toBeTruthy()
    fireEvent.click(otherNode as HTMLElement)

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('nicht rückgängig'))
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByLabelText('Geburtsdatum')).toHaveValue('1834')
    expect(screen.getByLabelText('Todesdatum')).toHaveValue('1901')
    expect(screen.getByText('Ungespeichert')).toBeVisible()
  })

  it('can choose a merge partner through search and cancel without changing the tree', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<App />)

    const addPerson = async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
      fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Anna' } })
      fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Weber' } })
      fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
      await screen.findAllByText('Anna Weber')
    }

    await addPerson()
    await addPerson()

    fireEvent.click(screen.getByRole('button', { name: 'Mit anderer Person fusionieren' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Personensuche' }), {
      target: { value: 'Anna' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Nächster Treffer' }))

    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('nicht rückgängig'))
    expect(screen.getByText('2 Personen')).toBeVisible()
    expect(screen.getAllByText('Anna Weber')).toHaveLength(2)
  })

  it('keeps both people and their saved state when a merge data conflict is rejected', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)

    const addPerson = async (birthYear: string) => {
      fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
      fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Anna' } })
      fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Weber' } })
      fireEvent.change(screen.getByLabelText('Geburtsdatum'), { target: { value: birthYear } })
      fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
      await screen.findAllByText('Anna Weber')
    }

    await addPerson('1900')
    await addPerson('1901')

    fireEvent.click(screen.getByRole('button', { name: 'Mit anderer Person fusionieren' }))
    const selectedNode = document.querySelector('.person-node--selected')
    const otherNode = [...document.querySelectorAll('.person-node')]
      .find((node) => node !== selectedNode)
    fireEvent.click(otherNode as HTMLElement)

    expect(confirm).toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Personendaten widersprechen')
    expect(screen.getByText('2 Personen')).toBeVisible()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
  })

  it('keeps the loaded tree unchanged when a merge would create too many parents', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const treeYaml = `schemaVersion: 1
persons:
  - id: parent-a
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
  - id: parent-b
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
  - id: parent-1
    firstName: Paul
    lastName: Weber
    gender: man
    birthYear: null
    deathYear: null
    position: null
  - id: parent-2
    firstName: Peter
    lastName: Weber
    gender: man
    birthYear: null
    deathYear: null
    position: null
  - id: child
    firstName: Lina
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
relationships:
  - id: parent-1-child
    type: parent-child
    fromId: parent-1
    toId: child
    status: explicit
    sourceUrl: null
  - id: parent-2-child
    type: parent-child
    fromId: parent-2
    toId: child
    status: explicit
    sourceUrl: null
  - id: parent-b-child
    type: parent-child
    fromId: parent-b
    toId: child
    status: explicit
    sourceUrl: null`
    vi.stubGlobal('showOpenFilePicker', vi.fn().mockResolvedValue([{
      getFile: async () => new File([treeYaml], 'parents.yaml', { type: 'text/yaml' }),
    }]))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: parents.yaml')).toBeVisible())

    const personNodes = [...document.querySelectorAll('.person-node')]
    const annaNodes = personNodes.filter((node) => node.textContent?.includes('Anna Weber'))
    expect(annaNodes).toHaveLength(2)
    fireEvent.click(annaNodes[0] as HTMLElement)
    fireEvent.click(screen.getByRole('button', { name: 'Mit anderer Person fusionieren' }))
    fireEvent.click(annaNodes[1] as HTMLElement)

    expect(confirm).toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('mehr als zwei Eltern')
    expect(screen.getByText('5 Personen')).toBeVisible()
  })
})
