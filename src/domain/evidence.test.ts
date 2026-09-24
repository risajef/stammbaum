import { describe, expect, it } from 'vitest'

import {
  createMarriage,
  createParentChild,
  updateRelationship,
} from './relationship'
import { synchronizeInferredRelationships } from './inference'
import type { FamilyTreeDocument } from './types'

const documentWithPeople = (): FamilyTreeDocument => ({
  schemaVersion: 1,
  persons: [
    {
      id: 'woman-1',
      firstName: 'Anna',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: 1834,
      deathYear: null,
      position: null,
    },
    {
      id: 'man-1',
      firstName: 'Johann',
      lastName: 'Weber',
      gender: 'man',
      birthYear: 1830,
      deathYear: null,
      position: null,
    },
    {
      id: 'child-1',
      firstName: 'Sven',
      lastName: 'Weber',
      gender: 'man',
      birthYear: 1963,
      deathYear: null,
      position: null,
    },
  ],
  relationships: [],
})

describe('relationship evidence', () => {
  it('defaults a relationship to explicit without a source', () => {
    const result = createMarriage(documentWithPeople(), 'woman-1', 'man-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.relationships[0]).toMatchObject({
        status: 'explicit',
        sourceUrl: null,
      })
    }
  })

  it('stores inferred status and an HTTP(S) source on any relationship', () => {
    const marriage = createMarriage(
      documentWithPeople(),
      'woman-1',
      'man-1',
      {
        status: 'inferred',
        sourceUrl: 'https://example.org/register/28',
      },
    )
    expect(marriage.ok).toBe(true)
    if (!marriage.ok) return

    const child = createParentChild(
      marriage.value,
      'woman-1',
      'child-1',
      {
        status: 'inferred',
        sourceUrl: 'http://example.org/family',
      },
    )

    expect(child.ok).toBe(true)
    if (child.ok) {
      expect(child.value.relationships[1]).toMatchObject({
        status: 'inferred',
        sourceUrl: 'http://example.org/family',
      })
    }
  })

  it('stores and normalises a relationship comment', () => {
    const result = createMarriage(documentWithPeople(), 'woman-1', 'man-1', {
      comment: '  Familiennotiz.  ',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.relationships[0]?.comment).toBe('Familiennotiz.')

    const updated = updateRelationship(result.value, result.value.relationships[0].id, {
      comment: '  ',
    })
    expect(updated.ok).toBe(true)
    if (updated.ok) {
      expect(updated.value.relationships[0]?.comment).toBeNull()
    }
  })

  it('updates status and source without changing relationship endpoints', () => {
    const marriage = createMarriage(documentWithPeople(), 'woman-1', 'man-1')
    expect(marriage.ok).toBe(true)
    if (!marriage.ok) return

    const result = updateRelationship(marriage.value, marriage.value.relationships[0].id, {
      status: 'inferred',
      sourceUrl: 'https://example.org/updated',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.relationships[0]).toMatchObject({
        fromId: 'woman-1',
        toId: 'man-1',
        status: 'inferred',
        sourceUrl: 'https://example.org/updated',
      })
    }
  })

  it('confirms an inferred relationship as a manual explicit relationship', () => {
    const document: FamilyTreeDocument = {
      ...documentWithPeople(),
      relationships: [
        {
          id: 'source-parent-child',
          type: 'parent-child',
          fromId: 'woman-1',
          toId: 'child-1',
          status: 'explicit',
          sourceUrl: null,
        },
        {
          id: 'inferred-parent-child',
          type: 'parent-child',
          fromId: 'man-1',
          toId: 'child-1',
          status: 'inferred',
          sourceUrl: null,
          inferredFrom: {
            rule: 'spouse-parent',
            sourceRelationshipId: 'source-parent-child',
          },
          origin: 'automatic-inference',
        },
      ],
    }

    const result = updateRelationship(document, 'inferred-parent-child', {
      status: 'explicit',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.relationships[1]).toMatchObject({
        status: 'explicit',
        inferredFrom: null,
        origin: 'manual',
      })

      const synchronized = synchronizeInferredRelationships(result.value)
      expect(synchronized.relationships[1]).toMatchObject({
        status: 'explicit',
        inferredFrom: null,
        origin: 'manual',
      })
    }
  })

  it.each(['', 'example.org/source', 'ftp://example.org/source', 'javascript:alert(1)'])(
    'rejects invalid source URL %j',
    (sourceUrl) => {
      const result = createMarriage(
        documentWithPeople(),
        'woman-1',
        'man-1',
        { sourceUrl },
      )

      expect(result.ok).toBe(false)
    },
  )
})
