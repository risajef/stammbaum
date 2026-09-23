import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

const collapseTreeYaml = `schemaVersion: 1
persons:
  - id: mother
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: 1900
    deathYear: null
    position: null
  - id: father
    firstName: Hans
    lastName: Weber
    gender: man
    birthYear: 1898
    deathYear: null
    position: null
  - id: child-a
    firstName: Lina
    lastName: Weber
    gender: woman
    birthYear: 1920
    deathYear: null
    position: null
  - id: child-b
    firstName: Mia
    lastName: Weber
    gender: woman
    birthYear: 1922
    deathYear: null
    position: null
  - id: spouse
    firstName: Paul
    lastName: Weber
    gender: man
    birthYear: 1919
    deathYear: null
    position: null
  - id: grandchild
    firstName: Theo
    lastName: Weber
    gender: man
    birthYear: 1945
    deathYear: null
    position: null
relationships:
  - id: marriage
    type: marriage
    fromId: mother
    toId: father
    status: explicit
    sourceUrl: null
  - id: mother-child-a
    type: parent-child
    fromId: mother
    toId: child-a
    status: explicit
    sourceUrl: null
  - id: father-child-a
    type: parent-child
    fromId: father
    toId: child-a
    status: explicit
    sourceUrl: null
  - id: mother-child-b
    type: parent-child
    fromId: mother
    toId: child-b
    status: explicit
    sourceUrl: null
  - id: father-child-b
    type: parent-child
    fromId: father
    toId: child-b
    status: explicit
    sourceUrl: null
  - id: child-a-marriage
    type: marriage
    fromId: child-a
    toId: spouse
    status: explicit
    sourceUrl: null
  - id: child-b-marriage
    type: marriage
    fromId: child-b
    toId: spouse
    status: explicit
    sourceUrl: null
  - id: child-a-grandchild
    type: parent-child
    fromId: child-a
    toId: grandchild
    status: explicit
    sourceUrl: null`

const duplicatePairsYaml = `schemaVersion: 1
persons:
  - id: anna-a
    firstName: Anna
    lastName: Weber
    gender: null
    birthYear: 1900-05-20
    deathYear: null
    position: null
  - id: anna-b
    firstName: Anna
    lastName: Weber
    gender: null
    birthYear: 1900-05-20
    deathYear: null
    position: null
  - id: berta-a
    firstName: Berta
    lastName: Weber
    gender: null
    birthYear: 1910-05
    deathYear: null
    position: null
  - id: berta-b
    firstName: Berta
    lastName: Weber
    gender: null
    birthYear: 1910-05-20
    deathYear: null
    position: null
  - id: clara-a
    firstName: Clara
    lastName: Weber
    gender: null
    birthYear: null
    deathYear: null
    position: null
  - id: clara-b
    firstName: Clara
    lastName: Weber
    gender: null
    birthYear: null
    deathYear: null
    position: null
relationships: []`

const stubYamlOpen = (contents: string, name = 'children.yaml') => {
  vi.stubGlobal('showOpenFilePicker', vi.fn().mockResolvedValue([{
    getFile: async () => new File([contents], name, { type: 'text/yaml' }),
  }]))
}

const edgeById = async (id: string) => {
  await waitFor(() =>
    expect(document.querySelector(`[data-testid="rf__edge-${id}"]`)).toBeInTheDocument(),
  )
  return document.querySelector(`[data-testid="rf__edge-${id}"]`) as HTMLElement
}

const childGroupNode = () =>
  document.querySelector('[data-testid="child-group-node-children-group:marriage"]')

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

  it('uses compact stacked names without redundant gender labels on person cards', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Anna' } })
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Weber' } })
    fireEvent.change(screen.getByLabelText('Geschlecht'), { target: { value: 'woman' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    const node = (await screen.findByText('Anna Weber')).closest('.person-node')
    const name = node?.querySelector('.person-node-name')

    expect(name).toBeInTheDocument()
    expect(name?.textContent).toBe('Anna\nWeber')
    expect(node?.querySelector('.person-node-glyph')).not.toBeInTheDocument()
    expect(node?.querySelector('.person-node-gender')).not.toBeInTheDocument()
    expect(node).toHaveClass('person-node--woman')
    expect(node?.querySelector('.react-flow__handle-left')).toBeInTheDocument()
  })

  it('colors person nodes by gender and uses a lighter variant for minors', async () => {
    render(<App />)

    const addPerson = async (
      firstName: string,
      gender?: 'woman' | 'man',
      birthYear?: string,
      deathYear?: string,
    ) => {
      fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
      fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: firstName } })
      fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Farbe' } })
      if (gender) {
        fireEvent.change(screen.getByLabelText('Geschlecht'), { target: { value: gender } })
      }
      if (birthYear) {
        fireEvent.change(screen.getByLabelText('Geburtsdatum'), { target: { value: birthYear } })
      }
      if (deathYear) {
        fireEvent.change(screen.getByLabelText('Todesdatum'), { target: { value: deathYear } })
      }
      fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
      await screen.findByText(`${firstName} Farbe`)
    }

    await addPerson('FrauAlt', 'woman', '1900', '1970')
    await addPerson('MannAlt', 'man', '1900', '1970')
    await addPerson('FrauJung', 'woman', '1900', '1917')
    await addPerson('MannJung', 'man', '1900', '1917')
    await addPerson('Unbekannt', undefined, '1900', '1910')

    const nodeFor = (firstName: string) => screen.getByText(`${firstName} Farbe`).closest('.person-node')
    const womanAdult = nodeFor('FrauAlt')
    const manAdult = nodeFor('MannAlt')
    const womanMinor = nodeFor('FrauJung')
    const manMinor = nodeFor('MannJung')
    const unknown = nodeFor('Unbekannt')

    expect(womanAdult).toHaveClass('person-node--woman')
    expect(womanAdult).not.toHaveClass('person-node--minor')
    expect(manAdult).toHaveClass('person-node--man')
    expect(manAdult).not.toHaveClass('person-node--minor')
    expect(womanMinor).toHaveClass('person-node--woman', 'person-node--minor')
    expect(manMinor).toHaveClass('person-node--man', 'person-node--minor')
    expect(unknown).toHaveClass('person-node--unknown')
    expect(unknown).not.toHaveClass('person-node--woman', 'person-node--man', 'person-node--minor')
    expect(womanMinor?.querySelector('.react-flow__handle-left')).toBeInTheDocument()
    expect(manMinor?.querySelector('.react-flow__handle-right')).toBeInTheDocument()
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

  it('shows ranked same-name duplicate pairs, including pairs without birth dates', async () => {
    stubYamlOpen(duplicatePairsYaml)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())

    const duplicatePanel = await screen.findByRole('region', { name: 'Duplikate' })
    const pairs = within(duplicatePanel).getAllByRole('listitem')

    expect(pairs).toHaveLength(3)
    expect(pairs.map((pair) => pair.textContent)).toEqual([
      expect.stringContaining('Priorität 1'),
      expect.stringContaining('Priorität 2'),
      expect.stringContaining('Priorität 4'),
    ])
    expect(within(duplicatePanel).getAllByRole('button', { name: 'Anna Weber' })).toHaveLength(2)
    expect(within(duplicatePanel).getAllByRole('button', { name: 'Clara Weber' })).toHaveLength(2)
  })

  it('can independently collapse and reopen the duplicate and OCR panels', async () => {
    stubYamlOpen(duplicatePairsYaml)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())

    const duplicatePanel = await screen.findByRole('region', { name: 'Duplikate' })
    const ocrPanel = screen.getByRole('region', { name: 'OCR-Vorschläge' })
    expect(within(duplicatePanel).getAllByRole('listitem')).toHaveLength(3)
    expect(within(ocrPanel).getByText('Keine Vorschläge')).toBeVisible()

    fireEvent.click(within(duplicatePanel).getByRole('button', { name: 'Duplikate ausblenden' }))
    expect(within(duplicatePanel).queryByRole('list')).not.toBeInTheDocument()
    expect(within(ocrPanel).getByText('Keine Vorschläge')).toBeVisible()

    fireEvent.click(within(duplicatePanel).getByRole('button', { name: 'Duplikate einblenden' }))
    expect(within(duplicatePanel).getAllByRole('listitem')).toHaveLength(3)

    fireEvent.click(within(ocrPanel).getByRole('button', { name: 'OCR-Vorschläge ausblenden' }))
    expect(within(ocrPanel).queryByText('Keine Vorschläge')).not.toBeInTheDocument()
    expect(within(duplicatePanel).getAllByRole('listitem')).toHaveLength(3)

    fireEvent.click(within(ocrPanel).getByRole('button', { name: 'OCR-Vorschläge einblenden' }))
    expect(within(ocrPanel).getByText('Keine Vorschläge')).toBeVisible()
  })

  it('navigates from a duplicate pair to a filtered-out person without dirtying the document', async () => {
    stubYamlOpen(duplicatePairsYaml)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())

    const annaNode = screen
      .getAllByText('Anna Weber')
      .map((element) => element.closest('.person-node'))
      .find((node): node is HTMLElement => Boolean(node))
    expect(annaNode).toBeTruthy()
    fireEvent.click(annaNode as HTMLElement)
    fireEvent.click(screen.getByLabelText('Lokale Ansicht'))
    fireEvent.change(screen.getByLabelText('Distanz'), { target: { value: '0' } })

    const duplicatePanel = screen.getByRole('region', { name: 'Duplikate' })
    fireEvent.click(within(duplicatePanel).getAllByRole('button', { name: 'Clara Weber' })[0])

    await waitFor(() => expect(screen.getByLabelText('Vorname')).toHaveValue('Clara'))
    expect(screen.getByLabelText('Lokale Ansicht')).not.toBeChecked()
    expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
  })

  it('clears a selected person when the leaf filter hides it', async () => {
    const leafYaml = `schemaVersion: 1
persons:
  - id: leaf
    firstName: Leaf
    lastName: Test
    gender: null
    birthYear: null
    deathYear: null
    position: null
relationships: []`
    stubYamlOpen(leafYaml, 'leaf.yaml')

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: leaf.yaml')).toBeVisible())
    fireEvent.click(await screen.findByText('Leaf Test'))
    expect(screen.getByRole('heading', { name: 'Person bearbeiten' })).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Leafs ausblenden'))

    expect(screen.queryByText('Leaf Test')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wähle ein Objekt' })).toBeInTheDocument()
  })

  it('applies local and blood-relative filters to the selected view', async () => {
    const filterYaml = `schemaVersion: 1
persons:
  - id: first
    firstName: Erste
    lastName: Test
    gender: null
    birthYear: null
    deathYear: null
    position: null
  - id: second
    firstName: Zweite
    lastName: Test
    gender: null
    birthYear: null
    deathYear: null
    position: null
  - id: anchor
    firstName: Anker
    lastName: Test
    gender: null
    birthYear: null
    deathYear: null
    position: null
relationships: []`
    stubYamlOpen(filterYaml, 'filter.yaml')

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: filter.yaml')).toBeVisible())
    fireEvent.click(await screen.findByText('Anker Test'))

    fireEvent.click(screen.getByLabelText('Lokale Ansicht'))
    fireEvent.change(screen.getByLabelText('Distanz'), { target: { value: '0' } })

    expect(screen.getByText('1 von 3 sichtbar')).toBeInTheDocument()
    expect(screen.getByText('Anker Test')).toBeInTheDocument()
    expect(screen.queryByText('Zweite Test')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Lokale Ansicht'))
    fireEvent.click(screen.getByRole('button', { name: 'Nur Blutsverwandte' }))

    expect(screen.getByText('1 von 3 sichtbar')).toBeInTheDocument()
    expect(screen.getByText('Anker Test')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Person bearbeiten' })).toBeInTheDocument()
  })

  it('offers bloodline actions that apply only on explicit clicks', async () => {
    const filterYaml = `schemaVersion: 1
persons:
  - id: anchor
    firstName: Anchor
    lastName: Test
    gender: null
    birthYear: null
    deathYear: null
    position: null
  - id: ancestor
    firstName: Ancestor
    lastName: Test
    gender: woman
    birthYear: null
    deathYear: null
    position: null
  - id: ancestor-partner
    firstName: Ancestor
    lastName: Partner
    gender: man
    birthYear: null
    deathYear: null
    position: null
  - id: other
    firstName: Other
    lastName: Test
    gender: null
    birthYear: null
    deathYear: null
    position: null
relationships:
  - id: ancestor-anchor
    type: parent-child
    fromId: ancestor
    toId: anchor
    status: explicit
    sourceUrl: null
  - id: ancestor-marriage
    type: marriage
    fromId: ancestor
    toId: ancestor-partner
    status: explicit
    sourceUrl: null`
    stubYamlOpen(filterYaml, 'filters.yaml')

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: filters.yaml')).toBeVisible())

    const allPeople = screen.getByRole('button', { name: 'Alle Personen' })
    const bloodFilter = screen.getByRole('button', { name: 'Nur Blutsverwandte' })
    const directFilter = screen.getByRole('button', { name: 'Direkte Vorfahren' })
    const extendedFilter = screen.getByRole('button', { name: 'Erweiterte direkte Vorfahren' })
    const descendantsFilter = screen.getByRole('button', { name: 'Nachkommen' })
    const extendedDescendantsFilter = screen.getByRole('button', { name: 'Erweiterte Nachkommen' })
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
    expect(allPeople).toHaveAttribute('type', 'button')
    expect(bloodFilter).toHaveAttribute('type', 'button')
    expect(directFilter).toHaveAttribute('type', 'button')
    expect(extendedFilter).toHaveAttribute('type', 'button')
    expect(descendantsFilter).toHaveAttribute('type', 'button')
    expect(extendedDescendantsFilter).toHaveAttribute('type', 'button')
    expect(bloodFilter).not.toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(directFilter)
    expect(screen.getByText('4 Personen')).toBeVisible()

    fireEvent.click(screen.getByText('Anchor Test'))
    fireEvent.click(directFilter)
    expect(screen.getByText('3 von 4 sichtbar')).toBeVisible()
    expect(screen.getByLabelText('Vorname')).toHaveValue('Anchor')

    fireEvent.click(screen.getByText('Ancestor Partner'))
    expect(screen.getByText('3 von 4 sichtbar')).toBeVisible()
    expect(screen.getByLabelText('Vorname')).toHaveValue('Ancestor')

    fireEvent.click(directFilter)
    expect(screen.getByText('1 von 4 sichtbar')).toBeVisible()
    expect(screen.getByText('Ancestor Partner')).toBeVisible()

    fireEvent.click(allPeople)
    expect(screen.getByText('4 Personen')).toBeVisible()
  })

  it('applies descendant actions only to the person selected at click time', async () => {
    const filterYaml = `schemaVersion: 1
persons:
  - id: anchor
    firstName: Anchor
    lastName: Person
    gender: null
    birthYear: null
    deathYear: null
    position: null
  - id: child
    firstName: Child
    lastName: Person
    gender: null
    birthYear: null
    deathYear: null
    position: null
  - id: grandchild
    firstName: Grandchild
    lastName: Person
    gender: woman
    birthYear: null
    deathYear: null
    position: null
  - id: grandchild-partner
    firstName: Partner
    lastName: Person
    gender: man
    birthYear: null
    deathYear: null
    position: null
  - id: partner-child
    firstName: Partner
    lastName: Child
    gender: null
    birthYear: null
    deathYear: null
    position: null
  - id: separate
    firstName: Separate
    lastName: Person
    gender: null
    birthYear: null
    deathYear: null
    position: null
relationships:
  - id: anchor-child
    type: parent-child
    fromId: anchor
    toId: child
    status: explicit
    sourceUrl: null
  - id: child-grandchild
    type: parent-child
    fromId: child
    toId: grandchild
    status: explicit
    sourceUrl: null
  - id: grandchild-partner-link
    type: marriage
    fromId: grandchild
    toId: grandchild-partner
    status: explicit
    sourceUrl: null
  - id: partner-child-link
    type: parent-child
    fromId: grandchild-partner
    toId: partner-child
    status: explicit
    sourceUrl: null`
    stubYamlOpen(filterYaml, 'descendants.yaml')

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: descendants.yaml')).toBeVisible())

    const descendantsFilter = screen.getByRole('button', { name: 'Nachkommen' })
    const extendedDescendantsFilter = screen.getByRole('button', { name: 'Erweiterte Nachkommen' })
    fireEvent.click(screen.getByText('Anchor Person'))
    fireEvent.click(descendantsFilter)

    expect(screen.getByText('4 von 6 sichtbar')).toBeVisible()
    expect(screen.getByText('Child Person')).toBeVisible()
    expect(screen.getByText('Grandchild Person')).toBeVisible()
    expect(screen.getByText('Partner Child')).toBeVisible()
    expect(screen.queryByText('Partner Person')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Child Person'))
    expect(screen.getByText('4 von 6 sichtbar')).toBeVisible()
    expect(screen.getByLabelText('Vorname')).toHaveValue('Child')

    fireEvent.click(descendantsFilter)
    expect(screen.getByText('3 von 6 sichtbar')).toBeVisible()
    expect(screen.queryByText('Anchor Person')).not.toBeInTheDocument()

    fireEvent.click(extendedDescendantsFilter)
    expect(screen.getByText('4 von 6 sichtbar')).toBeVisible()
    expect(screen.getByText('Partner Person')).toBeVisible()
    expect(screen.getByText('Partner Child')).toBeVisible()
  })

  it('keeps a newly created person visible until the YAML is saved', async () => {
    const filterYaml = `schemaVersion: 1
persons:
  - id: anchor
    firstName: Anchor
    lastName: Test
    gender: null
    birthYear: null
    deathYear: null
    position: null
relationships: []`
    const write = vi.fn().mockResolvedValue(undefined)
    const close = vi.fn().mockResolvedValue(undefined)
    stubYamlOpen(filterYaml, 'filters.yaml')
    vi.stubGlobal('showSaveFilePicker', vi.fn().mockResolvedValue({
      createWritable: vi.fn().mockResolvedValue({ write, close }),
    }))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: filters.yaml')).toBeVisible())

    fireEvent.click(screen.getByText('Anchor Test'))
    fireEvent.click(screen.getByRole('button', { name: 'Nur Blutsverwandte' }))
    expect(screen.getByText('1 von 1 sichtbar')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Neu' } })
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Person' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(await screen.findByText('Neu Person')).toBeVisible()
    expect(screen.getByText('2 von 2 sichtbar')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    await waitFor(() => expect(write).toHaveBeenCalledOnce())
    await waitFor(() => expect(screen.queryByText('Neu Person')).not.toBeInTheDocument())
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
    expect(screen.getAllByText('Anna Weber')).toHaveLength(4)
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
    const annaNodes = personNodes.filter((node) =>
      node.querySelector('.person-node-name')?.textContent?.replace(/\s+/g, ' ').trim() === 'Anna Weber')
    expect(annaNodes).toHaveLength(2)
    fireEvent.click(annaNodes[0] as HTMLElement)
    fireEvent.click(screen.getByRole('button', { name: 'Mit anderer Person fusionieren' }))
    fireEvent.click(annaNodes[1] as HTMLElement)

    expect(confirm).toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('mehr als zwei Eltern')
    expect(screen.getByText('5 Personen')).toBeVisible()
  })

  it('raises and highlights a selected relationship edge', async () => {
    stubYamlOpen(collapseTreeYaml)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())

    const marriageEdge = await edgeById('marriage')
    fireEvent.click(marriageEdge)

    await waitFor(() => expect(document.querySelector('[data-testid="rf__edge-marriage"]'))
      .toHaveClass('selected'))
    const selectedEdge = document.querySelector('[data-testid="rf__edge-marriage"]') as HTMLElement
    const selectedEdgeLayer = selectedEdge.closest('svg')
    expect(selectedEdge).toHaveClass('relationship-edge--selected')
    expect(selectedEdgeLayer).not.toBeNull()
    expect(selectedEdgeLayer).toHaveStyle({ zIndex: '1000' })
    expect(selectedEdge.querySelector('.react-flow__edge-path')).toHaveStyle({
      stroke: '#a84d39',
      strokeWidth: '4',
    })
  })

  it('removes a selected person with all connections after confirmation', async () => {
    stubYamlOpen(collapseTreeYaml)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())

    await waitFor(() => expect(screen.getByText('Anna Weber')).toBeVisible())
    fireEvent.click(screen.getByText('Anna Weber'))
    fireEvent.click(screen.getByRole('button', { name: 'Person entfernen' }))

    expect(confirm).toHaveBeenCalledWith('Person wirklich entfernen?')
    await waitFor(() => expect(screen.queryByText('Anna Weber')).not.toBeInTheDocument())
    expect(screen.getByText('5 Personen')).toBeVisible()
    expect(screen.queryByTestId('rf__edge-marriage')).not.toBeInTheDocument()
    expect(screen.queryByTestId('rf__edge-mother-child-a')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wähle ein Objekt' })).toBeVisible()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
  })

  it('keeps a selected person and its connections when deletion is cancelled', async () => {
    stubYamlOpen(collapseTreeYaml)
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())

    await waitFor(() => expect(screen.getByText('Anna Weber')).toBeVisible())
    fireEvent.click(screen.getByText('Anna Weber'))
    fireEvent.click(screen.getByRole('button', { name: 'Person entfernen' }))

    expect(screen.getByText('Anna Weber')).toBeVisible()
    expect(screen.getByTestId('rf__edge-marriage')).toBeInTheDocument()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
  })

  it('opens a selected child group inspector and reselects its marriage after expanding', async () => {
    const treeYaml = `schemaVersion: 1
persons:
  - id: mother
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: 1900
    deathYear: null
    position: null
  - id: father
    firstName: Hans
    lastName: Weber
    gender: man
    birthYear: 1898
    deathYear: null
    position: null
  - id: child-a
    firstName: Lina
    lastName: Weber
    gender: null
    birthYear: 1920
    deathYear: null
    position: null
  - id: child-b
    firstName: Mia
    lastName: Weber
    gender: null
    birthYear: 1922
    deathYear: null
    position: null
relationships:
  - id: marriage
    type: marriage
    fromId: mother
    toId: father
    status: explicit
    sourceUrl: null
  - id: mother-child-a
    type: parent-child
    fromId: mother
    toId: child-a
    status: explicit
    sourceUrl: null
  - id: father-child-a
    type: parent-child
    fromId: father
    toId: child-a
    status: explicit
    sourceUrl: null
  - id: mother-child-b
    type: parent-child
    fromId: mother
    toId: child-b
    status: explicit
    sourceUrl: null
  - id: father-child-b
    type: parent-child
    fromId: father
    toId: child-b
    status: explicit
    sourceUrl: null`
    vi.stubGlobal('showOpenFilePicker', vi.fn().mockResolvedValue([{
      getFile: async () => new File([treeYaml], 'children.yaml', { type: 'text/yaml' }),
    }]))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())

    await waitFor(() =>
      expect(document.querySelector('[data-testid="rf__edge-marriage"]')).toBeInTheDocument(),
    )
    const marriageEdge = document.querySelector('[data-testid="rf__edge-marriage"]')
    expect(marriageEdge).not.toBeNull()
    fireEvent.click(marriageEdge as HTMLElement)

    fireEvent.click(screen.getByRole('button', { name: '2 gemeinsame Kinder einklappen' }))
    expect(screen.getByText('2 Kinder', { selector: 'strong' })).toBeVisible()

    fireEvent.click(screen.getByText('2 Kinder', { selector: 'strong' }))
    expect(screen.getByText('Kindergruppe', { selector: 'p' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Kinder auffächern' }))
    expect(screen.getByRole('heading', { name: 'Beziehung bearbeiten' })).toBeVisible()
  })

  it('keeps child collapse visual and persistence state separate while preserving external edge identities', async () => {
    stubYamlOpen(collapseTreeYaml)
    const write = vi.fn().mockResolvedValue(undefined)
    const close = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('showSaveFilePicker', vi.fn().mockResolvedValue({
      createWritable: vi.fn().mockResolvedValue({ write, close }),
    }))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())
    fireEvent.click(await edgeById('marriage'))
    fireEvent.click(screen.getByRole('button', { name: '2 gemeinsame Kinder einklappen' }))

    await waitFor(() => expect(childGroupNode()).toBeInTheDocument())
    expect(screen.queryByText('Lina Weber')).not.toBeInTheDocument()
    expect(screen.queryByText('Mia Weber')).not.toBeInTheDocument()
    expect(screen.getByText('6 Personen')).toBeVisible()
    expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
    expect([...document.querySelectorAll('.react-flow__edge[data-id]')].map((edge) => edge.getAttribute('data-id')))
      .toEqual([
        'marriage',
        'mother-child-a',
        'father-child-a',
        'mother-child-b',
        'father-child-b',
        'child-a-marriage',
        'child-b-marriage',
        'child-a-grandchild',
        'inferred-spouse-grandchild',
      ])

    fireEvent.click(await edgeById('child-a-marriage'))
    expect(screen.getByText('Lina Weber', { selector: 'strong' })).toBeVisible()
    fireEvent.click(await edgeById('child-b-marriage'))
    expect(screen.getByText('Mia Weber', { selector: 'strong' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    await waitFor(() => expect(write).toHaveBeenCalledOnce())
    const savedYaml = write.mock.calls[0]?.[0] as string
    expect(savedYaml).toContain('id: child-a')
    expect(savedYaml).toContain('id: child-b-marriage')
    expect(savedYaml).not.toContain('children-group:marriage')
  })

  it('discards child groups when a new document or a person change replaces the view', async () => {
    stubYamlOpen(collapseTreeYaml)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())
    fireEvent.click(await edgeById('marriage'))
    fireEvent.click(screen.getByRole('button', { name: '2 gemeinsame Kinder einklappen' }))
    await waitFor(() => expect(childGroupNode()).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Neu' }))
    expect(screen.getByText('Leer')).toBeVisible()
    expect(childGroupNode()).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())
    fireEvent.click(await edgeById('marriage'))
    fireEvent.click(screen.getByRole('button', { name: '2 gemeinsame Kinder einklappen' }))
    await waitFor(() => expect(childGroupNode()).toBeInTheDocument())

    fireEvent.click(screen.getByText('Anna Weber'))
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    await waitFor(() => expect(screen.getByText('Lina Weber')).toBeVisible())
    expect(childGroupNode()).not.toBeInTheDocument()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
  })

  it('temporarily expands groups for filters and expands a matching child from search', async () => {
    stubYamlOpen(collapseTreeYaml)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())
    fireEvent.click(await edgeById('marriage'))
    fireEvent.click(screen.getByRole('button', { name: '2 gemeinsame Kinder einklappen' }))
    await waitFor(() => expect(childGroupNode()).toBeInTheDocument())

    fireEvent.click(screen.getByLabelText('Leafs ausblenden'))
    expect(childGroupNode()).not.toBeInTheDocument()
    expect(screen.getByText('Lina Weber')).toBeVisible()
    expect(screen.queryByText('Mia Weber')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Leafs ausblenden'))
    await waitFor(() => expect(childGroupNode()).toBeInTheDocument())
    expect(screen.queryByText('Lina Weber')).not.toBeInTheDocument()
    expect(screen.queryByText('Mia Weber')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Personensuche'), { target: { value: 'Lina' } })
    expect(screen.getByText('1 Treffer')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Nächster Treffer' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Person bearbeiten' })).toBeVisible())
    expect(screen.getByText('Lina Weber')).toBeVisible()
    expect(childGroupNode()).not.toBeInTheDocument()
    expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
  })

  it('shows the filtered graph in a read-only force view', async () => {
    stubYamlOpen(collapseTreeYaml)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
    await waitFor(() => expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible())

    fireEvent.click(screen.getByRole('button', { name: 'Federungsansicht' }))

    expect(screen.getByText('Federungsansicht', { selector: 'p' })).toBeVisible()
    expect(screen.getByText('Anna Weber')).toBeInTheDocument()
    expect(screen.getByText('Theo Weber')).toBeInTheDocument()
    expect(screen.getByText('Diese Ansicht ist schreibgeschützt.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Person anlegen' })).toBeDisabled()
    expect(screen.queryByRole('heading', { name: 'Person bearbeiten' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Leafs ausblenden'))

    expect(screen.queryByText('Theo Weber')).not.toBeInTheDocument()
    expect(screen.getByText('Geöffnet: children.yaml')).toBeVisible()
    expect(screen.queryByText('Ungespeichert')).not.toBeInTheDocument()
  })
})
