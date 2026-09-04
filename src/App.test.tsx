import { fireEvent, render, screen, within } from '@testing-library/react'
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
})
