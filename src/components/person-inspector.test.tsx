import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import PersonInspector from './PersonInspector'
import type { DomainError, Person, PersonDraft } from '../domain/types'

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
    fireEvent.change(screen.getByLabelText('Geburtsdatum'), { target: { value: '1834' } })
    fireEvent.change(screen.getByLabelText('Todesdatum'), { target: { value: '1901' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(onSave).toHaveBeenCalledWith({
      firstName: 'Anna',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: '1834',
      deathYear: '1901',
      position: null,
      comment: null,
    })
  })

  it('prefills an OCR draft, keeps its fields editable, and only saves after submit', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    const initialDraft: PersonDraft = {
      firstName: 'Lina',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: '1840-05-12',
      deathYear: null,
      position: null,
      comment: 'OCR-Hinweis',
    }

    render(
      <PersonInspector
        person={null}
        initialDraft={initialDraft}
        onSave={onSave}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByLabelText('Vorname')).toHaveValue('Lina')
    expect(screen.getByLabelText('Nachname')).toHaveValue('Weber')
    expect(screen.getByLabelText('Geburtsdatum')).toHaveValue('1840-05-12')
    expect(screen.getByLabelText('Kommentar')).toHaveValue('OCR-Hinweis')

    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Lina-Marie' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verwerfen' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Lina-Marie' }))
  })

  it('submits birth and death as partial date strings from single fields', () => {
    const onSave = vi.fn()

    render(<PersonInspector person={null} onSave={onSave} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Anna' } })
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Weber' } })
    fireEvent.change(screen.getByLabelText('Geburtsdatum'), { target: { value: '1900-05' } })
    fireEvent.change(screen.getByLabelText('Todesdatum'), { target: { value: '1970-08-12' } })
    fireEvent.click(screen.getByRole('button', { name: 'Person speichern' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        birthYear: '1900-05',
        deathYear: '1970-08-12',
      }),
    )
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
      birthYear: '1834',
      deathYear: '1901',
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

    fireEvent.change(screen.getByLabelText('Geburtsdatum'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Todesdatum'), { target: { value: '' } })
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
