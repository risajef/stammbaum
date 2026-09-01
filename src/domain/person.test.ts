import { describe, expect, it } from 'vitest'

import { createEmptyDocument, createPerson, updatePerson } from './person'
import type { FamilyTreeDocument } from './types'

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
            birthYear: 1834,
            deathYear: 1901,
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
        deathYear: 1901,
      })
      expect(result.value.relationships).toEqual(document.relationships)
    }
  })

  it.each([
    ['missing first name', { firstName: ' ', lastName: 'Weber' }],
    ['missing last name', { firstName: 'Anna', lastName: '' }],
    ['fractional birth year', { firstName: 'Anna', lastName: 'Weber', birthYear: 1834.5 }],
    [
      'death before birth',
      { firstName: 'Anna', lastName: 'Weber', birthYear: 1901, deathYear: 1834 },
    ],
  ])('rejects %s', (_description, input) => {
    const result = createPerson(createEmptyDocument(), input, () => 'person-1')

    expect(result.ok).toBe(false)
  })
})