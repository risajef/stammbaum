import { describe, expect, it } from 'vitest'

import { synchronizeInferredRelationships } from './inference'
import { removeRelationship } from './relationship'
import type { FamilyTreeDocument } from './types'

const documentWithSingleSpouseParent = (): FamilyTreeDocument => ({
  schemaVersion: 1,
  persons: [
    {
      id: 'parent-a',
      firstName: 'Anna',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: 1900,
      deathYear: null,
      position: null,
    },
    {
      id: 'spouse-b',
      firstName: 'Hans',
      lastName: 'Weber',
      gender: 'man',
      birthYear: 1898,
      deathYear: null,
      position: null,
    },
    {
      id: 'child-c',
      firstName: 'Lina',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: 1925,
      deathYear: null,
      position: null,
    },
  ],
  relationships: [
    {
      id: 'marriage-a-b',
      type: 'marriage',
      fromId: 'parent-a',
      toId: 'spouse-b',
      status: 'explicit',
      sourceUrl: null,
    },
    {
      id: 'parent-a-child-c',
      type: 'parent-child',
      fromId: 'parent-a',
      toId: 'child-c',
      status: 'explicit',
      sourceUrl: null,
    },
  ],
})

const documentWithMultipleSpouseParent = (): FamilyTreeDocument => {
  const document = documentWithSingleSpouseParent()
  return {
    ...document,
    persons: [
      ...document.persons.map((person) =>
        person.id === 'spouse-b' ? { ...person, deathYear: 1920 } : person,
      ),
      {
        id: 'spouse-d',
        firstName: 'Ernst',
        lastName: 'Walter',
        gender: 'man',
        birthYear: 1895,
        deathYear: 1950,
        position: null,
      },
    ],
    relationships: [
      ...document.relationships,
      {
        id: 'marriage-a-d',
        type: 'marriage',
        fromId: 'parent-a',
        toId: 'spouse-d',
        status: 'explicit',
        sourceUrl: null,
      },
    ],
  }
}

describe('inferred family relationships', () => {
  it('adds the only spouse as an inferred second parent with an explanation', () => {
    const result = synchronizeInferredRelationships(documentWithSingleSpouseParent())

    expect(result.relationships).toHaveLength(3)
    expect(result.relationships).toContainEqual(
      expect.objectContaining({
        type: 'parent-child',
        fromId: 'spouse-b',
        toId: 'child-c',
        status: 'inferred',
        inferredFrom: {
          rule: 'spouse-parent',
          sourceRelationshipId: 'parent-a-child-c',
        },
        comment: expect.stringContaining('Automatisch'),
      }),
    )
  })

  it('does not infer a spouse parent when a multiple-marriage death year is missing', () => {
    const document = documentWithMultipleSpouseParent()
    document.persons = document.persons.map((person) =>
      person.id === 'spouse-b' ? { ...person, deathYear: null } : person,
    )

    const result = synchronizeInferredRelationships(document)

    expect(result.relationships).toHaveLength(3)
    expect(result.relationships.some((relationship) => relationship.inferredFrom)).toBe(false)
  })

  it('infers only the spouse who could still be alive at the child birth', () => {
    const result = synchronizeInferredRelationships(documentWithMultipleSpouseParent())

    expect(result.relationships).toContainEqual(
      expect.objectContaining({
        fromId: 'spouse-d',
        toId: 'child-c',
        status: 'inferred',
      }),
    )
    expect(result.relationships).not.toContainEqual(
      expect.objectContaining({
        fromId: 'spouse-b',
        toId: 'child-c',
        inferredFrom: expect.anything(),
      }),
    )
  })

  it('does not infer when multiple spouses could be alive at the child birth', () => {
    const document = documentWithMultipleSpouseParent()
    document.persons = document.persons.map((person) =>
      person.id === 'spouse-b' ? { ...person, deathYear: 1950 } : person,
    )

    const result = synchronizeInferredRelationships(document)

    expect(result.relationships).toHaveLength(3)
    expect(result.relationships.some((relationship) => relationship.inferredFrom)).toBe(false)
  })

  it('does not infer a multiple-marriage parent when the child birth year is missing', () => {
    const document = documentWithMultipleSpouseParent()
    document.persons = document.persons.map((person) =>
      person.id === 'child-c' ? { ...person, birthYear: null } : person,
    )

    const result = synchronizeInferredRelationships(document)

    expect(result.relationships).toHaveLength(3)
    expect(result.relationships.some((relationship) => relationship.inferredFrom)).toBe(false)
  })

  it('removes stale automatic relationships and keeps edited comments', () => {
    const first = synchronizeInferredRelationships(documentWithMultipleSpouseParent())
    const automatic = first.relationships.find((relationship) => relationship.inferredFrom)
    expect(automatic).toBeDefined()
    if (!automatic) return

    const edited = {
      ...first,
      relationships: first.relationships.map((relationship) =>
        relationship.id === automatic.id
          ? { ...relationship, comment: 'Manuelle Notiz zur Annahme.' }
          : relationship,
      ),
    }
    const preserved = synchronizeInferredRelationships(edited)
    expect(preserved.relationships).toContainEqual(
      expect.objectContaining({
        id: automatic.id,
        comment: 'Manuelle Notiz zur Annahme.',
      }),
    )

    const invalidated = {
      ...edited,
      persons: first.persons.map((person) =>
        person.id === 'spouse-d' ? { ...person, deathYear: 1920 } : person,
      ),
    }
    const second = synchronizeInferredRelationships(invalidated)

    expect(second.relationships).toHaveLength(3)
  })

  it('does not allow an automatic relationship to be removed directly', () => {
    const synchronized = synchronizeInferredRelationships(documentWithSingleSpouseParent())
    const automatic = synchronized.relationships.find((relationship) => relationship.inferredFrom)
    expect(automatic).toBeDefined()
    if (!automatic) return

    const result = removeRelationship(synchronized, automatic.id)

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'automatic-relationship' }),
    })
  })
})