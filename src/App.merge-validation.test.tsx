import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

const sourceYaml = (relationshipId: string) => JSON.stringify({
  schemaVersion: 1,
  persons: [
    {
      id: 'parent',
      firstName: 'Ada',
      lastName: 'Test',
      gender: null,
      birthYear: null,
      deathYear: null,
      position: null,
    },
    {
      id: 'child',
      firstName: 'Lina',
      lastName: 'Test',
      gender: null,
      birthYear: null,
      deathYear: null,
      position: null,
    },
  ],
  relationships: [{
    id: relationshipId,
    type: 'parent-child',
    fromId: 'parent',
    toId: 'child',
    status: 'explicit',
    sourceUrl: null,
  }],
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('family-tree merge validation', () => {
  it('preserves dirty work when the union contains duplicate relationships with distinct IDs', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const picker = vi.fn().mockResolvedValue([
      { name: 'Ruth.yaml', contents: sourceYaml('ruth-parent-child') },
      { name: 'Ernst.yaml', contents: sourceYaml('ernst-parent-child') },
    ].map(({ name, contents }) => ({
      getFile: async () => new File([contents], name, { type: 'text/yaml' }),
    })))
    vi.stubGlobal('showOpenFilePicker', picker)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Person anlegen' }))
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Lokal' } })
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
    await screen.findByText('Lokal Test')
    fireEvent.click(screen.getByRole('button', { name: 'Stammbäume fusionieren' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Eltern-Kind-Beziehung kommt mehrfach vor')
    expect(alert).toHaveTextContent('Ruth.yaml')
    expect(alert).toHaveTextContent('Ernst.yaml')
    expect(screen.getByText('1 Person')).toBeVisible()
    expect(screen.getByText('Lokal Test')).toBeVisible()
    expect(screen.getByText('Ungespeichert')).toBeVisible()
    expect(picker).toHaveBeenCalledWith({ multiple: true })
  })
})
