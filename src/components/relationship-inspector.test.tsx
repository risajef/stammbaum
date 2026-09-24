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
  it('allows confirming an inferred relationship', () => {
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
    expect(screen.getByLabelText('Status')).not.toBeDisabled()
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'explicit' } })
    fireEvent.change(screen.getByLabelText('Kommentar'), {
      target: { value: 'Annahme prüfen.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Beziehung speichern' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'explicit', comment: 'Annahme prüfen.' }),
    )
    expect(screen.queryByRole('button', { name: 'Beziehung entfernen' })).toBeNull()
  })

  it.each([
    ['manual', 'Manuell'],
    ['ocr-suggestion', 'OCR-Vorschlag'],
    ['automatic-inference', 'Automatische Ableitung'],
  ] as const)('shows the %s relationship origin as a visible badge', (origin, label) => {
    render(
      <RelationshipInspector
        relationship={{ ...marriage, origin }}
        sourcePerson={sourcePerson}
        targetPerson={targetPerson}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText(label)).toHaveClass(`relationship-origin--${origin}`)
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

  it('uses the type supplied by a new handle connection and keeps metadata optional', () => {
    const onSave = vi.fn()

    render(
      <RelationshipInspector
        relationship={null}
        relationshipType="parent-child"
        sourcePerson={sourcePerson}
        targetPerson={targetPerson}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Beziehungstyp')).toHaveValue('parent-child')
    expect(screen.getByLabelText('Beziehungstyp')).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Beziehung speichern' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        relationshipType: 'parent-child',
        sourceUrl: '',
        comment: '',
      }),
    )
  })

  it('offers collapsing when a marriage has at least two common children', () => {
    const onCollapseChildren = vi.fn()
    const commonChildren = [
      { ...sourcePerson, id: 'child-a', firstName: 'Lina' },
      { ...targetPerson, id: 'child-b', firstName: 'Mia' },
    ]

    render(
      <RelationshipInspector
        relationship={marriage}
        sourcePerson={sourcePerson}
        targetPerson={{ ...targetPerson, gender: 'man' }}
        commonChildren={commonChildren}
        onCollapseChildren={onCollapseChildren}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '2 gemeinsame Kinder einklappen' }))

    expect(onCollapseChildren).toHaveBeenCalledOnce()
  })

  it.each([
    ['one child', [{ ...sourcePerson, id: 'child-a' }]],
    ['an overlapping group', [
      { ...sourcePerson, id: 'child-a' },
      { ...targetPerson, id: 'child-b' },
    ]],
  ])('does not offer collapsing for %s', (_caseName, commonChildren) => {
    render(
      <RelationshipInspector
        relationship={marriage}
        sourcePerson={sourcePerson}
        targetPerson={{ ...targetPerson, gender: 'man' }}
        commonChildren={commonChildren}
        canCollapseChildren={_caseName === 'one child'}
        onCollapseChildren={vi.fn()}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: /gemeinsame Kinder einklappen/ })).toBeNull()
  })
})
