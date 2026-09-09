import { describe, expect, it } from 'vitest'

import { detectOcrSuggestions } from './ocr-suggestions'
import {
  PRIMARY_OCR_MODEL_ID,
  SUPPLEMENTAL_OCR_MODEL_ID,
  type OcrPage,
} from './ocr-file-adapter'
import type { FamilyTreeDocument } from '../domain/types'

const document: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    {
      id: 'parent-1',
      firstName: 'Johann',
      lastName: 'Weber',
      gender: 'man',
      birthYear: 1840,
      deathYear: null,
      position: null,
    },
    {
      id: 'spouse-1',
      firstName: 'Hans',
      lastName: 'Müller',
      gender: 'man',
      birthYear: 1842,
      deathYear: null,
      position: null,
    },
  ],
  relationships: [],
}

const page = (
  text: string,
  pageNumber = 7,
  options: Partial<Pick<OcrPage, 'modelId' | 'section' | 'runId' | 'bookId' | 'bookLabel'>> = {},
): OcrPage => ({
  id: `run-1:${pageNumber}`,
  runId: options.runId ?? 'run-1',
  bookId: options.bookId ?? 'book-1',
  bookLabel: options.bookLabel ?? 'Kirchenbuch 1840',
  pageId: `page-${pageNumber}`,
  pageNumber,
  modelId: options.modelId ?? PRIMARY_OCR_MODEL_ID,
  section: options.section ?? 'Taufen 1840',
  path: `scan-1/text/page-${pageNumber}.txt`,
  text,
  sourceUrl: `http://127.0.0.1:8767/review?book_id=${options.bookId ?? 'book-1'}&page_id=page-${pageNumber}`,
})

describe('OCR family suggestions', () => {
  it.each([
    ['1840', '1840'],
    ['Mai 1840', '1840-05'],
    ['12. Mai 1840', '1840-05-12'],
    ['7ber 1840', '1840-09'],
    ['1840-05-12', '1840-05-12'],
  ])('extracts the candidate birth date from a nearby register date: %s', (dateText, expectedDate) => {
    const datedDocument: FamilyTreeDocument = {
      ...document,
      persons: [{
        id: 'jacob-1',
        firstName: 'Jacob',
        lastName: 'Weber',
        gender: 'man',
        birthYear: '1810-05-12',
        deathYear: null,
        position: null,
      }],
    }

    const suggestions = detectOcrSuggestions(datedDocument, [
      page(`${dateText}\nLina Weber, Tochter des Jacob Weber.`, 60),
    ])

    expect(suggestions[0]?.newPerson.birthYear).toBe(expectedDate)
  })

  it('tolerates OCR errors in the known first and last name', () => {
    const fuzzyDocument: FamilyTreeDocument = {
      ...document,
      persons: [{
        id: 'hans-1',
        firstName: 'Hans',
        lastName: 'Müller',
        gender: 'man',
        birthYear: '1810',
        deathYear: null,
        position: null,
      }],
    }

    const suggestions = detectOcrSuggestions(fuzzyDocument, [
      page('Lina Weber, Tochter des Hane Mueler.', 61),
    ])

    expect(suggestions[0]).toMatchObject({
      existingPersonId: 'hans-1',
      newPerson: { firstName: 'Lina', lastName: 'Weber' },
    })
  })

  it('chooses the same-named known parent whose nearby OCR date matches', () => {
    const duplicateParents: FamilyTreeDocument = {
      ...document,
      persons: [
        {
          id: 'jacob-old',
          firstName: 'Jacob',
          lastName: 'Weber',
          gender: 'man',
          birthYear: '1780',
          deathYear: null,
          position: null,
        },
        {
          id: 'jacob-right',
          firstName: 'Jacob',
          lastName: 'Weber',
          gender: 'man',
          birthYear: '1810',
          deathYear: null,
          position: null,
        },
      ],
    }

    const suggestions = detectOcrSuggestions(duplicateParents, [
      page('Jacob Weber, geboren 1810.\nLina Weber, Tochter des Jacob Weber.', 62),
    ])

    expect(suggestions[0]).toMatchObject({
      existingPersonId: 'jacob-right',
      newPerson: { birthYear: null },
    })
  })

  it('suppresses the only same-named parent when an explicit OCR parent date conflicts', () => {
    const datedParent: FamilyTreeDocument = {
      ...document,
      persons: [{
        id: 'jacob-wrong',
        firstName: 'Jacob',
        lastName: 'Weber',
        gender: 'man',
        birthYear: '1780',
        deathYear: null,
        position: null,
      }],
    }

    expect(
      detectOcrSuggestions(datedParent, [
        page('Jacob Weber, geboren 1810.\nLina Weber, Tochter des Jacob Weber.', 62),
      ]),
    ).toEqual([])
  })

  it('does not choose arbitrarily when same-named known parents are tied', () => {
    const duplicateParents: FamilyTreeDocument = {
      ...document,
      persons: [
        {
          id: 'jacob-one',
          firstName: 'Jacob',
          lastName: 'Weber',
          gender: 'man',
          birthYear: null,
          deathYear: null,
          position: null,
        },
        {
          id: 'jacob-two',
          firstName: 'Jacob',
          lastName: 'Weber',
          gender: 'man',
          birthYear: null,
          deathYear: null,
          position: null,
        },
      ],
    }

    expect(
      detectOcrSuggestions(duplicateParents, [
        page('Lina Weber, Tochter des Jacob Weber.', 63),
      ]),
    ).toEqual([])
  })

  it('scores all dimensions, ranks exact dates above partial dates, and hides weak matches', () => {
    const datedParentDocument: FamilyTreeDocument = {
      ...document,
      persons: [{
        id: 'jacob-dated',
        firstName: 'Jacob',
        lastName: 'Weber',
        gender: 'man',
        birthYear: '1810-05-12',
        deathYear: null,
        position: null,
      }],
    }

    const suggestions = detectOcrSuggestions(datedParentDocument, [
      page('12. Mai 1810\nLina Weber, Tochter des Jacob Weber.', 64),
      page('Mai 1810\nMina Weber, Tochter des Jacob Weber.', 65),
      page('1810\nNina Weber, Tochter des Jacob Weber.', 66),
    ])
    const fullDate = suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Lina')
    const monthDate = suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Mina')
    const yearDate = suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Nina')

    expect(fullDate?.scoreBreakdown).toEqual({
      name: expect.any(Number),
      date: expect.any(Number),
      gender: expect.any(Number),
      relationship: expect.any(Number),
      source: expect.any(Number),
    })
    expect(fullDate?.score).toBeGreaterThanOrEqual(0)
    expect(fullDate?.score).toBeLessThanOrEqual(100)
    expect(fullDate?.scoreBreakdown.date).toBeGreaterThan(monthDate?.scoreBreakdown.date ?? 0)
    expect(monthDate?.scoreBreakdown.date).toBeGreaterThan(yearDate?.scoreBreakdown.date ?? 0)
    expect(suggestions.map((suggestion) => suggestion.score)).toEqual(
      [...suggestions].map((suggestion) => suggestion.score).sort((first, second) => second - first),
    )
    expect(fullDate?.scoreReasons.join(' ')).toEqual(expect.stringContaining('Name'))
    expect(fullDate?.scoreReasons.join(' ')).toEqual(expect.stringContaining('Datum'))
  })

  it('suppresses a same-named parent when every available birth date contradicts the OCR date', () => {
    const contradictoryParents: FamilyTreeDocument = {
      ...document,
      persons: [
        {
          id: 'jacob-before',
          firstName: 'Jacob',
          lastName: 'Weber',
          gender: 'man',
          birthYear: '1780',
          deathYear: null,
          position: null,
        },
        {
          id: 'jacob-after',
          firstName: 'Jacob',
          lastName: 'Weber',
          gender: 'man',
          birthYear: '1820',
          deathYear: null,
          position: null,
        },
      ],
    }

    expect(
      detectOcrSuggestions(contradictoryParents, [
        page('1810\nLina Weber, Tochter des Jacob Weber.', 67),
      ]),
    ).toEqual([])
  })

  it('groups repeated evidence, keeps the primary model as source, and separates distinct dates', () => {
    const parentDocument: FamilyTreeDocument = {
      ...document,
      persons: [{
        id: 'jacob-evidence',
        firstName: 'Jacob',
        lastName: 'Weber',
        gender: 'man',
        birthYear: null,
        deathYear: null,
        position: null,
      }],
    }

    const repeated = detectOcrSuggestions(parentDocument, [
      page('Georg Weber, Sohn des Jacob Weber.', 68, {
        modelId: SUPPLEMENTAL_OCR_MODEL_ID,
      }),
      page('Georg Weber, Sohn des Jacob Weber.', 69, {
        modelId: PRIMARY_OCR_MODEL_ID,
      }),
    ])
    expect(repeated).toHaveLength(1)
    expect(repeated[0]).toMatchObject({
      source: { modelId: PRIMARY_OCR_MODEL_ID, pageNumber: 69 },
      evidence: { count: 2 },
    })
    expect(repeated[0]?.evidence.sources).toHaveLength(2)

    const distinctDates = detectOcrSuggestions(parentDocument, [
      page('12. Mai 1840\nGeorg Weber, Sohn des Jacob Weber.', 70),
      page('13. Mai 1840\nGeorg Weber, Sohn des Jacob Weber.', 71),
    ])
    expect(distinctDates).toHaveLength(2)
    expect(distinctDates.map((suggestion) => suggestion.newPerson.birthYear)).toEqual(
      expect.arrayContaining(['1840-05-12', '1840-05-13']),
    )
  })

  it('keeps a same-named OCR candidate when its known birth date is distinct', () => {
    const existingCandidateDocument: FamilyTreeDocument = {
      ...document,
      persons: [
        {
          id: 'jacob-same-name-parent',
          firstName: 'Jacob',
          lastName: 'Weber',
          gender: 'man',
          birthYear: null,
          deathYear: null,
          position: null,
        },
        {
          id: 'georg-existing',
          firstName: 'Georg',
          lastName: 'Weber',
          gender: 'man',
          birthYear: '1839',
          deathYear: null,
          position: null,
        },
      ],
    }

    const suggestions = detectOcrSuggestions(existingCandidateDocument, [
      page('1840\nGeorg Weber, Sohn des Jacob Weber.', 72),
    ])

    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]).toMatchObject({
      newPerson: { firstName: 'Georg', lastName: 'Weber', birthYear: '1840' },
      existingPersonId: 'jacob-same-name-parent',
    })
  })

  it('recognizes clear child, children-list, spouse, and birth-name patterns with evidence', () => {
    const suggestions = detectOcrSuggestions(document, [
      page('KARL  WEBER,\nSOHN des JOHANN WEBER', 7),
      page('Die Kinder von Johann Weber: Lina Weber und Otto Weber.', 8),
      page('Maria Schmid, geb. Weber, Ehefrau von Hans Müller.', 9),
    ])

    const child = suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Karl')
    expect(child).toMatchObject({
      newPerson: { firstName: 'Karl', lastName: 'Weber', gender: 'man' },
      existingPersonId: 'parent-1',
      relationshipType: 'parent-child',
      direction: 'candidate-child',
      reason: expect.stringContaining('Sohn'),
      excerpt: expect.stringContaining('SOHN'),
      source: { bookLabel: 'Kirchenbuch 1840', runId: 'run-1', pageNumber: 7 },
      sourceUrl: 'http://127.0.0.1:8767/review?book_id=book-1&page_id=page-7',
    })

    expect(
      suggestions.filter((suggestion) =>
        ['Lina', 'Otto'].includes(suggestion.newPerson.firstName),
      ),
    ).toHaveLength(2)

    const spouse = suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Maria')
    expect(spouse).toMatchObject({
      newPerson: { firstName: 'Maria', lastName: 'Schmid', gender: 'woman' },
      existingPersonId: 'spouse-1',
      relationshipType: 'marriage',
      direction: 'spouse',
      reason: expect.stringContaining('Geburtsname'),
      excerpt: expect.stringContaining('geb.'),
      source: { pageNumber: 9 },
    })
  })

  it('normalizes OCR names and keeps a stable page excerpt without inventing missing names', () => {
    const suggestions = detectOcrSuggestions(
      document,
      [page('Karl  Weber,\nSohn des Johann Weber.\nUnvollständige Zeile', 3)],
    )

    expect(suggestions[0]?.newPerson).toMatchObject({
      firstName: 'Karl',
      lastName: 'Weber',
    })
    expect(suggestions[0]?.excerpt).toContain('Sohn des Johann Weber')
    expect(
      detectOcrSuggestions(document, [page('Sohn des Johann Weber ohne Namen.', 4)]),
    ).toEqual([])
  })

  it('filters uncertain relationships and deduplicates the same candidate across pages', () => {
    const suggestions = detectOcrSuggestions(document, [
      page('Karl Weber, Sohn des Johann Weber.', 10),
      page('Karl Weber, Sohn des Johann Weber.', 11),
      page('Karl Weber, Verwandter des Johann Weber.', 12),
      page('Sohn des Johann Weber ohne klaren Namen.', 13),
    ])

    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]).toMatchObject({
      newPerson: { firstName: 'Karl', lastName: 'Weber' },
      source: { pageNumber: 10 },
    })
  })

  it('does not suggest people or relationships already represented in the document', () => {
    const existingDocument: FamilyTreeDocument = {
      ...document,
      persons: [
        ...document.persons,
        {
          id: 'child-1',
          firstName: 'Lina',
          lastName: 'Weber',
          gender: 'woman',
          birthYear: null,
          deathYear: null,
          position: null,
        },
      ],
      relationships: [
        {
          id: 'parent-child-1',
          type: 'parent-child',
          fromId: 'parent-1',
          toId: 'child-1',
          status: 'explicit',
          sourceUrl: null,
        },
      ],
    }

    expect(
      detectOcrSuggestions(existingDocument, [
        page('Lina Weber, Tochter des Johann Weber.', 14),
        page('Johann Weber, Sohn des Johann Weber.', 15),
      ]),
    ).toEqual([])
  })

  it('uses the real register sections and historical OCR line patterns', () => {
    const suggestions = detectOcrSuggestions(document, [
      page(
        '10. Oct. Anna Wäckerli, Töchterlein d.\nJohann Weber u. der Barbara Müller',
        20,
        { section: 'Taufen 1840' },
      ),
      page(
        '17. Sept. Karl Weber, Söhnlein von\nJohann Weber u der Anna Müller',
        21,
        { section: 'Begräbnisse 1840' },
      ),
      page(
        'Maria Schmid, geb. Weber,\nGattin des Hans Müller',
        22,
        { section: 'Heiraten 1840' },
      ),
      page(
        'Ehe geboren.\nNamen.\nJohann Weber\nEltern.\nNamen.\nFriedrich Weber\nSammtliche Kinder.\ngeboren. confirmirt.',
        23,
        { section: 'Familienregister 1840-1850' },
      ),
      page(
        'Karl Weber, Sohn des Johann Weber',
        24,
        { section: 'Namensregister' },
      ),
      page(
        'Karl Weber, Sohn des Johann Weber',
        25,
        { section: 'Pfarrer und Verwaltung' },
      ),
    ])

    expect(suggestions.map((suggestion) => suggestion.newPerson.firstName)).toEqual(
      expect.arrayContaining(['Anna', 'Karl', 'Maria']),
    )
    expect(suggestions.some((suggestion) => suggestion.source.pageNumber === 24)).toBe(false)
    expect(suggestions.some((suggestion) => suggestion.source.pageNumber === 25)).toBe(false)
    expect(suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Anna')).toMatchObject({
      newPerson: { lastName: 'Wäckerli', gender: 'woman' },
      source: { pageNumber: 20, section: 'Taufen 1840' },
    })
    expect(suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Maria')).toMatchObject({
      relationshipType: 'marriage',
      source: { pageNumber: 22, section: 'Heiraten 1840' },
    })
    expect(suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Karl')).toMatchObject({
      source: { pageNumber: 21, section: 'Begräbnisse 1840' },
    })
    expect(suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Friedrich')).toMatchObject({
      source: { pageNumber: 23, section: 'Familienregister 1840-1850' },
    })
  })

  it('keeps PP-OCRv6 as the primary evidence and supplements it with handwriting OCR', () => {
    const suggestions = detectOcrSuggestions(document, [
      page('Karl Weber, Sohn des Johann Weber.', 30, {
        modelId: SUPPLEMENTAL_OCR_MODEL_ID,
      }),
      page('Karl Weber, Sohn des Johann Weber.', 31, {
        modelId: PRIMARY_OCR_MODEL_ID,
      }),
      page('Lina Weber, Tochter des Johann Weber.', 32, {
        modelId: SUPPLEMENTAL_OCR_MODEL_ID,
      }),
    ])

    expect(suggestions).toHaveLength(2)
    expect(suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Karl')).toMatchObject({
      source: { modelId: PRIMARY_OCR_MODEL_ID, pageNumber: 31 },
    })
    expect(suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Lina')).toMatchObject({
      source: { modelId: SUPPLEMENTAL_OCR_MODEL_ID, pageNumber: 32 },
    })
  })

  it('suggests a missing parent or spouse when the known person is named first', () => {
    const suggestions = detectOcrSuggestions(document, [
      page('Johann Weber, Söhnlein des Karl Weber.', 40, { section: 'Taufen 1840' }),
      page('Hans Müller, Ehemann von Maria Schmid.', 41, { section: 'Heiraten 1840' }),
    ])

    expect(suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Karl')).toMatchObject({
      newPerson: { firstName: 'Karl', lastName: 'Weber', gender: null },
      existingPersonId: 'parent-1',
      direction: 'candidate-parent',
      relationshipType: 'parent-child',
    })
    expect(suggestions.find((suggestion) => suggestion.newPerson.firstName === 'Maria')).toMatchObject({
      newPerson: { firstName: 'Maria', lastName: 'Schmid', gender: 'woman' },
      existingPersonId: 'spouse-1',
      direction: 'spouse',
      relationshipType: 'marriage',
    })
  })

  it('does not merge neighboring register rows into a fabricated name', () => {
    const suggestions = detectOcrSuggestions(document, [
      page(
        'Karl Weber, Sohn des Johann Weber\nHieronymus Kübler, Baur Wittwer der Magdalena Müller\nAnna Schmid, Tochter des Johann Weber',
        42,
        { section: 'Begräbnisse 1840' },
      ),
    ])

    expect(suggestions.map((suggestion) => suggestion.newPerson)).toEqual(expect.arrayContaining([
      expect.objectContaining({ firstName: 'Karl', lastName: 'Weber' }),
      expect.objectContaining({ firstName: 'Anna', lastName: 'Schmid' }),
    ]))
  })
})
