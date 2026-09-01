import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import PersonInspector from './PersonInspector'
import type { DomainError, Person } from '../domain/types'

const person: Person = {
  id: 'person-1',
  firstName: 'Anna',
  lastName: 'Weber',
  gender: 'woman',
  birthYear: 1834,
  deathYear: 1901,
  position: { x: 100, y: 80 },
}

describe('PersonInspector', () => {
  it('creates a person with complete details', () => {
    const onSave = vi.fn()

    render(<PersonInspector person={null} onSave={onSave} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Anna' } })
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Weber' } })
    fireEvent.change(screen.getByLabelText('Geschlecht'), { target: { value: 'woman' } })
    fireEvent.change(screen.getByLabelText('Geburtsjahr'), { target: { value: '1834' } })
    fireEvent.change(screen.getByLabelText('Todesjahr'), { target: { value: '1901' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(onSave).toHaveBeenCalledWith({
      firstName: 'Anna',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: 1834,
      deathYear: 1901,
      position: null,
      comment: null,
    })
  })

  it('edits an existing person and keeps position out of the form changes', () => {
    const onSave = vi.fn()

    render(<PersonInspector person={person} onSave={onSave} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Walter' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(onSave).toHaveBeenCalledWith({
      firstName: 'Anna',
      lastName: 'Walter',
      gender: 'woman',
      birthYear: 1834,
      deathYear: 1901,
      position: { x: 100, y: 80 },
      comment: null,
    })
  })

  it('edits a person comment', () => {
    const onSave = vi.fn()

    render(<PersonInspector person={person} onSave={onSave} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Kommentar'), {
      target: { value: 'Unsichere Zuordnung.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ comment: 'Unsichere Zuordnung.' }),
    )
  })

  it('submits empty life years as null and can discard edits', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(<PersonInspector person={person} onSave={onSave} onCancel={onCancel} />)

    fireEvent.change(screen.getByLabelText('Geburtsjahr'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Todesjahr'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
    fireEvent.click(screen.getByRole('button', { name: 'Verwerfen' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ birthYear: null, deathYear: null }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows the domain error next to the affected field', () => {
    const error: DomainError = {
      code: 'required',
      message: 'Der Vorname ist erforderlich.',
      field: 'firstName',
    }
    const onSave = vi.fn(() => error)

    render(<PersonInspector person={null} onSave={onSave} onCancel={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(screen.getByText('Der Vorname ist erforderlich.')).toBeVisible()
    expect(screen.getByLabelText('Vorname')).toHaveAttribute('aria-invalid', 'true')
  })
})