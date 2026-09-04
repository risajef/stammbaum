import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import RelationshipInspector from './RelationshipInspector'
import type { Person, Relationship } from '../domain/types'

const sourcePerson: Person = {
  id: 'parent-a',
  firstName: 'Anna',
  lastName: 'Weber',
  gender: 'woman',
  birthYear: 1900,
  deathYear: null,
  position: null,
}

const targetPerson: Person = {
  id: 'child-c',
  firstName: 'Lina',
  lastName: 'Weber',
  gender: 'woman',
  birthYear: 1925,
  deathYear: null,
  position: null,
}

const relationship: Relationship = {
  id: 'inferred-parent-c',
  type: 'parent-child',
  fromId: 'spouse-b',
  toId: 'child-c',
  status: 'inferred',
  sourceUrl: null,
  comment: 'Automatisch abgeleitet.',
  inferredFrom: {
    rule: 'spouse-parent',
    sourceRelationshipId: 'parent-a-child-c',
  },
}

const marriage: Relationship = {
  id: 'marriage-1',
  type: 'marriage',
  fromId: 'parent-a',
  toId: 'child-c',
  startDate: '1880-05',
  status: 'explicit',
  sourceUrl: null,
  comment: null,
  inferredFrom: null,
}

describe('RelationshipInspector', () => {
  it('shows and edits the comment of an inferred relationship', () => {
    const onSave = vi.fn()
    const onRemove = vi.fn()

    render(
      <RelationshipInspector
        relationship={relationship}
        sourcePerson={sourcePerson}
        targetPerson={targetPerson}
        onSave={onSave}
        onCancel={vi.fn()}
        onRemove={onRemove}
      />,
    )

    expect(screen.getByText('Automatisch abgeleitet.', { selector: 'p' })).toBeVisible()
    fireEvent.change(screen.getByLabelText('Kommentar'), {
      target: { value: 'Annahme prüfen.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Beziehung speichern' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ comment: 'Annahme prüfen.' }),
    )
    expect(screen.getByLabelText('Status')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Beziehung entfernen' })).toBeNull()
  })

  it('shows a marriage start date and its implicit end date', () => {
    const onSave = vi.fn()
    const source = { ...sourcePerson, deathYear: '1925-08-12' }
    const target = { ...targetPerson, gender: 'man' as const, deathYear: '1920-03-01' }

    render(
      <RelationshipInspector
        relationship={marriage}
        sourcePerson={source}
        targetPerson={target}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Ehebeginn')).toHaveValue('1880-05')
    expect(screen.getByText('1920-03-01', { selector: 'output' })).toBeVisible()
  })

  it('shows a start-date validation error without hiding the field', () => {
    const onSave = vi.fn(() => ({
      code: 'invalid-date',
      message: 'Das Datum muss im Format YYYY, YYYY-MM oder YYYY-MM-DD angegeben werden.',
      field: 'startDate',
    }))

    render(
      <RelationshipInspector
        relationship={marriage}
        sourcePerson={sourcePerson}
        targetPerson={targetPerson}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('Ehebeginn'), { target: { value: '1900-02-29' } })
    fireEvent.click(screen.getByRole('button', { name: 'Beziehung speichern' }))

    expect(screen.getByText('Das Datum muss im Format YYYY, YYYY-MM oder YYYY-MM-DD angegeben werden.')).toBeVisible()
  })
})