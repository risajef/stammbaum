import { describe, expect, it } from 'vitest'

import { projectFamilyTree } from './graph-projection'
import type { FamilyTreeDocument, Gender, Person } from '../domain/types'

const layoutPerson = (
  id: string,
  birthYear: string | null,
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

const parentChild = (id: string, fromId: string, toId: string) => ({
  id,
  type: 'parent-child' as const,
  fromId,
  toId,
  status: 'explicit' as const,
  sourceUrl: null,
})

const documentFixture: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    {
      id: 'woman-1',
      firstName: 'Anna',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: 1834,
      deathYear: 1901,
      position: { x: 100, y: 40 },
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
  relationships: [
    {
      id: 'marriage-1',
      type: 'marriage',
      fromId: 'woman-1',
      toId: 'man-1',
      startDate: '1880-05',
      status: 'explicit',
      sourceUrl: null,
    },
    {
      id: 'parent-child-1',
      type: 'parent-child',
      fromId: 'man-1',
      toId: 'child-1',
      status: 'inferred',
      sourceUrl: 'https://example.org/source',
    },
  ],
}

describe('family tree graph projection', () => {
  it('projects person details and uses automatic positions', () => {
    const projection = projectFamilyTree(documentFixture, { type: 'person', id: 'woman-1' })

    expect(projection.nodes[0]).toMatchObject({
      id: 'woman-1',
      type: 'person',
      position: { x: 12, y: 80 },
      selected: true,
      data: {
        personId: 'woman-1',
        label: 'Anna Weber',
        years: '1834 - 1901',
      },
    })
  })

  it('displays partial life dates without adding missing components', () => {
    const document: FamilyTreeDocument = {
      ...documentFixture,
      persons: documentFixture.persons.map((person) =>
        person.id === 'woman-1'
          ? { ...person, birthYear: '1900-05', deathYear: '1970' }
          : person,
      ),
    }

    const projection = projectFamilyTree(document)

    expect(projection.nodes.find((node) => node.id === 'woman-1')?.data.years).toBe(
      '1900-05 - 1970',
    )
  })

  it('assigns deterministic generation positions to family components', () => {
    const first = projectFamilyTree(documentFixture)
    const second = projectFamilyTree(documentFixture)

    expect(first.nodes).toEqual(second.nodes)
    expect(first.nodes.find((node) => node.id === 'man-1')?.position.y).toBe(
      first.nodes.find((node) => node.id === 'woman-1')?.position.y,
    )
    expect(first.nodes.find((node) => node.id === 'child-1')?.position.y).toBeGreaterThan(
      first.nodes.find((node) => node.id === 'man-1')?.position.y ?? 0,
    )
  })

  it('anchors layers at the oldest known person and keeps parents and spouses on adjacent lines', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('root', '1800', 'woman'),
        layoutPerson('unknown-parent', null, 'man'),
        layoutPerson('spouse', '1810', 'man'),
        layoutPerson('child', '1820', null),
      ],
      relationships: [
        parentChild('unknown-parent-root', 'unknown-parent', 'root'),
        {
          id: 'root-spouse',
          type: 'marriage' as const,
          fromId: 'root',
          toId: 'spouse',
          status: 'explicit' as const,
          sourceUrl: null,
        },
        parentChild('root-child', 'root', 'child'),
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y
    const rootY = y('root')

    expect(rootY).toBe(80)
    expect(y('unknown-parent')).toBeLessThan(rootY ?? 0)
    expect(y('spouse')).toBe(rootY)
    expect(y('child')).toBeGreaterThan(rootY ?? 0)
  })

  it('centers a single child directly below its parent', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [layoutPerson('parent', '1800'), layoutPerson('child', '1820')],
      relationships: [parentChild('parent-child', 'parent', 'child')],
    }

    const projection = projectFamilyTree(document)
    const parent = projection.nodes.find((node) => node.id === 'parent')
    const child = projection.nodes.find((node) => node.id === 'child')

    expect(child?.position.x).toBe(parent?.position.x)
    expect(child?.position.y).toBe((parent?.position.y ?? 0) + 132)
  })

  it('centers a single child below a two-parent marriage block', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('parent-woman', '1801', 'woman'),
        layoutPerson('parent-man', '1800', 'man'),
        layoutPerson('only-child', '1820'),
      ],
      relationships: [
        {
          id: 'parent-marriage',
          type: 'marriage' as const,
          fromId: 'parent-woman',
          toId: 'parent-man',
          status: 'explicit' as const,
          sourceUrl: null,
        },
        parentChild('woman-only-child', 'parent-woman', 'only-child'),
        parentChild('man-only-child', 'parent-man', 'only-child'),
      ],
    }

    const projection = projectFamilyTree(document)
    const parentNodes = ['parent-man', 'parent-woman'].map((id) =>
      projection.nodes.find((node) => node.id === id),
    )
    const child = projection.nodes.find((node) => node.id === 'only-child')
    const parentLeft = Math.min(...parentNodes.map((node) => node?.position.x ?? 0))
    const parentRight = Math.max(...parentNodes.map((node) => (node?.position.x ?? 0) + 148))
    const parentCenter = (parentLeft + parentRight) / 2
    const childCenter = (child?.position.x ?? 0) + 74

    expect(childCenter).toBe(parentCenter)
    expect(child?.position.y).toBe((parentNodes[0]?.position.y ?? 0) + 132)
  })

  it('places every direct parent exactly one layer above a child outside a DAG', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('parent-a', '1780'),
        layoutPerson('parent-b', '1781'),
        layoutPerson('child', '1800'),
      ],
      relationships: [
        parentChild('parent-a-child', 'parent-a', 'child'),
        parentChild('parent-b-child', 'parent-b', 'child'),
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y
    const childY = y('child') ?? 0

    expect(y('parent-a')).toBe(childY - 132)
    expect(y('parent-b')).toBe(childY - 132)
  })

  it('keeps siblings on the same layer', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('parent', '1780'),
        layoutPerson('sibling-a', '1800'),
        layoutPerson('sibling-b', '1802'),
      ],
      relationships: [
        parentChild('parent-sibling-a', 'parent', 'sibling-a'),
        parentChild('parent-sibling-b', 'parent', 'sibling-b'),
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y

    expect(y('sibling-a')).toBe(y('sibling-b'))
  })

  it('orders fully dated siblings with the oldest on the left', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('parent', '1780'),
        layoutPerson('youngest', '1905-08-01'),
        layoutPerson('middle', '1903-04-02'),
        layoutPerson('oldest', '1900-02-03'),
      ],
      relationships: [
        parentChild('parent-youngest', 'parent', 'youngest'),
        parentChild('parent-middle', 'parent', 'middle'),
        parentChild('parent-oldest', 'parent', 'oldest'),
      ],
    }

    const projection = projectFamilyTree(document)
    const x = (id: string) => projection.nodes.find((node) => node.id === id)?.position.x ?? 0

    expect(x('oldest')).toBeLessThan(x('middle'))
    expect(x('middle')).toBeLessThan(x('youngest'))
  })

  it('orders half-siblings together and puts missing birth dates last', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('parent-a', '1780'),
        layoutPerson('parent-b', '1781'),
        layoutPerson('unknown', null),
        layoutPerson('partial', '1902'),
        layoutPerson('youngest', '1910-01-01'),
        layoutPerson('half-sibling', '1905-01-01'),
        layoutPerson('oldest', '1900-01-01'),
      ],
      relationships: [
        parentChild('parent-a-unknown', 'parent-a', 'unknown'),
        parentChild('parent-a-partial', 'parent-a', 'partial'),
        parentChild('parent-a-youngest', 'parent-a', 'youngest'),
        parentChild('parent-a-half-sibling', 'parent-a', 'half-sibling'),
        parentChild('parent-a-oldest', 'parent-a', 'oldest'),
        parentChild('parent-b-half-sibling', 'parent-b', 'half-sibling'),
      ],
    }

    const projection = projectFamilyTree(document)
    const x = (id: string) => projection.nodes.find((node) => node.id === id)?.position.x ?? 0
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y

    expect(y('oldest')).toBe(y('half-sibling'))
    expect(y('half-sibling')).toBe(y('youngest'))
    expect(x('oldest')).toBeLessThan(x('half-sibling'))
    expect(x('oldest')).toBeLessThan(x('partial'))
    expect(x('partial')).toBeLessThan(x('half-sibling'))
    expect(x('half-sibling')).toBeLessThan(x('youngest'))
    expect(x('youngest')).toBeLessThan(x('unknown'))
  })

  it('keeps spouses on the same layer when one spouse has a deeper ancestry', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('ancestor-a', '1700'),
        layoutPerson('ancestor-b', '1720'),
        layoutPerson('spouse-a', '1800', 'woman'),
        layoutPerson('spouse-b', '1801', 'man'),
      ],
      relationships: [
        parentChild('ancestor-a-b', 'ancestor-a', 'ancestor-b'),
        parentChild('ancestor-b-spouse-b', 'ancestor-b', 'spouse-b'),
        {
          id: 'spouse-marriage',
          type: 'marriage' as const,
          fromId: 'spouse-a',
          toId: 'spouse-b',
          status: 'explicit' as const,
          sourceUrl: null,
        },
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y

    expect(y('spouse-a')).toBe(y('spouse-b'))
  })

  it('uses the first YAML person when the oldest birth dates tie', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('yaml-first', '1800'),
        layoutPerson('yaml-second', '1800'),
        layoutPerson('descendant', '1820'),
      ],
      relationships: [
        parentChild('second-first', 'yaml-second', 'yaml-first'),
        parentChild('first-descendant', 'yaml-first', 'descendant'),
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y

    expect(y('yaml-first')).toBe(80)
    expect(y('yaml-second')).toBeLessThan(y('yaml-first') ?? 0)
    expect(y('descendant')).toBeGreaterThan(y('yaml-first') ?? 0)
  })

  it('keeps YAML order when partial birth dates cannot be safely compared', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('yaml-first', '1800-05'),
        layoutPerson('yaml-second', '1800'),
      ],
      relationships: [parentChild('second-first', 'yaml-second', 'yaml-first')],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y

    expect(y('yaml-first')).toBe(80)
    expect(y('yaml-second')).toBeLessThan(y('yaml-first') ?? 0)
  })

  it('uses the first YAML person as the root generation even when an older parent exists', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('yaml-root', '1900'),
        layoutPerson('older-parent', '1800'),
        layoutPerson('descendant', '1920'),
      ],
      relationships: [
        parentChild('older-root', 'older-parent', 'yaml-root'),
        parentChild('root-descendant', 'yaml-root', 'descendant'),
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y
    const rootY = y('yaml-root') ?? 0

    expect(rootY).toBe(80)
    expect(y('older-parent')).toBe(rootY - 132)
    expect(y('descendant')).toBe(rootY + 132)
  })

  it('keeps a shallow leaf above a much deeper leaf in the same family graph', () => {
    const deepBranch = Array.from({ length: 5 }, (_, index) =>
      layoutPerson(`deep-parent-${index + 1}`, `${1620 + index * 30}`),
    )
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('root', '1595'),
        layoutPerson('spouse-parent', '1770'),
        layoutPerson('independent-parent', '1797'),
        layoutPerson('magdalena', '1823'),
        layoutPerson('spouse', '1800', 'man'),
        ...deepBranch,
        layoutPerson('finn', '2025'),
      ],
      relationships: [
        parentChild('root-spouse-parent', 'root', 'spouse-parent'),
        parentChild('spouse-parent-spouse', 'spouse-parent', 'spouse'),
        parentChild('independent-parent-magdalena', 'independent-parent', 'magdalena'),
        {
          id: 'spouse-marriage',
          type: 'marriage',
          fromId: 'magdalena',
          toId: 'spouse',
          status: 'explicit',
          sourceUrl: null,
        },
        parentChild('root-deep-parent-1', 'root', 'deep-parent-1'),
        ...deepBranch.slice(1).map((person, index) =>
          parentChild(
            `deep-parent-${index + 1}-${index + 2}`,
            `deep-parent-${index + 1}`,
            person.id,
          ),
        ),
        parentChild('deep-parent-5-finn', 'deep-parent-5', 'finn'),
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y

    expect(y('magdalena')).toBeLessThan(y('finn') ?? 0)
  })

  it('uses the longest path when a DAG reaches a descendant through multiple branches', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('root', '1700'),
        layoutPerson('short-branch', '1720'),
        layoutPerson('long-branch', '1720'),
        layoutPerson('long-intermediate', '1740'),
        layoutPerson('descendant', '1760'),
      ],
      relationships: [
        parentChild('root-short', 'root', 'short-branch'),
        parentChild('root-long', 'root', 'long-branch'),
        parentChild('long-intermediate-link', 'long-branch', 'long-intermediate'),
        parentChild('short-descendant', 'short-branch', 'descendant'),
        parentChild('long-descendant', 'long-intermediate', 'descendant'),
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y
    const rootY = y('root') ?? 0
    const longBranchY = y('long-branch') ?? 0
    const descendantY = y('descendant') ?? 0

    expect(longBranchY - rootY).toBe(132)
    expect(descendantY - rootY).toBe(396)
    expect(y('short-branch')).toBeLessThan(descendantY)
    expect(y('long-intermediate')).toBeLessThan(descendantY)
    expect(descendantY - (y('long-intermediate') ?? 0)).toBe(132)
  })

  it('only requires parents to be above a marriage group when parent paths form a DAG', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('root', '1700'),
        layoutPerson('short-parent', '1720'),
        layoutPerson('long-parent-a', '1721'),
        layoutPerson('long-parent-b', '1740'),
        layoutPerson('spouse-a', '1800', 'woman'),
        layoutPerson('spouse-b', '1801', 'man'),
      ],
      relationships: [
        parentChild('root-short-parent', 'root', 'short-parent'),
        parentChild('root-long-parent-a', 'root', 'long-parent-a'),
        parentChild('long-parent-a-b', 'long-parent-a', 'long-parent-b'),
        parentChild('short-parent-spouse-a', 'short-parent', 'spouse-a'),
        parentChild('long-parent-b-spouse-b', 'long-parent-b', 'spouse-b'),
        {
          id: 'spouse-marriage',
          type: 'marriage' as const,
          fromId: 'spouse-a',
          toId: 'spouse-b',
          status: 'explicit' as const,
          sourceUrl: null,
        },
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y
    const spouseY = y('spouse-a') ?? 0

    expect(y('spouse-b')).toBe(spouseY)
    expect(y('short-parent')).toBeLessThan(spouseY)
    expect(y('long-parent-b')).toBe(spouseY - 132)
    expect(spouseY - (y('short-parent') ?? 0)).toBeGreaterThan(132)
  })

  it('keeps a marriage group on its relational layer when a spouse has deeper ancestry', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        ...Array.from({ length: 6 }, (_, index) =>
          layoutPerson(`ancestor-${index}`, `${1700 + index * 20}`),
        ),
        layoutPerson('maria-parent-a', '1900', 'woman'),
        layoutPerson('maria-parent-b', '1901', 'man'),
        layoutPerson('maria-schelling', '1920', 'woman'),
        layoutPerson('maria-spouse', '1820', 'man'),
      ],
      relationships: [
        ...Array.from({ length: 5 }, (_, index) =>
          parentChild(
            `ancestor-${index}-${index + 1}`,
            `ancestor-${index}`,
            `ancestor-${index + 1}`,
          ),
        ),
        parentChild('ancestor-spouse', 'ancestor-5', 'maria-spouse'),
        parentChild('parent-a-maria', 'maria-parent-a', 'maria-schelling'),
        parentChild('parent-b-maria', 'maria-parent-b', 'maria-schelling'),
        {
          id: 'maria-marriage',
          type: 'marriage',
          fromId: 'maria-schelling',
          toId: 'maria-spouse',
          status: 'explicit',
          sourceUrl: null,
        },
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y

    expect(y('maria-parent-a')).toBe(y('maria-parent-b'))
    expect(y('maria-schelling')).toBe(y('maria-spouse'))
    expect((y('maria-schelling') ?? 0) - (y('maria-parent-a') ?? 0)).toBe(132)
  })

  it('keeps every parent above a child in a mixed-depth marriage group', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('ancestor-0', '1700'),
        layoutPerson('ancestor-1', '1720'),
        layoutPerson('ancestor-2', '1740'),
        layoutPerson('maria-parent', '1900'),
        layoutPerson('maria-schelling', '1920', 'woman'),
        layoutPerson('maria-spouse', '1820', 'man'),
      ],
      relationships: [
        parentChild('ancestor-0-1', 'ancestor-0', 'ancestor-1'),
        parentChild('ancestor-1-2', 'ancestor-1', 'ancestor-2'),
        parentChild('ancestor-2-spouse', 'ancestor-2', 'maria-spouse'),
        parentChild('parent-maria', 'maria-parent', 'maria-schelling'),
        {
          id: 'maria-marriage',
          type: 'marriage',
          fromId: 'maria-schelling',
          toId: 'maria-spouse',
          status: 'explicit',
          sourceUrl: null,
        },
      ],
    }

    const projection = projectFamilyTree(document)
    const y = (id: string) => projection.nodes.find((node) => node.id === id)?.position.y

    expect(y('maria-spouse')).toBeGreaterThan(y('ancestor-2') ?? 0)
    expect(y('maria-schelling')).toBeGreaterThan(y('maria-parent') ?? 0)
  })

  it('keeps married men left of women and packs sibling components compactly', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('grandparent', '1700', 'man'),
        layoutPerson('sibling-g', '1740', 'man'),
        layoutPerson('sibling-h', '1735', 'woman'),
        layoutPerson('parent-woman', '1740', 'woman'),
        layoutPerson('parent-man', '1738', 'man'),
        ...['c', 'd', 'e', 'f'].map((id, index) => layoutPerson(`child-${id}`, `${1780 + index}`)),
      ],
      relationships: [
        parentChild('grandparent-sibling-g', 'grandparent', 'sibling-g'),
        parentChild('grandparent-sibling-h', 'grandparent', 'sibling-h'),
        parentChild('grandparent-parent-woman', 'grandparent', 'parent-woman'),
        {
          id: 'parent-marriage',
          type: 'marriage' as const,
          fromId: 'parent-woman',
          toId: 'parent-man',
          status: 'explicit' as const,
          sourceUrl: null,
        },
        ...['c', 'd', 'e', 'f'].flatMap((id) => [
          parentChild(`parent-woman-child-${id}`, 'parent-woman', `child-${id}`),
          parentChild(`parent-man-child-${id}`, 'parent-man', `child-${id}`),
        ]),
      ],
    }

    const projection = projectFamilyTree(document)
    const node = (id: string) => projection.nodes.find((candidate) => candidate.id === id)
    const parentWoman = node('parent-woman')
    const parentMan = node('parent-man')
    const siblingNodes = ['sibling-g', 'sibling-h'].map((id) => node(id))
    const siblingRight = Math.max(...siblingNodes.map((candidate) => (candidate?.position.x ?? 0) + 148))

    expect(parentMan?.position.x).toBeLessThan(parentWoman?.position.x ?? 0)
    expect(siblingRight).toBeLessThan(parentMan?.position.x ?? 0)
  })

  it('packs a right subtree only around the widest overlapping layer', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('left-root', '1700'),
        layoutPerson('left-child-a', '1720'),
        layoutPerson('left-child-b', '1721'),
        ...Array.from({ length: 6 }, (_, index) =>
          layoutPerson(`grandchild-${index}`, `${1740 + index}`),
        ),
        layoutPerson('right-root', '1701'),
        layoutPerson('right-child', '1722'),
      ],
      relationships: [
        parentChild('left-a', 'left-root', 'left-child-a'),
        parentChild('left-b', 'left-root', 'left-child-b'),
        ...Array.from({ length: 6 }, (_, index) =>
          parentChild(`grandchild-${index}`, 'left-child-b', `grandchild-${index}`),
        ),
        parentChild('right-child', 'right-root', 'right-child'),
      ],
    }

    const projection = projectFamilyTree(document)
    const leftRoot = projection.nodes.find((node) => node.id === 'left-root')
    const rightRoot = projection.nodes.find((node) => node.id === 'right-root')
    const rootGap = (rightRoot?.position.x ?? 0) - ((leftRoot?.position.x ?? 0) + 148)

    expect(rootGap).toBeLessThan(300)
  })

  it('keeps a connected multiple-marriage group together with men first', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        layoutPerson('woman', '1800', 'woman'),
        layoutPerson('first-husband', '1798', 'man'),
        layoutPerson('second-husband', '1802', 'man'),
      ],
      relationships: [
        {
          id: 'first-marriage',
          type: 'marriage' as const,
          fromId: 'woman',
          toId: 'first-husband',
          status: 'explicit' as const,
          sourceUrl: null,
        },
        {
          id: 'second-marriage',
          type: 'marriage' as const,
          fromId: 'woman',
          toId: 'second-husband',
          status: 'explicit' as const,
          sourceUrl: null,
        },
      ],
    }

    const projection = projectFamilyTree(document)
    const node = (id: string) => projection.nodes.find((candidate) => candidate.id === id)
    const woman = node('woman')
    const firstHusband = node('first-husband')
    const secondHusband = node('second-husband')

    expect(firstHusband?.position.y).toBe(woman?.position.y)
    expect(secondHusband?.position.y).toBe(woman?.position.y)
    expect(firstHusband?.position.x).toBeLessThan(woman?.position.x ?? 0)
    expect(secondHusband?.position.x).toBeLessThan(woman?.position.x ?? 0)
    expect(Math.abs((firstHusband?.position.x ?? 0) - (secondHusband?.position.x ?? 0))).toBeLessThan(200)
  })

  it('places spouses together, children below them, and ignores saved positions', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        {
          id: 'parent-a',
          firstName: 'Anna',
          lastName: 'Weber',
          gender: 'woman',
          birthYear: 1900,
          deathYear: null,
          position: { x: 900, y: 900 },
        },
        {
          id: 'spouse-b',
          firstName: 'Hans',
          lastName: 'Weber',
          gender: 'man',
          birthYear: 1898,
          deathYear: null,
          position: { x: -900, y: -900 },
        },
        {
          id: 'child-c',
          firstName: 'Lina',
          lastName: 'Weber',
          gender: 'woman',
          birthYear: 1925,
          deathYear: null,
          position: { x: 40, y: 40 },
        },
        {
          id: 'sibling-d',
          firstName: 'Marta',
          lastName: 'Weber',
          gender: 'woman',
          birthYear: 1928,
          deathYear: null,
          position: { x: 40, y: 40 },
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
        {
          id: 'parent-a-sibling-d',
          type: 'parent-child',
          fromId: 'parent-a',
          toId: 'sibling-d',
          status: 'explicit',
          sourceUrl: null,
        },
      ],
    }

    const projection = projectFamilyTree(document)
    const parent = projection.nodes.find((node) => node.id === 'parent-a')
    const spouse = projection.nodes.find((node) => node.id === 'spouse-b')
    const child = projection.nodes.find((node) => node.id === 'child-c')
    const sibling = projection.nodes.find((node) => node.id === 'sibling-d')

    expect(parent?.position.y).toBe(spouse?.position.y)
    expect(Math.abs((parent?.position.x ?? 0) - (spouse?.position.x ?? 0))).toBeLessThan(220)
    expect(child?.position.y).toBeGreaterThan(parent?.position.y ?? 0)
    expect(sibling?.position.y).toBe(child?.position.y)
    expect(parent?.position).not.toEqual({ x: 900, y: 900 })
    expect(spouse?.position).not.toEqual({ x: -900, y: -900 })
  })

  it('aligns co-parents without requiring a marriage relationship', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        {
          id: 'grandparent',
          firstName: 'Ernst',
          lastName: 'Weber',
          gender: 'man',
          birthYear: 1870,
          deathYear: null,
          position: null,
        },
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
          id: 'parent-b',
          firstName: 'Hans',
          lastName: 'Meyer',
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
          id: 'grandparent-parent-a',
          type: 'parent-child',
          fromId: 'grandparent',
          toId: 'parent-a',
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
        {
          id: 'parent-b-child-c',
          type: 'parent-child',
          fromId: 'parent-b',
          toId: 'child-c',
          status: 'explicit',
          sourceUrl: null,
        },
      ],
    }

    const projection = projectFamilyTree(document)
    const parentA = projection.nodes.find((node) => node.id === 'parent-a')
    const parentB = projection.nodes.find((node) => node.id === 'parent-b')
    const child = projection.nodes.find((node) => node.id === 'child-c')

    expect(parentA?.position.y).toBe(parentB?.position.y)
    expect(Math.abs((parentA?.position.x ?? 0) - (parentB?.position.x ?? 0))).toBeLessThan(220)
    expect(child?.position.y).toBeGreaterThan(parentA?.position.y ?? 0)
  })

  it('packs unrelated people compactly and centers the layout', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        {
          id: 'person-a',
          firstName: 'Anna',
          lastName: 'Weber',
          gender: 'woman',
          birthYear: 1900,
          deathYear: null,
          position: null,
        },
        {
          id: 'person-b',
          firstName: 'Hans',
          lastName: 'Meyer',
          gender: 'man',
          birthYear: 1901,
          deathYear: null,
          position: null,
        },
        {
          id: 'person-c',
          firstName: 'Lina',
          lastName: 'Graf',
          gender: 'woman',
          birthYear: 1902,
          deathYear: null,
          position: null,
        },
      ],
      relationships: [],
    }

    const projection = projectFamilyTree(document)
    const positions = projection.nodes.map((node) => node.position)
    const sortedPositions = [...positions].sort((first, second) => first.x - second.x)
    const leftEdge = Math.min(...positions.map((position) => position.x))
    const rightEdge = Math.max(...positions.map((position) => position.x + 148))

    expect(Math.abs(leftEdge + rightEdge)).toBeLessThan(2)
    expect(sortedPositions[1].x - sortedPositions[0].x).toBeLessThan(210)
  })

  it('packs a separate root family next to a populated child area', () => {
    const document: FamilyTreeDocument = {
      schemaVersion: 1,
      persons: [
        {
          id: 'root-a',
          firstName: 'Anna',
          lastName: 'Weber',
          gender: 'woman',
          birthYear: 1800,
          deathYear: null,
          position: null,
        },
        ...Array.from({ length: 6 }, (_, index) => ({
          id: `child-${index}`,
          firstName: `Kind${index}`,
          lastName: 'Weber',
          gender: 'woman' as const,
          birthYear: 1830 + index,
          deathYear: null,
          position: null,
        })),
        {
          id: 'root-b',
          firstName: 'Hans',
          lastName: 'Meyer',
          gender: 'man',
          birthYear: 1801,
          deathYear: null,
          position: null,
        },
      ],
      relationships: Array.from({ length: 6 }, (_, index) => ({
        id: `parent-child-${index}`,
        type: 'parent-child' as const,
        fromId: 'root-a',
        toId: `child-${index}`,
        status: 'explicit' as const,
        sourceUrl: null,
      })),
    }

    const projection = projectFamilyTree(document)
    const rootA = projection.nodes.find((node) => node.id === 'root-a')
    const rootB = projection.nodes.find((node) => node.id === 'root-b')
    const rootARight = (rootA?.position.x ?? 0) + 148
    const rootBLeft = rootB?.position.x ?? 0

    expect(rootA?.position.y).toBe(rootB?.position.y)
    expect(rootARight).toBeLessThanOrEqual(rootBLeft)
  })

  it('applies temporary positions without changing saved person positions', () => {
    const temporaryPositions = new Map([['woman-1', { x: 900, y: 700 }]])
    const projection = projectFamilyTree(documentFixture, undefined, temporaryPositions)

    expect(projection.nodes.find((node) => node.id === 'woman-1')?.position).toEqual({
      x: 900,
      y: 700,
    })
    expect(documentFixture.persons[0].position).toEqual({ x: 100, y: 40 })
  })

  it('projects marriage and parent-child edge semantics and status styles', () => {
    const projection = projectFamilyTree(documentFixture, {
      type: 'relationship',
      id: 'parent-child-1',
    })
    const marriage = projection.edges.find((edge) => edge.id === 'marriage-1')
    const parentChild = projection.edges.find((edge) => edge.id === 'parent-child-1')

    expect(marriage).toMatchObject({
      source: 'woman-1',
      target: 'man-1',
      sourceHandle: 'marriage-side',
      targetHandle: 'marriage-side',
      type: 'simplebezier',
      label: '⚭',
      selected: false,
      data: { relationshipType: 'marriage', status: 'explicit' },
    })
    expect(marriage?.markerEnd).toBeUndefined()
    expect(parentChild).toMatchObject({
      source: 'man-1',
      target: 'child-1',
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top',
      type: 'simplebezier',
      label: '',
      selected: true,
      data: {
        relationshipType: 'parent-child',
        status: 'inferred',
        sourceUrl: 'https://example.org/source',
      },
      style: { strokeDasharray: '7 5' },
    })
    expect(parentChild?.markerEnd).toBeDefined()
  })

  it('projects a visible origin class and data value for every relationship origin', () => {
    const document: FamilyTreeDocument = {
      ...documentFixture,
      relationships: [
        { ...documentFixture.relationships[0], origin: 'manual' },
        { ...documentFixture.relationships[1], origin: 'ocr-suggestion' },
        {
          ...documentFixture.relationships[1],
          id: 'parent-child-automatic',
          origin: 'automatic-inference',
        },
      ],
    }

    const projection = projectFamilyTree(document)

    expect(projection.edges.map((edge) => edge.className)).toEqual([
      expect.stringContaining('relationship-edge--manual'),
      expect.stringContaining('relationship-edge--ocr-suggestion'),
      expect.stringContaining('relationship-edge--automatic-inference'),
    ])
    expect(projection.edges.map((edge) => edge.data?.origin)).toEqual([
      'manual',
      'ocr-suggestion',
      'automatic-inference',
    ])
  })

  it('exposes stable fit-view settings for an overview action', () => {
    const projection = projectFamilyTree(documentFixture)

    expect(projection.fitViewOptions).toEqual({
      padding: 0.2,
      minZoom: 0.01,
      maxZoom: 1.4,
    })
  })
})
