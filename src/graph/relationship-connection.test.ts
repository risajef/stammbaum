import { describe, expect, it } from 'vitest'

import type { Connection } from '@xyflow/react'

import { classifyRelationshipConnection } from './relationship-connection'
import type { FamilyTreeDocument, Gender, Person } from '../domain/types'

const person = (id: string, gender: Gender | null, position: { x: number; y: number }): Person => ({
  id,
  firstName: id,
  lastName: 'Test',
  gender,
  birthYear: null,
  deathYear: null,
  position,
})

const documentWith = (...persons: Person[]): FamilyTreeDocument => ({
  schemaVersion: 1,
  persons: [...persons],
  relationships: [],
})

const connection = (values: Partial<Connection>): Connection => ({
  source: 'person-a',
  target: 'person-b',
  sourceHandle: 'marriage-side',
  targetHandle: 'marriage-side',
  ...values,
})

describe('classifyRelationshipConnection', () => {
  it('classifies a marriage from the side handles in either direction', () => {
    const document = documentWith(
      person('woman', 'woman', { x: 20, y: 500 }),
      person('man', 'man', { x: 400, y: -120 }),
    )

    expect(
      classifyRelationshipConnection(
        document,
        connection({ source: 'woman', target: 'man' }),
      ),
    ).toEqual({
      ok: true,
      value: { relationshipType: 'marriage', sourceId: 'woman', targetId: 'man' },
    })

    expect(
      classifyRelationshipConnection(
        document,
        connection({ source: 'man', target: 'woman' }),
      ),
    ).toEqual({
      ok: true,
      value: { relationshipType: 'marriage', sourceId: 'man', targetId: 'woman' },
    })
  })

  it('classifies lower-to-upper handles as parent to child without using node positions', () => {
    const document = documentWith(
      person('parent', null, { x: 20, y: 700 }),
      person('child', null, { x: 400, y: -300 }),
    )

    expect(
      classifyRelationshipConnection(document, {
        source: 'parent',
        target: 'child',
        sourceHandle: 'source-bottom',
        targetHandle: 'target-top',
      }),
    ).toEqual({
      ok: true,
      value: { relationshipType: 'parent-child', sourceId: 'parent', targetId: 'child' },
    })
  })

  it('rejects connections that do not use one semantic handle pattern', () => {
    const document = documentWith(
      person('person-a', 'woman', { x: 20, y: 80 }),
      person('person-b', 'man', { x: 400, y: 80 }),
    )

    const result = classifyRelationshipConnection(
      document,
      connection({ sourceHandle: 'marriage-side', targetHandle: 'target-top' }),
    )

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'invalid-relationship-handles' }),
    })
  })
})
