import { describe, expect, it } from 'vitest'

import { parseFamilyTreeYaml, serializeFamilyTreeYaml } from './yaml'
import type { FamilyTreeDocument } from '../domain/types'

const documentFixture: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    {
      id: 'woman-1',
      firstName: 'Anna',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: '1834',
      deathYear: '1901',
      position: { x: 120, y: 80 },
      comment: 'Unsichere Zuordnung.',
    },
    {
      id: 'man-1',
      firstName: 'Johann',
      lastName: 'Weber',
      gender: 'man',
      birthYear: '1830',
      deathYear: null,
      position: { x: 320, y: 80 },
      comment: null,
    },
    {
      id: 'child-1',
      firstName: 'Sven',
      lastName: 'Weber',
      gender: 'man',
      birthYear: '1963',
      deathYear: null,
      position: { x: 220, y: 260 },
      comment: null,
    },
  ],
  relationships: [
    {
      id: 'marriage-1',
      type: 'marriage',
      fromId: 'woman-1',
      toId: 'man-1',
      startDate: '1880-05-20',
      status: 'explicit',
      sourceUrl: 'https://example.org/register/28',
      comment: 'Standesamtliche Quelle.',
      inferredFrom: null,
      origin: 'manual',
    },
    {
      id: 'parent-child-1',
      type: 'parent-child',
      fromId: 'man-1',
      toId: 'child-1',
      status: 'explicit',
      sourceUrl: null,
      comment: null,
      inferredFrom: null,
      origin: 'manual',
    },
    {
      id: 'parent-child-inferred-1',
      type: 'parent-child',
      fromId: 'woman-1',
      toId: 'child-1',
      status: 'inferred',
      sourceUrl: null,
      comment: 'Automatisch abgeleitet.',
      inferredFrom: {
        rule: 'spouse-parent',
        sourceRelationshipId: 'parent-child-1',
      },
      origin: 'automatic-inference',
    },
  ],
}

describe('family tree YAML persistence', () => {
  it('round-trips the complete document including positions and relationship metadata', () => {
    const yaml = serializeFamilyTreeYaml(documentFixture)
    const result = parseFamilyTreeYaml(yaml)

    expect(yaml).toContain('schemaVersion: 1')
    expect(result).toEqual({ ok: true, value: documentFixture })
  })

  it('round-trips supported relationship origins and normalises legacy files', () => {
    const documentWithOrigins = {
      ...documentFixture,
      relationships: documentFixture.relationships.map((relationship, index) => ({
        ...relationship,
        origin: index === 2 ? 'automatic-inference' : 'manual',
      })),
    } as FamilyTreeDocument

    const roundTrip = parseFamilyTreeYaml(serializeFamilyTreeYaml(documentWithOrigins))

    expect(roundTrip).toEqual({ ok: true, value: documentWithOrigins })

    const legacy = parseFamilyTreeYaml(
      serializeFamilyTreeYaml(documentFixture).replace(/\n    origin: [^\n]+/g, ''),
    )

    expect(legacy).toMatchObject({
      ok: true,
      value: {
        relationships: [
          { id: 'marriage-1', origin: 'manual' },
          { id: 'parent-child-1', origin: 'manual' },
          { id: 'parent-child-inferred-1', origin: 'automatic-inference' },
        ],
      },
    })

    const legacyOcr = parseFamilyTreeYaml(
      serializeFamilyTreeYaml(documentFixture).replace(
        '    origin: manual',
        '    origin: ocr-suggestion',
      ),
    )

    expect(legacyOcr.ok).toBe(true)
    if (legacyOcr.ok) {
      expect(legacyOcr.value.relationships[0]).toMatchObject({
        id: 'marriage-1',
        origin: 'manual',
      })
    }
  })

  it('round-trips partial dates and normalises legacy numeric years', () => {
    const datedDocument = {
      ...documentFixture,
      persons: documentFixture.persons.map((person, index) => ({
        ...person,
        birthYear: ['1900', '1900-05', '1900-05-20'][index],
        deathYear: index === 0 ? '1970-08-12' : null,
      })),
    } as FamilyTreeDocument

    const yaml = serializeFamilyTreeYaml(datedDocument)
    const result = parseFamilyTreeYaml(yaml)

    expect(result).toEqual({ ok: true, value: datedDocument })

    const legacy = parseFamilyTreeYaml(`schemaVersion: 1
persons:
  - id: legacy-1
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: 1900
    deathYear: null
    position: null
relationships: []`)

    expect(legacy).toEqual({
      ok: true,
      value: expect.objectContaining({
        persons: [expect.objectContaining({ birthYear: '1900' })],
      }),
    })
  })

  it('imports older marriages without a start date', () => {
    const result = parseFamilyTreeYaml(`schemaVersion: 1
persons:
  - id: woman-1
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
  - id: man-1
    firstName: Johann
    lastName: Weber
    gender: man
    birthYear: null
    deathYear: null
    position: null
relationships:
  - id: marriage-1
    type: marriage
    fromId: woman-1
    toId: man-1
    status: explicit
    sourceUrl: null`)

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        relationships: [expect.objectContaining({ id: 'marriage-1', startDate: null })],
      }),
    })
  })

  it('normalises whitespace-only comments during import', () => {
    const source = serializeFamilyTreeYaml({
      ...documentFixture,
      persons: documentFixture.persons.map((person) => ({ ...person, comment: '  ' })),
      relationships: documentFixture.relationships.map((relationship) => ({
        ...relationship,
        comment: '  ',
      })),
    })

    const result = parseFamilyTreeYaml(source)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.persons.every((person) => person.comment === null)).toBe(true)
      expect(result.value.relationships.every((relationship) => relationship.comment === null)).toBe(
        true,
      )
    }
  })

  it.each([
    ['invalid syntax', 'schemaVersion: ['],
    [
      'unknown relationship reference',
      `schemaVersion: 1
persons: []
relationships:
  - id: relationship-1
    type: parent-child
    fromId: missing
    toId: missing-child
    status: explicit
    sourceUrl: null`,
    ],
    [
      'invalid source URL',
      `schemaVersion: 1
persons:
  - id: woman-1
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
  - id: man-1
    firstName: Johann
    lastName: Weber
    gender: man
    birthYear: null
    deathYear: null
    position: null
relationships:
  - id: marriage-1
    type: marriage
    fromId: woman-1
    toId: man-1
    status: explicit
    sourceUrl: ftp://example.org/source`,
    ],
    [
      'invalid calendar date',
      `schemaVersion: 1
persons:
  - id: person-1
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: 1900-02-29
    deathYear: null
    position: null
relationships: []`,
    ],
    [
      'invalid marriage start date',
      `schemaVersion: 1
persons:
  - id: woman-1
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
  - id: man-1
    firstName: Johann
    lastName: Weber
    gender: man
    birthYear: null
    deathYear: null
    position: null
relationships:
  - id: marriage-1
    type: marriage
    fromId: woman-1
    toId: man-1
    startDate: 1900-02-29
    status: explicit
    sourceUrl: null`,
    ],
  ])('rejects %s without returning partial data', (_description, yaml) => {
    const result = parseFamilyTreeYaml(yaml)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBeTruthy()
    }
  })

  it('rejects unsupported schema versions', () => {
    const yaml = serializeFamilyTreeYaml(documentFixture).replace('schemaVersion: 1', 'schemaVersion: 2')

    const result = parseFamilyTreeYaml(yaml)

    expect(result.ok).toBe(false)
  })

  it('does not export transient runtime state but exports accepted document data', () => {
    const pendingDocument = {
      ...documentFixture,
      transientSuggestions: [{
        id: 'suggestion-1',
        newPerson: { firstName: 'Lina', lastName: 'Weber' },
      }],
    } as FamilyTreeDocument & { transientSuggestions: unknown[] }

    const pendingYaml = serializeFamilyTreeYaml(pendingDocument)

    expect(pendingYaml).not.toContain('transientSuggestions')
    expect(pendingYaml).not.toContain('suggestion-1')
    expect(pendingYaml).not.toContain('Lina')

    const acceptedYaml = serializeFamilyTreeYaml({
      ...documentFixture,
      persons: [
        ...documentFixture.persons,
        {
          id: 'person-lina',
          firstName: 'Lina',
          lastName: 'Weber',
          gender: 'woman',
          birthYear: null,
          deathYear: null,
          position: null,
        },
      ],
      relationships: [
        ...documentFixture.relationships,
        {
          id: 'relationship-lina-parent',
          type: 'parent-child',
          fromId: 'woman-1',
          toId: 'person-lina',
          status: 'explicit',
          sourceUrl: 'https://review.example/page/7',
          comment: 'Manuelle Begründung',
          origin: 'manual',
        },
      ],
    })

    expect(acceptedYaml).toContain('origin: manual')
    expect(acceptedYaml).toContain('sourceUrl: https://review.example/page/7')
    expect(acceptedYaml).toContain('comment: Manuelle Begründung')
  })
})
