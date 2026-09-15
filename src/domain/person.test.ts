import { describe, expect, it } from 'vitest'

import { createEmptyDocument, createPerson, mergePersons, updatePerson } from './person'
import type { FamilyTreeDocument, Person, Relationship, RelationshipType } from './types'

const mergePerson = (id: string, changes: Partial<Person> = {}): Person => ({
  id,
  firstName: 'Anna',
  lastName: 'Weber',
  gender: 'woman',
  birthYear: null,
  deathYear: null,
  position: null,
  comment: null,
  ...changes,
})

const mergeRelationship = (
  id: string,
  type: RelationshipType,
  fromId: string,
  toId: string,
  changes: Partial<Relationship> = {},
): Relationship => ({
  id,
  type,
  fromId,
  toId,
  ...(type === 'marriage' ? { startDate: null } : {}),
  status: 'explicit',
  sourceUrl: null,
  comment: null,
  inferredFrom: null,
  origin: 'manual',
  ...changes,
})

const mergeDocument = (
  persons: Person[],
  relationships: Relationship[] = [],
): FamilyTreeDocument => ({
  schemaVersion: 1,
  persons,
  relationships,
})

describe('person domain operations', () => {
  it('creates a person with complete details and a stable id', () => {
    const result = createPerson(
      createEmptyDocument(),
      {
        firstName: 'Anna',
        lastName: 'Weber',
        gender: 'woman',
        birthYear: 1834,
        deathYear: 1901,
      },
      () => 'person-1',
    )

    expect(result).toEqual({
      ok: true,
      value: {
        schemaVersion: 1,
        persons: [
          {
            id: 'person-1',
            firstName: 'Anna',
            lastName: 'Weber',
            gender: 'woman',
            birthYear: '1834',
            deathYear: '1901',
            position: null,
            comment: null,
          },
        ],
        relationships: [],
      },
    })
  })

  it('allows unknown gender and life years to remain empty', () => {
    const result = createPerson(
      createEmptyDocument(),
      {
        firstName: 'Johann',
        lastName: 'Weber',
        gender: null,
        birthYear: null,
        deathYear: null,
      },
      () => 'person-1',
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.persons[0]).toMatchObject({
        gender: null,
        birthYear: null,
        deathYear: null,
        position: null,
      })
    }
  })

  it('accepts partial birth and death dates without filling unknown components', () => {
    const result = createPerson(
      createEmptyDocument(),
      {
        firstName: 'Johann',
        lastName: 'Weber',
        birthYear: '1900-05',
        deathYear: '1970-08-12',
      },
      () => 'person-1',
    )

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        persons: [
          expect.objectContaining({
            birthYear: '1900-05',
            deathYear: '1970-08-12',
          }),
        ],
      }),
    })
  })

  it('accepts a life span when the missing day prevents a certain ordering error', () => {
    const result = createPerson(
      createEmptyDocument(),
      {
        firstName: 'Johann',
        lastName: 'Weber',
        birthYear: '1900-05',
        deathYear: '1900-05-01',
      },
      () => 'person-1',
    )

    expect(result.ok).toBe(true)
  })

  it('accepts February 29 in a leap year', () => {
    const result = createPerson(
      createEmptyDocument(),
      {
        firstName: 'Johann',
        lastName: 'Weber',
        birthYear: '2000-02-29',
      },
      () => 'person-1',
    )

    expect(result.ok).toBe(true)
  })

  it('stores a trimmed person comment and normalises an empty comment to null', () => {
    const result = createPerson(
      createEmptyDocument(),
      {
        firstName: 'Anna',
        lastName: 'Weber',
        comment: '  Unsichere Zuordnung.  ',
      },
      () => 'person-1',
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.persons[0]?.comment).toBe('Unsichere Zuordnung.')

    const updated = updatePerson(result.value, 'person-1', { comment: '  ' })
    expect(updated.ok).toBe(true)
    if (updated.ok) {
      expect(updated.value.persons[0]?.comment).toBeNull()
    }
  })

  it('updates person details without changing relationships', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        {
          id: 'person-1',
          firstName: 'Anna',
          lastName: 'Weber',
          gender: 'woman',
          birthYear: 1834,
          deathYear: null,
          position: { x: 10, y: 20 },
        },
        {
          id: 'person-2',
          firstName: 'Johann',
          lastName: 'Weber',
          gender: 'man',
          birthYear: 1830,
          deathYear: null,
          position: { x: 200, y: 20 },
        },
      ],
      relationships: [
        {
          id: 'relationship-1',
          type: 'marriage',
          fromId: 'person-1',
          toId: 'person-2',
          status: 'explicit',
          sourceUrl: null,
        },
      ],
    }

    const result = updatePerson(document, 'person-1', {
      lastName: 'Walter',
      deathYear: 1901,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.persons[0]).toMatchObject({
        lastName: 'Walter',
        deathYear: '1901',
      })
      expect(result.value.relationships).toEqual(document.relationships)
    }
  })

  it.each([
    ['missing first name', { firstName: ' ', lastName: 'Weber' }],
    ['missing last name', { firstName: 'Anna', lastName: '' }],
    ['fractional birth year', { firstName: 'Anna', lastName: 'Weber', birthYear: 1834.5 }],
    ['invalid month', { firstName: 'Anna', lastName: 'Weber', birthYear: '1834-13' }],
    ['invalid day', { firstName: 'Anna', lastName: 'Weber', birthYear: '1834-04-31' }],
    ['invalid leap day', { firstName: 'Anna', lastName: 'Weber', birthYear: '1900-02-29' }],
    [
      'death before birth',
      { firstName: 'Anna', lastName: 'Weber', birthYear: 1901, deathYear: 1834 },
    ],
    [
      'death before birth date',
      { firstName: 'Anna', lastName: 'Weber', birthYear: '1900-05-20', deathYear: '1900-05-19' },
    ],
  ])('rejects %s', (_description, input) => {
    const result = createPerson(createEmptyDocument(), input, () => 'person-1')

    expect(result.ok).toBe(false)
  })

  it('merges missing values and distinct comments into the first person', () => {
    const document = mergeDocument([
      mergePerson('person-1', {
        deathYear: '1901',
        comment: 'Quelle A',
        position: { x: 10, y: 20 },
      }),
      mergePerson('person-2', {
        birthYear: '1834',
        comment: 'Quelle B',
        position: { x: 300, y: 20 },
      }),
    ])

    const result = mergePersons(document, 'person-1', 'person-2')

    expect(result).toMatchObject({
      ok: true,
      value: {
        persons: [
          expect.objectContaining({
            id: 'person-1',
            birthYear: '1834',
            deathYear: '1901',
            comment: 'Quelle A\nQuelle B',
          }),
        ],
        relationships: [],
      },
    })
  })

  it('takes the more precise compatible partial date', () => {
    const document = mergeDocument([
      mergePerson('person-1', { birthYear: '1900' }),
      mergePerson('person-2', { birthYear: '1900-05-20' }),
    ])

    const result = mergePersons(document, 'person-1', 'person-2')

    expect(result).toMatchObject({
      ok: true,
      value: { persons: [expect.objectContaining({ birthYear: '1900-05-20' })] },
    })
  })

  it.each([
    ['last name', { lastName: 'Walter' }, {}],
    ['gender', { gender: 'man' }, {}],
    ['birth date', { birthYear: '1900' }, { birthYear: '1901' }],
    ['death date', { deathYear: '1900' }, { deathYear: '1901' }],
  ] as const)('rejects a conflicting %s without changing the document', (_field, firstChanges, secondChanges) => {
    const document = mergeDocument([
      mergePerson('person-1', firstChanges),
      mergePerson('person-2', secondChanges),
    ])

    const result = mergePersons(document, 'person-1', 'person-2')

    expect(result).toMatchObject({ ok: false, error: { code: 'person-merge-conflict' } })
    expect(document).toEqual(mergeDocument([
      mergePerson('person-1', firstChanges),
      mergePerson('person-2', secondChanges),
    ]))
  })

  it('does not duplicate an identical comment during a merge', () => {
    const document = mergeDocument([
      mergePerson('person-1', { comment: 'Gemeinsame Quelle' }),
      mergePerson('person-2', { comment: 'Gemeinsame Quelle' }),
    ])

    const result = mergePersons(document, 'person-1', 'person-2')

    expect(result).toMatchObject({
      ok: true,
      value: { persons: [expect.objectContaining({ comment: 'Gemeinsame Quelle' })] },
    })
  })

  it('rewrites both relationship endpoints and consolidates duplicate edges', () => {
    const document = mergeDocument(
      [
        mergePerson('person-1'),
        mergePerson('person-2'),
        mergePerson('spouse', { firstName: 'Max', gender: 'man' }),
        mergePerson('parent', { firstName: 'Paul', gender: 'man' }),
        mergePerson('child', { firstName: 'Lina' }),
      ],
      [
        mergeRelationship('marriage-1', 'marriage', 'person-1', 'spouse'),
        mergeRelationship('marriage-2', 'marriage', 'person-2', 'spouse'),
        mergeRelationship('parent-child-1', 'parent-child', 'parent', 'person-1'),
        mergeRelationship('parent-child-2', 'parent-child', 'person-2', 'child'),
      ],
    )

    const result = mergePersons(document, 'person-1', 'person-2')

    expect(result).toMatchObject({
      ok: true,
      value: {
        persons: [
          expect.objectContaining({ id: 'person-1' }),
          expect.objectContaining({ id: 'spouse' }),
          expect.objectContaining({ id: 'parent' }),
          expect.objectContaining({ id: 'child' }),
        ],
        relationships: expect.arrayContaining([
          expect.objectContaining({
            id: 'marriage-1',
            type: 'marriage',
            fromId: 'person-1',
            toId: 'spouse',
          }),
          expect.objectContaining({
            id: 'parent-child-1',
            fromId: 'parent',
            toId: 'person-1',
          }),
          expect.objectContaining({
            id: 'parent-child-2',
            fromId: 'person-1',
            toId: 'child',
          }),
        ]),
      },
    })
    if (result.ok) {
      expect(result.value.persons).toHaveLength(4)
      expect(result.value.relationships).toHaveLength(4)
      expect(result.value.relationships).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fromId: 'person-2' }),
          expect.objectContaining({ toId: 'person-2' }),
        ]),
      )
    }
  })

  it('removes a relationship that would become a self-link', () => {
    const document = mergeDocument(
      [mergePerson('person-1'), mergePerson('person-2')],
      [mergeRelationship('parent-child-1', 'parent-child', 'person-1', 'person-2')],
    )

    const result = mergePersons(document, 'person-1', 'person-2')

    expect(result).toMatchObject({ ok: true, value: { relationships: [] } })
  })

  it('rejects a merge that would give a child more than two unique parents', () => {
    const document = mergeDocument(
      [
        mergePerson('person-1'),
        mergePerson('person-2'),
        mergePerson('parent-1', { firstName: 'Paul' }),
        mergePerson('parent-2', { firstName: 'Peter' }),
        mergePerson('child', { firstName: 'Lina' }),
      ],
      [
        mergeRelationship('parent-child-1', 'parent-child', 'parent-1', 'child'),
        mergeRelationship('parent-child-2', 'parent-child', 'parent-2', 'child'),
        mergeRelationship('parent-child-3', 'parent-child', 'person-2', 'child'),
      ],
    )

    const result = mergePersons(document, 'person-1', 'person-2')

    expect(result).toMatchObject({ ok: false, error: { code: 'person-merge-too-many-parents' } })
    expect(document.relationships).toHaveLength(3)
    expect(document.persons).toHaveLength(5)
  })

  it('re-synchronizes automatic parent relationships after a merge', () => {
    const document = mergeDocument(
      [
        mergePerson('parent-1'),
        mergePerson('parent-2'),
        mergePerson('spouse', { firstName: 'Max', gender: 'man' }),
        mergePerson('child', { firstName: 'Lina' }),
      ],
      [
        mergeRelationship('marriage-1', 'marriage', 'parent-1', 'spouse'),
        mergeRelationship('marriage-2', 'marriage', 'parent-2', 'spouse'),
        mergeRelationship('parent-child-1', 'parent-child', 'parent-1', 'child'),
      ],
    )

    const result = mergePersons(document, 'parent-1', 'parent-2')

    expect(result).toMatchObject({
      ok: true,
      value: {
        relationships: expect.arrayContaining([
          expect.objectContaining({
            type: 'parent-child',
            fromId: 'spouse',
            toId: 'child',
            status: 'inferred',
          }),
        ]),
      },
    })
  })
})
