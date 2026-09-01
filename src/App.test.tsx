import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('application workbench', () => {
  it('adds a person through the inspector and displays it on the canvas', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Ada' } })
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Lovelace' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('1 Person')).toBeVisible()
  })
})