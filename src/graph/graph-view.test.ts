import { describe, expect, it } from 'vitest'

import type { FamilyTreeDocument, Gender, Person, Relationship } from '../domain/types'
import {
  filterFamilyTreeDocument,
  findDuplicatePersonPairs,
  findPersonSearchMatches,
} from './graph-view'

const person = (
  id: string,
  birthYear: string | null = null,
  gender: Gender | null = null,
): Person => ({
  id,
  firstName: id,
  lastName: 'Test',
  gender,
  birthYear,
  deathYear: null,
  position: null,
})

const relationship = (
  id: string,
  type: Relationship['type'],
  fromId: string,
  toId: string,
): Relationship => ({
  id,
  type,
  fromId,
  toId,
  status: 'explicit',
  sourceUrl: null,
})

const document: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    person('anchor', '1900'),
    person('mother', '1870', 'woman'),
    person('sibling', '1920'),
    person('child', '1940'),
    person('spouse', '1901', 'man'),
    person('spouse-parent', '1875'),
    person('separate', '1902'),
  ],
  relationships: [
    relationship('anchor-spouse', 'marriage', 'anchor', 'spouse'),
    relationship('mother-anchor', 'parent-child', 'mother', 'anchor'),
    relationship('mother-sibling', 'parent-child', 'mother', 'sibling'),
    relationship('anchor-child', 'parent-child', 'anchor', 'child'),
    relationship('spouse-parent-link', 'parent-child', 'spouse-parent', 'spouse'),
  ],
}

const namedPerson = (
  id: string,
  firstName: string,
  lastName: string,
  birthYear: string | null,
): Person => ({
  id,
  firstName,
  lastName,
  gender: null,
  birthYear,
  deathYear: null,
  position: null,
})

describe('family tree view projection', () => {
  it('finds and ranks compatible same-name pairs using dates and layout generations', () => {
    const duplicateDocument: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        namedPerson('full-a', ' Anna ', 'Weber', '1900-05-20'),
        namedPerson('full-b', 'anna', 'weber', '1900-05-20'),
        namedPerson('partial-a', 'Berta', 'Weber', '1910-05'),
        namedPerson('partial-b', 'Berta', 'Weber', '1910-05-20'),
        namedPerson('mixed-a', 'Clara', 'Weber', '1920-05-20'),
        namedPerson('mixed-b', 'Clara', 'Weber', null),
        namedPerson('missing-a', 'Dora', 'Weber', null),
        namedPerson('missing-b', 'Dora', 'Weber', null),
        namedPerson('far-missing', 'Dora', 'Weber', null),
        namedPerson('incompatible-a', 'Elsa', 'Weber', '1930-05'),
        namedPerson('incompatible-b', 'Elsa', 'Weber', '1930-06'),
        namedPerson('umlaut', 'Müller', 'Test', null),
        namedPerson('transliterated', 'Mueller', 'Test', null),
      ],
      relationships: [],
    }

    const generations = new Map([
      ['mixed-a', 4],
      ['mixed-b', 5],
      ['missing-a', 6],
      ['missing-b', 7],
      ['far-missing', 9],
    ])

    expect(findDuplicatePersonPairs(duplicateDocument, generations)).toEqual([
      { firstPersonId: 'full-a', secondPersonId: 'full-b', priority: 1 },
      { firstPersonId: 'partial-a', secondPersonId: 'partial-b', priority: 2 },
      { firstPersonId: 'mixed-a', secondPersonId: 'mixed-b', priority: 3 },
      { firstPersonId: 'missing-a', secondPersonId: 'missing-b', priority: 4 },
    ])
  })

  it('returns every pair for a same-name set in stable document order', () => {
    const duplicateDocument: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        namedPerson('one', 'Friedrich', 'Schmidt', '1800-01-01'),
        namedPerson('two', 'Friedrich', 'Schmidt', '1800-01-01'),
        namedPerson('three', 'Friedrich', 'Schmidt', '1800-01-01'),
      ],
      relationships: [],
    }

    expect(findDuplicatePersonPairs(duplicateDocument, new Map())).toEqual([
      { firstPersonId: 'one', secondPersonId: 'two', priority: 1 },
      { firstPersonId: 'one', secondPersonId: 'three', priority: 1 },
      { firstPersonId: 'two', secondPersonId: 'three', priority: 1 },
    ])
  })

  it('excludes direct parent-child pairs even when their missing dates are generation-compatible', () => {
    const directFamilyDocument: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        namedPerson('child', 'Anna', 'Weber', null),
        namedPerson('parent', 'Anna', 'Weber', null),
      ],
      relationships: [relationship('parent-child', 'parent-child', 'parent', 'child')],
    }

    expect(findDuplicatePersonPairs(directFamilyDocument, new Map([
      ['parent', 2],
      ['child', 3],
    ]))).toEqual([])
  })

  it('orders visible name matches by known birth date and keeps unknown dates last', () => {
    const searchableDocument: FamilyTreeDocument = {
      ...document,
      persons: [
        person('match-later', '1920'),
        person('match-unknown'),
        person('match-older', '1890'),
        person('match-partial', '1900-05'),
        person('match-same-year', '1900'),
        person('other', '1800'),
      ],
    }

    expect(findPersonSearchMatches(searchableDocument, 'MATCH').map(({ id }) => id)).toEqual([
      'match-older',
      'match-partial',
      'match-same-year',
      'match-later',
      'match-unknown',
    ])
  })

  it('keeps local view people within the selected undirected relationship distance', () => {
    const local = filterFamilyTreeDocument(document, {
      anchorPersonId: 'anchor',
      distance: 2,
    })

    expect(local.persons.map(({ id }) => id)).toEqual([
      'anchor',
      'mother',
      'sibling',
      'child',
      'spouse',
      'spouse-parent',
    ])
    expect(local.relationships.map(({ id }) => id)).toEqual([
      'anchor-spouse',
      'mother-anchor',
      'mother-sibling',
      'anchor-child',
      'spouse-parent-link',
    ])
  })

  it('keeps only the parent-child component for blood relatives', () => {
    const bloodRelatives = filterFamilyTreeDocument(document, {
      anchorPersonId: 'anchor',
      bloodOnly: true,
    })

    expect(bloodRelatives.persons.map(({ id }) => id)).toEqual([
      'anchor',
      'mother',
      'sibling',
      'child',
    ])
    expect(bloodRelatives.relationships.map(({ id }) => id)).toEqual([
      'mother-anchor',
      'mother-sibling',
      'anchor-child',
    ])
  })

  it('does not cross from a descendant to the other parent or that family', () => {
    const documentWithPartners: FamilyTreeDocument = {
      ...document,
      persons: [
        ...document.persons,
        person('child-partner', '1941'),
        person('partner-parent', '1910'),
        person('grandchild', '1960'),
      ],
      relationships: [
        ...document.relationships,
        relationship('child-partner-child', 'parent-child', 'child-partner', 'child'),
        relationship('partner-parent-link', 'parent-child', 'partner-parent', 'child-partner'),
        relationship('child-grandchild', 'parent-child', 'child', 'grandchild'),
      ],
    }

    const bloodRelatives = filterFamilyTreeDocument(documentWithPartners, {
      anchorPersonId: 'anchor',
      bloodOnly: true,
    })

    expect(bloodRelatives.persons.map(({ id }) => id)).toEqual([
      'anchor',
      'mother',
      'sibling',
      'child',
      'grandchild',
    ])
    expect(bloodRelatives.persons.map(({ id }) => id)).not.toContain('child-partner')
    expect(bloodRelatives.persons.map(({ id }) => id)).not.toContain('partner-parent')
  })

  it('evaluates hidden leaves against children in the complete document', () => {
    const visible = filterFamilyTreeDocument(document, {
      anchorPersonId: 'anchor',
      distance: 1,
      hideLeaves: true,
    })

    expect(visible.persons.map(({ id }) => id)).toEqual(['anchor', 'mother'])
    expect(visible.relationships.map(({ id }) => id)).toEqual(['mother-anchor'])
  })

  it('intersects filters and removes relationships with hidden endpoints', () => {
    const visible = filterFamilyTreeDocument(document, {
      anchorPersonId: 'anchor',
      distance: 2,
      bloodOnly: true,
      hideLeaves: true,
    })

    expect(visible.persons.map(({ id }) => id)).toEqual(['anchor', 'mother'])
    expect(visible.relationships.map(({ id }) => id)).toEqual(['mother-anchor'])
  })
})
