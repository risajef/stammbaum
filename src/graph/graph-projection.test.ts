import { describe, expect, it } from 'vitest'

import { projectFamilyTree } from './graph-projection'
import type { FamilyTreeDocument } from '../domain/types'

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
      position: { x: -160, y: 80 },
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

  it('does not create global-index gaps between separate root families', () => {
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

    expect(Math.abs((rootA?.position.x ?? 0) - (rootB?.position.x ?? 0))).toBeLessThan(220)
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
      type: 'simplebezier',
      label: 'Ehe',
      selected: false,
      data: { relationshipType: 'marriage', status: 'explicit' },
    })
    expect(marriage?.markerEnd).toBeUndefined()
    expect(parentChild).toMatchObject({
      source: 'man-1',
      target: 'child-1',
      type: 'simplebezier',
      label: 'Eltern-Kind',
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

  it('exposes stable fit-view settings for an overview action', () => {
    const projection = projectFamilyTree(documentFixture)

    expect(projection.fitViewOptions).toEqual({
      padding: 0.2,
      minZoom: 0.01,
      maxZoom: 1.4,
    })
  })
})