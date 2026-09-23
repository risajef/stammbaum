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

const ancestorDocument: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    person('anchor', '1900'),
    person('parent', '1870', 'woman'),
    person('grandparent', '1840'),
    person('other-grandparent', '1842'),
    person('parent-partner', '1871', 'man'),
    person('grandparent-partner', '1841', 'woman'),
    person('other-grandparent-partner', '1843', 'man'),
    person('full-sibling', '1872'),
    person('half-sibling', '1873'),
    person('sibling-partner', '1874'),
    person('half-sibling-partner', '1875'),
    person('sibling-child', '1901'),
    person('sibling-child-partner', '1902'),
    person('partner-parent', '1850'),
    person('anchor-partner', '1901'),
  ],
  relationships: [
    relationship('parent-anchor', 'parent-child', 'parent', 'anchor'),
    relationship('grandparent-parent', 'parent-child', 'grandparent', 'parent'),
    relationship('other-grandparent-parent', 'parent-child', 'other-grandparent', 'parent'),
    relationship('grandparent-full-sibling', 'parent-child', 'grandparent', 'full-sibling'),
    relationship('other-grandparent-full-sibling', 'parent-child', 'other-grandparent', 'full-sibling'),
    relationship('other-grandparent-half-sibling', 'parent-child', 'other-grandparent', 'half-sibling'),
    relationship('parent-partner-link', 'marriage', 'parent', 'parent-partner'),
    relationship('grandparent-partner-link', 'marriage', 'grandparent', 'grandparent-partner'),
    relationship('other-grandparent-partner-link', 'marriage', 'other-grandparent', 'other-grandparent-partner'),
    relationship('sibling-partner-link', 'marriage', 'full-sibling', 'sibling-partner'),
    relationship('half-sibling-partner-link', 'marriage', 'half-sibling', 'half-sibling-partner'),
    relationship('full-sibling-child', 'parent-child', 'full-sibling', 'sibling-child'),
    relationship('sibling-partner-parent', 'parent-child', 'partner-parent', 'sibling-partner'),
    relationship('sibling-child-partner-link', 'marriage', 'sibling-child', 'sibling-child-partner'),
    relationship('anchor-partner-link', 'marriage', 'anchor', 'anchor-partner'),
  ],
}

const descendantDocument: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    person('anchor', '1900'),
    person('anchor-partner', '1901'),
    person('child', '1930'),
    person('grandchild', '1960'),
    person('grandchild-partner-a', '1961'),
    person('grandchild-partner-b', '1962'),
    person('partner-a-child', '1980'),
    person('partner-b-child', '1981'),
    person('partner-a-parent', '1935'),
    person('partner-a-child-partner', '1982'),
    person('anchor-partner-child', '1931'),
    person('separate-descendant', '1932'),
  ],
  relationships: [
    relationship('anchor-partner-link', 'marriage', 'anchor', 'anchor-partner'),
    relationship('anchor-child', 'parent-child', 'anchor', 'child'),
    relationship('child-grandchild', 'parent-child', 'child', 'grandchild'),
    relationship('grandchild-partner-a-link', 'marriage', 'grandchild', 'grandchild-partner-a'),
    relationship('grandchild-partner-b-link', 'marriage', 'grandchild', 'grandchild-partner-b'),
    relationship('partner-a-child-link', 'parent-child', 'grandchild-partner-a', 'partner-a-child'),
    relationship('partner-b-child-link', 'parent-child', 'grandchild-partner-b', 'partner-b-child'),
    relationship('partner-a-parent-link', 'parent-child', 'partner-a-parent', 'grandchild-partner-a'),
    relationship('partner-a-child-partner-link', 'marriage', 'partner-a-child', 'partner-a-child-partner'),
    relationship('anchor-partner-child-link', 'parent-child', 'anchor-partner', 'anchor-partner-child'),
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

  it('matches configured name variants and a single token from a compound first name', () => {
    const variantDocument: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        namedPerson('schelling', 'Maria', 'Schelling', '1900-01-01'),
        namedPerson('schilling', 'Maria', 'Schilling', '1900-01-01'),
        namedPerson('weber', 'Anna', 'Weber', '1901-01-01'),
        namedPerson('waeber', 'Anna', 'Wäber', '1901-01-01'),
        namedPerson('jacob', 'Jacob', 'Test', '1902-01-01'),
        namedPerson('jakob', 'Jakob', 'Test', '1902-01-01'),
        namedPerson('elisabeth', 'Elisabeth', 'Test', '1903-01-01'),
        namedPerson('eisabetha', 'Eisabetha', 'Test', '1903-01-01'),
        namedPerson('rahel', 'Rahel', 'Test', '1904-01-01'),
        namedPerson('rachel', 'Rachel', 'Test', '1904-01-01'),
        namedPerson('compound', 'Johann Heinrich', 'Test', '1905-01-01'),
        namedPerson('single', 'Heinrich', 'Test', '1905-01-01'),
        namedPerson('not-variant-a', 'Müller', 'Test', '1906-01-01'),
        namedPerson('not-variant-b', 'Mueller', 'Test', '1906-01-01'),
      ],
      relationships: [],
    }

    expect(findDuplicatePersonPairs(variantDocument, new Map())).toEqual([
      { firstPersonId: 'schelling', secondPersonId: 'schilling', priority: 1 },
      { firstPersonId: 'weber', secondPersonId: 'waeber', priority: 1 },
      { firstPersonId: 'jacob', secondPersonId: 'jakob', priority: 1 },
      { firstPersonId: 'elisabeth', secondPersonId: 'eisabetha', priority: 1 },
      { firstPersonId: 'rahel', secondPersonId: 'rachel', priority: 1 },
      { firstPersonId: 'compound', secondPersonId: 'single', priority: 1 },
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

  it('keeps the bloodline anchor independent from the local view anchor', () => {
    const visible = filterFamilyTreeDocument(document, {
      anchorPersonId: 'spouse',
      distance: 1,
      bloodlineAnchorPersonId: 'anchor',
      bloodlineMode: 'blood',
    })

    expect(visible.persons.map(({ id }) => id)).toEqual(['anchor'])
  })

  it('shows the anchor and all descendants without partner families', () => {
    const descendants = filterFamilyTreeDocument(descendantDocument, {
      bloodlineAnchorPersonId: 'anchor',
      bloodlineMode: 'descendants',
    })

    expect(descendants.persons.map(({ id }) => id)).toEqual([
      'anchor',
      'child',
      'grandchild',
    ])
    expect(descendants.relationships.map(({ id }) => id)).toEqual([
      'anchor-child',
      'child-grandchild',
    ])
  })

  it('follows descendant lines beyond ten generations', () => {
    const persons = Array.from({ length: 12 }, (_, index) => person(`generation-${index}`))
    const longDescendantDocument: FamilyTreeDocument = {
      schemaVersion: 1,
      persons,
      relationships: Array.from({ length: 11 }, (_, index) => relationship(
        `generation-link-${index}`,
        'parent-child',
        `generation-${index}`,
        `generation-${index + 1}`,
      )),
    }

    const descendants = filterFamilyTreeDocument(longDescendantDocument, {
      bloodlineAnchorPersonId: 'generation-0',
      bloodlineMode: 'descendants',
    })

    expect(descendants.persons.map(({ id }) => id)).toEqual(
      persons.map(({ id }) => id),
    )
  })

  it('shows descendant partners and their children without following partner chains', () => {
    const extendedDescendants = filterFamilyTreeDocument(descendantDocument, {
      bloodlineAnchorPersonId: 'anchor',
      bloodlineMode: 'extended-descendants',
    })

    expect(extendedDescendants.persons.map(({ id }) => id)).toEqual([
      'anchor',
      'child',
      'grandchild',
      'grandchild-partner-a',
      'grandchild-partner-b',
      'partner-a-child',
      'partner-b-child',
    ])
    expect(extendedDescendants.persons.map(({ id }) => id)).not.toEqual(
      expect.arrayContaining([
        'anchor-partner',
        'partner-a-parent',
        'partner-a-child-partner',
        'anchor-partner-child',
      ]),
    )
  })

  it('keeps newly created people visible until their filter exception is removed', () => {
    const documentWithNewPerson: FamilyTreeDocument = {
      ...document,
      persons: [...document.persons, person('new-person')],
    }
    const options = {
      anchorPersonId: 'anchor',
      distance: 0,
      bloodlineAnchorPersonId: 'anchor',
      bloodlineMode: 'blood' as const,
      hideLeaves: true,
    }

    const visibleBeforeSave = filterFamilyTreeDocument(documentWithNewPerson, {
      ...options,
      unfilteredPersonIds: ['new-person'],
    })
    const visibleAfterSave = filterFamilyTreeDocument(documentWithNewPerson, options)

    expect(visibleBeforeSave.persons.map(({ id }) => id)).toEqual(['anchor', 'new-person'])
    expect(visibleAfterSave.persons.map(({ id }) => id)).toEqual(['anchor'])
  })

  it('keeps only the parent-child component for blood relatives', () => {
    const bloodRelatives = filterFamilyTreeDocument(document, {
      anchorPersonId: 'anchor',
      bloodlineMode: 'blood',
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

  it('shows direct ancestors and their partners without side lines', () => {
    const directAncestors = filterFamilyTreeDocument(ancestorDocument, {
      anchorPersonId: 'anchor',
      bloodlineMode: 'direct-ancestors',
    })

    expect(directAncestors.persons.map(({ id }) => id)).toEqual([
      'anchor',
      'parent',
      'grandparent',
      'other-grandparent',
      'parent-partner',
      'grandparent-partner',
      'other-grandparent-partner',
    ])
    expect(directAncestors.persons.map(({ id }) => id)).not.toEqual(
      expect.arrayContaining(['full-sibling', 'half-sibling', 'anchor-partner']),
    )
  })

  it('shows ancestor siblings and their partners without their descendants', () => {
    const extendedAncestors = filterFamilyTreeDocument(ancestorDocument, {
      anchorPersonId: 'anchor',
      bloodlineMode: 'extended-direct-ancestors',
    })

    expect(extendedAncestors.persons.map(({ id }) => id)).toEqual([
      'anchor',
      'parent',
      'grandparent',
      'other-grandparent',
      'parent-partner',
      'grandparent-partner',
      'other-grandparent-partner',
      'full-sibling',
      'half-sibling',
      'sibling-partner',
      'half-sibling-partner',
    ])
    expect(extendedAncestors.persons.map(({ id }) => id)).not.toEqual(
      expect.arrayContaining([
        'sibling-child',
        'sibling-child-partner',
        'partner-parent',
        'anchor-partner',
      ]),
    )
    expect(extendedAncestors.relationships.every(({ fromId, toId }) =>
      extendedAncestors.persons.some(({ id }) => id === fromId) &&
      extendedAncestors.persons.some(({ id }) => id === toId))).toBe(true)
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
      bloodlineMode: 'blood',
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
      bloodlineMode: 'blood',
      hideLeaves: true,
    })

    expect(visible.persons.map(({ id }) => id)).toEqual(['anchor', 'mother'])
    expect(visible.relationships.map(({ id }) => id)).toEqual(['mother-anchor'])
  })
})
