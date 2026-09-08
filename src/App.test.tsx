import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'

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
})
