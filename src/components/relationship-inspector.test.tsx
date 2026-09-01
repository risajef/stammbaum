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
      target: { value: 'Annahme pruefen.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Beziehung speichern' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ comment: 'Annahme pruefen.' }),
    )
    expect(screen.getByLabelText('Status')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Beziehung entfernen' })).toBeNull()
  })
})