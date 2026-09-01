import { MarkerType, type Edge, type Node } from '@xyflow/react'

import type {
  FamilyTreeDocument,
  Person,
  Position,
  Relationship,
} from '../domain/types'

export type PersonNodeData = Record<string, unknown> & {
  personId: string
  label: string
  years: string
  gender: Person['gender']
}

export type RelationshipEdgeData = Record<string, unknown> & {
  relationshipId: string
  relationshipType: Relationship['type']
  status: Relationship['status']
  sourceUrl: Relationship['sourceUrl']
}

export type GraphSelection =
  | { type: 'person'; id: string }
  | { type: 'relationship'; id: string }
  | undefined

export interface GraphProjection {
  nodes: Node<PersonNodeData>[]
  edges: Edge<RelationshipEdgeData>[]
  fitViewOptions: {
    padding: number
    minZoom: number
    maxZoom: number
  }
}

const defaultFitViewOptions = {
  padding: 0.2,
  minZoom: 0.25,
  maxZoom: 1.4,
}

const NODE_WIDTH = 148
const PARTNER_GAP = 24
const COMPONENT_GAP = 90
const ORIGIN_X = 120
const ORIGIN_Y = 80
const GENERATION_GAP = 180

interface FamilyComponent {
  id: string
  memberIds: string[]
  order: number
  generation: number
}

const componentWidth = (component: FamilyComponent) =>
  component.memberIds.length * NODE_WIDTH +
  Math.max(0, component.memberIds.length - 1) * PARTNER_GAP

const createFamilyComponents = (document: FamilyTreeDocument) => {
  const roots = new Map<string, string>()

  for (const person of document.persons) {
    roots.set(person.id, person.id)
  }

  const findRoot = (personId: string): string => {
    const root = roots.get(personId) ?? personId
    if (root === personId) {
      return root
    }

    const resolvedRoot = findRoot(root)
    roots.set(personId, resolvedRoot)
    return resolvedRoot
  }

  const union = (firstId: string, secondId: string) => {
    const firstRoot = findRoot(firstId)
    const secondRoot = findRoot(secondId)
    if (firstRoot !== secondRoot) {
      roots.set(secondRoot, firstRoot)
    }
  }

  for (const relationship of document.relationships) {
    if (relationship.type === 'marriage') {
      union(relationship.fromId, relationship.toId)
    }
  }

  const parentsByChild = new Map<string, Set<string>>()
  for (const relationship of document.relationships) {
    if (relationship.type !== 'parent-child') continue

    const parents = parentsByChild.get(relationship.toId) ?? new Set<string>()
    parents.add(relationship.fromId)
    parentsByChild.set(relationship.toId, parents)
  }
  for (const parentIds of parentsByChild.values()) {
    const [firstParent, ...otherParents] = [...parentIds]
    if (!firstParent) continue
    otherParents.forEach((parentId) => union(firstParent, parentId))
  }

  const membersByRoot = new Map<string, string[]>()
  document.persons.forEach((person) => {
    const root = findRoot(person.id)
    const members = membersByRoot.get(root) ?? []
    members.push(person.id)
    membersByRoot.set(root, members)
  })

  const components = [...membersByRoot.entries()].map(([id, memberIds], order) => ({
    id,
    memberIds,
    order,
    generation: 0,
  }))
  const componentByPerson = new Map<string, string>()
  components.forEach((component) => {
    component.memberIds.forEach((personId) => componentByPerson.set(personId, component.id))
  })

  return { components, componentByPerson }
}

const createGeneratedPositions = (document: FamilyTreeDocument): Map<string, Position> => {
  const { components, componentByPerson } = createFamilyComponents(document)
  const parentComponents = new Map<string, Set<string>>()

  for (const relationship of document.relationships) {
    if (relationship.type !== 'parent-child') continue

    const parentComponent = componentByPerson.get(relationship.fromId)
    const childComponent = componentByPerson.get(relationship.toId)
    if (!parentComponent || !childComponent || parentComponent === childComponent) continue

    const parents = parentComponents.get(childComponent) ?? new Set<string>()
    parents.add(parentComponent)
    parentComponents.set(childComponent, parents)
  }

  const generationCache = new Map<string, number>()
  const getGeneration = (componentId: string, visiting: Set<string> = new Set()): number => {
    const cached = generationCache.get(componentId)
    if (cached !== undefined) {
      return cached
    }
    if (visiting.has(componentId)) {
      return 0
    }

    const nextVisiting = new Set(visiting)
    nextVisiting.add(componentId)
    const parents = parentComponents.get(componentId) ?? new Set<string>()
    const generation = parents.size === 0
      ? 0
      : Math.max(...[...parents].map((parentId) => getGeneration(parentId, nextVisiting) + 1))
    generationCache.set(componentId, generation)
    return generation
  }

  components.forEach((component) => {
    component.generation = getGeneration(component.id)
  })

  const centers = new Map<string, number>()
  const positions = new Map<string, Position>()
  const generations = new Map<number, FamilyComponent[]>()
  components.forEach((component) => {
    const group = generations.get(component.generation) ?? []
    group.push(component)
    generations.set(component.generation, group)
  })

  const sortedGenerations = [...generations.keys()].sort((first, second) => first - second)
  for (const generation of sortedGenerations) {
    const group = generations.get(generation) ?? []
    const orderedGroup = group.sort((first, second) => {
      const firstParents = [...(parentComponents.get(first.id) ?? [])]
        .map((parentId) => centers.get(parentId))
        .filter((center): center is number => center !== undefined)
      const secondParents = [...(parentComponents.get(second.id) ?? [])]
        .map((parentId) => centers.get(parentId))
        .filter((center): center is number => center !== undefined)
      const firstDesired = firstParents.length > 0
        ? firstParents.reduce((sum, center) => sum + center, 0) / firstParents.length
        : ORIGIN_X + first.order * (NODE_WIDTH + COMPONENT_GAP)
      const secondDesired = secondParents.length > 0
        ? secondParents.reduce((sum, center) => sum + center, 0) / secondParents.length
        : ORIGIN_X + second.order * (NODE_WIDTH + COMPONENT_GAP)
      return firstDesired - secondDesired || first.order - second.order
    })
    let previousRight = ORIGIN_X - COMPONENT_GAP

    for (const component of orderedGroup) {
      const parentCenters = [...(parentComponents.get(component.id) ?? [])]
        .map((parentId) => centers.get(parentId))
        .filter((center): center is number => center !== undefined)
      const desiredCenter = parentCenters.length > 0
        ? parentCenters.reduce((sum, center) => sum + center, 0) / parentCenters.length
        : ORIGIN_X + component.order * (NODE_WIDTH + COMPONENT_GAP)
      const width = componentWidth(component)
      const minimumCenter = previousRight + COMPONENT_GAP + width / 2
      const center = Math.max(desiredCenter, minimumCenter)
      centers.set(component.id, center)
      previousRight = center + width / 2

      const left = center - width / 2
      component.memberIds.forEach((personId, index) => {
        positions.set(personId, {
          x: Math.round(left + index * (NODE_WIDTH + PARTNER_GAP)),
          y: ORIGIN_Y + component.generation * GENERATION_GAP,
        })
      })
    }
  }

  return positions
}

const formatYears = (person: Person) => {
  if (person.birthYear !== null && person.deathYear !== null) {
    return `${person.birthYear} - ${person.deathYear}`
  }
  if (person.birthYear !== null) {
    return `${person.birthYear} -`
  }
  if (person.deathYear !== null) {
    return `- ${person.deathYear}`
  }
  return 'Lebensdaten unbekannt'
}

const projectPerson = (
  person: Person,
  position: Position,
  selection: GraphSelection,
): Node<PersonNodeData> => ({
  id: person.id,
  type: 'person',
  position,
  selected: selection?.type === 'person' && selection.id === person.id,
  data: {
    personId: person.id,
    label: `${person.firstName} ${person.lastName}`,
    years: formatYears(person),
    gender: person.gender,
  },
})

const projectRelationship = (
  relationship: Relationship,
  selection: GraphSelection,
): Edge<RelationshipEdgeData> => {
  const isInferred = relationship.status === 'inferred'
  const isParentChild = relationship.type === 'parent-child'

  return {
    id: relationship.id,
    source: relationship.fromId,
    target: relationship.toId,
    type: isParentChild ? 'smoothstep' : 'straight',
    selected: selection?.type === 'relationship' && selection.id === relationship.id,
    className: isInferred
      ? 'relationship-edge relationship-edge--inferred'
      : 'relationship-edge relationship-edge--explicit',
    style: isInferred ? { strokeDasharray: '7 5' } : {},
    data: {
      relationshipId: relationship.id,
      relationshipType: relationship.type,
      status: relationship.status,
      sourceUrl: relationship.sourceUrl,
    },
    ...(isParentChild
      ? {
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#385b59',
          },
        }
      : {}),
  }
}

export const projectFamilyTree = (
  document: FamilyTreeDocument,
  selection?: GraphSelection,
): GraphProjection => {
  const positions = createGeneratedPositions(document)

  return {
    nodes: document.persons.map((person) =>
      projectPerson(person, positions.get(person.id) ?? { x: 120, y: 80 }, selection),
    ),
    edges: document.relationships.map((relationship) =>
      projectRelationship(relationship, selection),
    ),
    fitViewOptions: { ...defaultFitViewOptions },
  }
}