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
      position: { x: 120, y: 80 },
      selected: true,
      data: {
        personId: 'woman-1',
        label: 'Anna Weber',
        years: '1834 - 1901',
      },
    })
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
      type: 'straight',
      selected: false,
      data: { relationshipType: 'marriage', status: 'explicit' },
    })
    expect(marriage?.markerEnd).toBeUndefined()
    expect(parentChild).toMatchObject({
      source: 'man-1',
      target: 'child-1',
      type: 'smoothstep',
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
      minZoom: 0.25,
      maxZoom: 1.4,
    })
  })
})