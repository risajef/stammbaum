import { describe, expect, it } from 'vitest'

import type { FamilyTreeDocument } from '../domain/types'
import type { OcrSuggestion } from './ocr-suggestions'
import { acceptOcrSuggestion, rejectOcrSuggestion } from './ocr-suggestion-actions'

const document: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    {
      id: 'parent-1',
      firstName: 'Anna',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: null,
      deathYear: null,
      position: null,
    },
    {
      id: 'spouse-1',
      firstName: 'Hans',
      lastName: 'Müller',
      gender: 'man',
      birthYear: null,
      deathYear: null,
      position: null,
    },
  ],
  relationships: [],
}

const suggestion = (
  overrides: Partial<OcrSuggestion> = {},
): OcrSuggestion => ({
  id: 'suggestion-1',
  newPerson: {
    firstName: 'Lina',
    lastName: 'Weber',
    gender: 'woman',
    birthYear: null,
    deathYear: null,
    position: null,
    comment: null,
  },
  existingPersonId: 'parent-1',
  relationshipType: 'parent-child',
  direction: 'candidate-child',
  reason: 'Sohn-/Tochter-Muster auf Seite 7.',
  score: 75,
  scoreBreakdown: {
    name: 35,
    date: 20,
    gender: 10,
    relationship: 10,
    source: 0,
  },
  scoreReasons: ['Name: 35/35'],
  evidence: {
    count: 1,
    sources: [],
  },
  excerpt: 'Lina Weber, Tochter von Anna Weber.',
  source: {
    bookId: 'book-1',
    pageId: 'page-7',
    runId: 'run-1',
    pageNumber: 7,
    modelId: 'kraken-pp-ocrv6-medium',
    section: 'Familienregister 1840',
    path: 'run-1/text/page-7.txt',
  },
  sourceUrl: 'http://127.0.0.1:8767/review?book_id=book-1&page_id=page-7',
  ...overrides,
})

describe('OCR suggestion actions', () => {
  it('accepts a parent-child suggestion atomically with source, reason, and OCR origin', () => {
    const result = acceptOcrSuggestion(document, suggestion(), {
      personId: () => 'person-lina',
      relationshipId: () => 'relationship-lina-parent',
    })

    expect(result).toMatchObject({
      ok: true,
      value: {
        persons: [{ id: 'parent-1' }, { id: 'spouse-1' }, { id: 'person-lina' }],
        relationships: [{
          id: 'relationship-lina-parent',
          type: 'parent-child',
          fromId: 'parent-1',
          toId: 'person-lina',
          sourceUrl: 'http://127.0.0.1:8767/review?book_id=book-1&page_id=page-7',
          comment: 'Sohn-/Tochter-Muster auf Seite 7.',
          origin: 'ocr-suggestion',
        }],
      },
    })
  })

  it('accepts a spouse suggestion with the directed marriage roles', () => {
    const result = acceptOcrSuggestion(
      document,
      suggestion({
        id: 'suggestion-spouse',
        newPerson: {
          firstName: 'Maria',
          lastName: 'Müller',
          gender: 'woman',
          birthYear: null,
          deathYear: null,
          position: null,
          comment: null,
        },
        existingPersonId: 'spouse-1',
        relationshipType: 'marriage',
        direction: 'spouse',
        reason: 'Ehefrau-Muster auf Seite 9.',
        sourceUrl: 'https://review.example/run-1/page-9',
      }),
      { personId: () => 'person-maria', relationshipId: () => 'relationship-maria-spouse' },
    )

    expect(result).toMatchObject({
      ok: true,
      value: {
        relationships: [{
          id: 'relationship-maria-spouse',
          type: 'marriage',
          fromId: 'person-maria',
          toId: 'spouse-1',
          origin: 'ocr-suggestion',
          sourceUrl: 'https://review.example/run-1/page-9',
          comment: 'Ehefrau-Muster auf Seite 9.',
        }],
      },
    })
  })

  it('rejects a suggestion without changing the document', () => {
    const before = structuredClone(document)

    expect(rejectOcrSuggestion([suggestion()], 'suggestion-1')).toEqual([])
    expect(document).toEqual(before)
  })

  it('accepts the edited person draft instead of the original OCR values', () => {
    const result = acceptOcrSuggestion(
      document,
      suggestion(),
      {
        personId: () => 'person-corrected-lina',
        relationshipId: () => 'relationship-corrected-lina',
      },
      {
        firstName: 'Lina-Marie',
        lastName: 'Weber-Keller',
        gender: 'woman',
        birthYear: '1841-05-12',
        deathYear: null,
        position: null,
        comment: 'Korrigiert nach Originaleintrag',
      },
    )

    expect(result).toMatchObject({
      ok: true,
      value: {
        persons: [
          {},
          {},
          {
            id: 'person-corrected-lina',
            firstName: 'Lina-Marie',
            lastName: 'Weber-Keller',
            birthYear: '1841-05-12',
            comment: 'Korrigiert nach Originaleintrag',
          },
        ],
      },
    })
  })

  it('allows a same-named new person when the birth date is distinct', () => {
    const existingSameName: FamilyTreeDocument = {
      ...document,
      persons: [
        ...document.persons,
        {
          id: 'georg-existing',
          firstName: 'Georg',
          lastName: 'Weber',
          gender: 'man',
          birthYear: '1840',
          deathYear: null,
          position: null,
        },
      ],
    }

    const result = acceptOcrSuggestion(
      existingSameName,
      suggestion({
        newPerson: {
          ...suggestion().newPerson,
          firstName: 'Georg',
          lastName: 'Weber',
          gender: 'man',
          birthYear: '1841',
        },
      }),
      { personId: () => 'georg-new', relationshipId: () => 'georg-relationship' },
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.persons.at(-1)).toMatchObject({
        id: 'georg-new',
        firstName: 'Georg',
        lastName: 'Weber',
        birthYear: '1841',
      })
    }
  })

  it('rejects a same-named new person with the same birth date', () => {
    const existingSameName: FamilyTreeDocument = {
      ...document,
      persons: [
        ...document.persons,
        {
          id: 'georg-existing',
          firstName: 'Georg',
          lastName: 'Weber',
          gender: 'man',
          birthYear: '1840-05-12',
          deathYear: null,
          position: null,
        },
      ],
    }
    const before = structuredClone(existingSameName)
    const result = acceptOcrSuggestion(
      existingSameName,
      suggestion({
        newPerson: {
          ...suggestion().newPerson,
          firstName: 'Georg',
          lastName: 'Weber',
          birthYear: '1840-05-12',
        },
      }),
      { personId: () => 'georg-duplicate', relationshipId: () => 'georg-duplicate-relationship' },
    )

    expect(result).toMatchObject({ ok: false, error: { code: 'duplicate-person' } })
    expect(existingSameName).toEqual(before)
  })

  it.each([
    ['duplicate person', suggestion({ newPerson: { ...suggestion().newPerson, firstName: 'Anna' } })],
    ['invalid candidate', suggestion({ newPerson: { ...suggestion().newPerson, firstName: ' ' } })],
  ])('returns an error for a %s without partial adoption', (_label, invalidSuggestion) => {
    const before = structuredClone(document)
    const result = acceptOcrSuggestion(document, invalidSuggestion, {
      personId: () => 'person-invalid',
      relationshipId: () => 'relationship-invalid',
    })

    expect(result.ok).toBe(false)
    expect(document).toEqual(before)
  })
})
