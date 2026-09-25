import { describe, expect, it } from 'vitest'

import { mergeFamilyTrees } from './family-tree-merge'
import type { FamilyTreeDocument, Person, Relationship } from './types'

const person = (id: string, firstName: string, birthYear: Person['birthYear'] = null): Person => ({
  id,
  firstName,
  lastName: 'Weber',
  gender: null,
  birthYear,
  deathYear: null,
  position: null,
  comment: null,
})

const parentChild = (
  id: string,
  fromId: string,
  toId: string,
  comment: string | null = null,
): Relationship => ({
  id,
  type: 'parent-child',
  fromId,
  toId,
  status: 'explicit',
  sourceUrl: null,
  comment,
  inferredFrom: null,
  origin: 'manual',
})

const documentOf = (
  persons: Person[],
  relationships: Relationship[] = [],
): FamilyTreeDocument => ({ schemaVersion: 1, persons, relationships })

describe('mergeFamilyTrees', () => {
  it('unions overlapping family exports by ID and keeps same-name people with different IDs', () => {
    const sharedPerson = person('shared', 'Anna', '1900')
    const child = person('child', 'Ruth')
    const sharedRelationship = parentChild('shared-child', 'shared', 'child')
    const firstOnly = person('ruth-only', 'Ruth')
    const secondOnly = person('ernst-only', 'Ernst')
    const sameNameDifferentId = person('shared-copy', 'Anna', '1900')

    const result = mergeFamilyTrees([
      {
        fileName: 'Ruth.yaml',
        document: documentOf([person('shared', 'Anna', 1900), child, firstOnly], [sharedRelationship]),
      },
      {
        fileName: 'Ernst.yaml',
        document: documentOf(
          [person('shared', 'Anna', '1900'), child, secondOnly, sameNameDifferentId],
          [parentChild('shared-child', 'shared', 'child'), parentChild('ernst-child', 'ernst-only', 'child')],
        ),
      },
    ])

    expect(result).toEqual({
      ok: true,
      value: documentOf(
        [sharedPerson, child, firstOnly, secondOnly, sameNameDifferentId],
        [sharedRelationship, parentChild('ernst-child', 'ernst-only', 'child')],
      ),
    })
  })

  it('reports person ID conflicts with the ID, entity type, and source filenames', () => {
    const result = mergeFamilyTrees([
      { fileName: 'Ruth.yaml', document: documentOf([person('shared', 'Anna')]) },
      { fileName: 'Ernst.yaml', document: documentOf([person('shared', 'Anne')]) },
    ])

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'merge-person-conflict',
        entityId: 'shared',
      },
    })
    if (!result.ok) {
      expect(result.error.message).toContain('Person')
      expect(result.error.message).toContain('Ruth.yaml')
      expect(result.error.message).toContain('Ernst.yaml')
    }
  })

  it('reports relationship ID conflicts with the ID, entity type, and source filenames', () => {
    const result = mergeFamilyTrees([
      {
        fileName: 'Ruth.yaml',
        document: documentOf(
          [person('parent', 'Anna'), person('child', 'Ruth')],
          [parentChild('relationship', 'parent', 'child', 'Quelle A')],
        ),
      },
      {
        fileName: 'Ernst.yaml',
        document: documentOf(
          [person('parent', 'Anna'), person('child', 'Ruth')],
          [parentChild('relationship', 'parent', 'child', 'Quelle B')],
        ),
      },
    ])

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'merge-relationship-conflict',
        entityId: 'relationship',
      },
    })
    if (!result.ok) {
      expect(result.error.message).toContain('Beziehung')
      expect(result.error.message).toContain('Ruth.yaml')
      expect(result.error.message).toContain('Ernst.yaml')
    }
  })

  it('rejects unresolved relationship references after the union and identifies their source', () => {
    const result = mergeFamilyTrees([
      {
        fileName: 'Ruth.yaml',
        document: documentOf(
          [person('parent', 'Anna')],
          [parentChild('parent-child', 'parent', 'missing-child')],
        ),
      },
    ])

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: 'merge-invalid-document',
        entityId: 'parent-child',
      },
    })
    if (!result.ok) {
      expect(result.error.message).toContain('Ruth.yaml')
      expect(result.error.message).toContain('unbekannte Person')
    }
  })

  it('rejects duplicate relationship pairs with different IDs and names both sources', () => {
    const sharedPeople = [person('parent', 'Anna'), person('child', 'Ruth')]
    const result = mergeFamilyTrees([
      {
        fileName: 'Ruth.yaml',
        document: documentOf(sharedPeople, [parentChild('ruth-parent-child', 'parent', 'child')]),
      },
      {
        fileName: 'Ernst.yaml',
        document: documentOf(sharedPeople, [parentChild('ernst-parent-child', 'parent', 'child')]),
      },
    ])

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'merge-invalid-document' },
    })
    if (!result.ok) {
      expect(result.error.message).toContain('Ruth.yaml')
      expect(result.error.message).toContain('Ernst.yaml')
    }
  })
})
