import { describe, expect, it } from 'vitest'

import { updatePerson } from './person'
import {
  createMarriage,
  createParentChild,
  getImplicitMarriageEndDate,
  removeRelationship,
} from './relationship'
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
      id: 'man-2',
      firstName: 'Ernst',
      lastName: 'Walter',
      gender: 'man',
      birthYear: 1840,
      deathYear: null,
      position: null,
    },
    {
      id: 'woman-2',
      firstName: 'Maria',
      lastName: 'Schelling',
      gender: 'woman',
      birthYear: 1842,
      deathYear: null,
      position: null,
    },
    {
      id: 'unknown-1',
      firstName: 'Ruth',
      lastName: 'Graf',
      gender: null,
      birthYear: null,
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
    {
      id: 'child-2',
      firstName: 'Reto',
      lastName: 'Weber',
      gender: 'man',
      birthYear: 1965,
      deathYear: null,
      position: null,
    },
  ],
  relationships: [],
})

describe('relationship domain operations', () => {
  it('canonicalizes a marriage to woman-to-man order', () => {
    const result = createMarriage(
      documentWithPeople(),
      'man-1',
      'woman-1',
      {},
      () => 'marriage-1',
    )

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        relationships: [
          {
            id: 'marriage-1',
            type: 'marriage',
            fromId: 'woman-1',
            toId: 'man-1',
            startDate: null,
            status: 'explicit',
            sourceUrl: null,
            comment: null,
            inferredFrom: null,
            origin: 'manual',
          },
        ],
      }),
    })
  })

  it('marks manually created and explicitly sourced relationships with their origin', () => {
    const marriage = createMarriage(
      documentWithPeople(),
      'woman-1',
      'man-1',
      {},
      () => 'marriage-1',
    )
    expect(marriage).toMatchObject({
      ok: true,
      value: { relationships: [{ id: 'marriage-1', origin: 'manual' }] },
    })

    const ocrRelationship = createParentChild(
      documentWithPeople(),
      'woman-1',
      'child-1',
      { origin: 'ocr-suggestion' },
      () => 'ocr-parent-child-1',
    )
    expect(ocrRelationship).toMatchObject({
      ok: true,
      value: { relationships: [{ id: 'ocr-parent-child-1', origin: 'ocr-suggestion' }] },
    })
  })

  it('allows a person to have multiple marriages but rejects duplicates', () => {
    const first = createMarriage(
      documentWithPeople(),
      'woman-1',
      'man-1',
      {},
      () => 'marriage-1',
    )
    expect(first.ok).toBe(true)
    if (!first.ok) return

    const second = createMarriage(first.value, 'woman-1', 'man-2', {}, () => 'marriage-2')
    expect(second.ok).toBe(true)
    if (!second.ok) return

    expect(second.value.relationships).toHaveLength(2)

    const duplicate = createMarriage(
      second.value,
      'man-1',
      'woman-1',
      {},
      () => 'marriage-3',
    )
    expect(duplicate.ok).toBe(false)
  })

  it('stores a partial marriage start date', () => {
    const result = createMarriage(
      documentWithPeople(),
      'woman-1',
      'man-1',
      { startDate: '1880-05' },
      () => 'marriage-1',
    )

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        relationships: [
          expect.objectContaining({
            id: 'marriage-1',
            startDate: '1880-05',
          }),
        ],
      }),
    })
  })

  it('derives the earliest certain death as the implicit marriage end', () => {
    const document = documentWithPeople()
    document.persons = document.persons.map((person) =>
      person.id === 'woman-1'
        ? { ...person, deathYear: '1925-08-12' }
        : person.id === 'man-1'
          ? { ...person, deathYear: '1920-03-01' }
          : person,
    )
    const result = createMarriage(document, 'woman-1', 'man-1', {}, () => 'marriage-1')

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(getImplicitMarriageEndDate(result.value.relationships[0], result.value.persons)).toBe(
      '1920-03-01',
    )
  })

  it('leaves the implicit marriage end open when deaths cannot be compared certainly', () => {
    const document = documentWithPeople()
    document.persons = document.persons.map((person) =>
      person.id === 'woman-1'
        ? { ...person, deathYear: '1920-05' }
        : person.id === 'man-1'
          ? { ...person, deathYear: '1920-05-01' }
          : person,
    )
    const result = createMarriage(document, 'woman-1', 'man-1', {}, () => 'marriage-1')

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(getImplicitMarriageEndDate(result.value.relationships[0], result.value.persons)).toBeNull()
  })

  it('rejects an invalid marriage start date', () => {
    const result = createMarriage(
      documentWithPeople(),
      'woman-1',
      'man-1',
      { startDate: '1900-02-29' },
    )

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'invalid-date', field: 'startDate' },
    })
  })

  it('rejects marriages with invalid roles, self-links, or unknown people', () => {
    const document = documentWithPeople()

    expect(createMarriage(document, 'woman-1', 'woman-2').ok).toBe(false)
    expect(createMarriage(document, 'woman-1', 'unknown-1').ok).toBe(false)
    expect(createMarriage(document, 'woman-1', 'woman-1').ok).toBe(false)
    expect(createMarriage(document, 'woman-1', 'missing').ok).toBe(false)
  })

  it('rejects a gender edit that would invalidate an existing marriage', () => {
    const marriage = createMarriage(documentWithPeople(), 'woman-1', 'man-1')
    expect(marriage.ok).toBe(true)
    if (!marriage.ok) return

    const result = updatePerson(marriage.value, 'woman-1', { gender: 'man' })

    expect(result.ok).toBe(false)
  })

  it('keeps multiple parent-child relationships as separate directed edges', () => {
    const first = createParentChild(
      documentWithPeople(),
      'woman-1',
      'child-1',
      {},
      () => 'parent-child-1',
    )
    expect(first.ok).toBe(true)
    if (!first.ok) return

    const second = createParentChild(
      first.value,
      'man-1',
      'child-1',
      {},
      () => 'parent-child-2',
    )
    expect(second.ok).toBe(true)
    if (!second.ok) return

    const third = createParentChild(
      second.value,
      'woman-1',
      'child-2',
      {},
      () => 'parent-child-3',
    )
    expect(third.ok).toBe(true)
    if (!third.ok) return

    expect(third.value.relationships).toEqual([
      expect.objectContaining({
        id: 'parent-child-1',
        type: 'parent-child',
        fromId: 'woman-1',
        toId: 'child-1',
      }),
      expect.objectContaining({
        id: 'parent-child-2',
        type: 'parent-child',
        fromId: 'man-1',
        toId: 'child-1',
      }),
      expect.objectContaining({
        id: 'parent-child-3',
        type: 'parent-child',
        fromId: 'woman-1',
        toId: 'child-2',
      }),
    ])
  })

  it('rejects parent-child self-links and unknown people', () => {
    const document = documentWithPeople()

    expect(createParentChild(document, 'woman-1', 'woman-1').ok).toBe(false)
    expect(createParentChild(document, 'woman-1', 'missing').ok).toBe(false)
  })

  it('removes only the selected relationship', () => {
    const marriage = createMarriage(
      documentWithPeople(),
      'woman-1',
      'man-1',
      {},
      () => 'marriage-1',
    )
    expect(marriage.ok).toBe(true)
    if (!marriage.ok) return

    const child = createParentChild(
      marriage.value,
      'woman-1',
      'child-1',
      {},
      () => 'parent-child-1',
    )
    expect(child.ok).toBe(true)
    if (!child.ok) return

    const result = removeRelationship(child.value, 'marriage-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.relationships).toEqual([
        expect.objectContaining({ id: 'parent-child-1' }),
      ])
    }
  })
})
