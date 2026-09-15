import { MarkerType, type Edge, type Node } from '@xyflow/react'

import type {
  FamilyTreeDocument,
  Person,
  Position,
  Relationship,
} from '../domain/types'
import { parsePartialDate, type PartialDateParts } from '../domain/life-date'
import {
  getRelationshipOrigin,
  relationshipOriginLabel,
} from '../domain/relationship-origin'
import { filterFamilyTreeDocument, type GraphViewOptions } from './graph-view'
import { relationshipHandleIds } from './relationship-connection'

export type PersonNodeData = Record<string, unknown> & {
  personId: string
  label: string
  years: string
  gender: Person['gender']
  selected: boolean
}

export type RelationshipEdgeData = Record<string, unknown> & {
  relationshipId: string
  relationshipType: Relationship['type']
  status: Relationship['status']
  sourceUrl: Relationship['sourceUrl']
  origin: NonNullable<Relationship['origin']>
  originLabel: string
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
  minZoom: 0.01,
  maxZoom: 1.4,
}

const NODE_WIDTH = 148
const PARTNER_GAP = 24
const COMPONENT_GAP = 24
const ORIGIN_X = 0
const ORIGIN_Y = 80
const GENERATION_GAP = 132

interface FamilyComponent {
  id: string
  memberIds: string[]
  order: number
  layer: number
  hasMarriage: boolean
}

interface FamilyComponentGraph {
  components: FamilyComponent[]
  componentByPerson: Map<string, string>
  parentComponents: Map<string, Set<string>>
  childrenByComponent: Map<string, Set<string>>
}

const componentWidth = (component: FamilyComponent) =>
  component.memberIds.length * NODE_WIDTH +
  Math.max(0, component.memberIds.length - 1) * PARTNER_GAP

const genderOrder = (gender: Person['gender']) =>
  gender === 'man' ? 0 : gender === 'woman' ? 1 : 2

const createFamilyComponents = (document: FamilyTreeDocument) => {
  const roots = new Map<string, string>()
  const marriedPersonIds = new Set<string>()

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
      marriedPersonIds.add(relationship.fromId)
      marriedPersonIds.add(relationship.toId)
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

  const personById = new Map(document.persons.map((person) => [person.id, person]))
  const personOrder = new Map(document.persons.map((person, index) => [person.id, index]))
  const components = [...membersByRoot.entries()].map(([id, memberIds], order) => {
    const hasMarriage = memberIds.some((personId) => marriedPersonIds.has(personId))
    if (hasMarriage) {
      memberIds.sort((firstId, secondId) => {
        const firstGender = genderOrder(personById.get(firstId)?.gender ?? null)
        const secondGender = genderOrder(personById.get(secondId)?.gender ?? null)
        return firstGender - secondGender ||
          (personOrder.get(firstId) ?? 0) - (personOrder.get(secondId) ?? 0)
      })
    }

    return {
      id,
      memberIds,
      order,
      layer: 0,
      hasMarriage,
    }
  })
  const componentByPerson = new Map<string, string>()
  components.forEach((component) => {
    component.memberIds.forEach((personId) => componentByPerson.set(personId, component.id))
  })

  return { components, componentByPerson }
}

const createFamilyComponentGraph = (document: FamilyTreeDocument): FamilyComponentGraph => {
  const { components, componentByPerson } = createFamilyComponents(document)
  const parentComponents = new Map<string, Set<string>>()
  const childrenByComponent = new Map<string, Set<string>>()

  for (const relationship of document.relationships) {
    if (relationship.type !== 'parent-child') continue

    const parentComponent = componentByPerson.get(relationship.fromId)
    const childComponent = componentByPerson.get(relationship.toId)
    if (!parentComponent || !childComponent || parentComponent === childComponent) continue

    const parents = parentComponents.get(childComponent) ?? new Set<string>()
    parents.add(parentComponent)
    parentComponents.set(childComponent, parents)

    const children = childrenByComponent.get(parentComponent) ?? new Set<string>()
    children.add(childComponent)
    childrenByComponent.set(parentComponent, children)
  }

  return { components, componentByPerson, parentComponents, childrenByComponent }
}

const compareKnownBirthDates = (first: PartialDateParts, second: PartialDateParts): -1 | 0 | 1 => {
  if (first.year < second.year) return -1
  if (first.year > second.year) return 1

  for (const component of ['month', 'day'] as const) {
    const firstValue = first[component]
    const secondValue = second[component]
    if (firstValue === null || secondValue === null) {
      return 0
    }
    if (firstValue < secondValue) return -1
    if (firstValue > secondValue) return 1
  }

  return 0
}

const selectEarliestKnownBirthDate = (
  persons: readonly Person[],
): PartialDateParts | undefined => {
  let earliestDate: PartialDateParts | undefined

  for (const person of persons) {
    const birthDate = parsePartialDate(person.birthYear)
    if (!birthDate) continue

    if (!earliestDate || compareKnownBirthDates(birthDate, earliestDate) === -1) {
      earliestDate = birthDate
    }
  }

  return earliestDate
}

const createWeakComponentGroups = (
  components: readonly FamilyComponent[],
  parentComponents: ReadonlyMap<string, ReadonlySet<string>>,
) => {
  const neighbours = new Map<string, Set<string>>()
  components.forEach((component) => neighbours.set(component.id, new Set()))

  for (const [childId, parentIds] of parentComponents) {
    for (const parentId of parentIds) {
      neighbours.get(childId)?.add(parentId)
      neighbours.get(parentId)?.add(childId)
    }
  }

  const groups: string[][] = []
  const visited = new Set<string>()
  for (const component of components) {
    if (visited.has(component.id)) continue

    const group: string[] = []
    const pending = [component.id]
    visited.add(component.id)
    while (pending.length > 0) {
      const currentId = pending.pop()
      if (!currentId) continue
      group.push(currentId)

      for (const neighbourId of neighbours.get(currentId) ?? []) {
        if (visited.has(neighbourId)) continue
        visited.add(neighbourId)
        pending.push(neighbourId)
      }
    }

    groups.push(group)
  }

  return groups
}

const assignComponentLayers = (
  document: FamilyTreeDocument,
  graph: FamilyComponentGraph,
) => {
  const componentById = new Map(graph.components.map((component) => [component.id, component]))
  const weakGroups = createWeakComponentGroups(graph.components, graph.parentComponents)
  const rootComponentId = document.persons[0]
    ? graph.componentByPerson.get(document.persons[0].id)
    : undefined
  const componentOrder = new Map(graph.components.map((component) => [component.id, component.order]))

  const sortedComponents = (componentIds: Iterable<string>) =>
    [...componentIds].sort(
      (firstId, secondId) =>
        (componentOrder.get(firstId) ?? 0) - (componentOrder.get(secondId) ?? 0),
    )

  const topologicalOrder = (group: readonly string[]) => {
    const groupSet = new Set(group)
    const indegree = new Map(group.map((componentId) => [componentId, 0]))
    for (const componentId of group) {
      const parentIds = graph.parentComponents.get(componentId) ?? new Set<string>()
      indegree.set(
        componentId,
        [...parentIds].filter((parentId) => groupSet.has(parentId)).length,
      )
    }

    const pending = sortedComponents(group.filter((componentId) => indegree.get(componentId) === 0))
    const result: string[] = []
    while (pending.length > 0) {
      const currentId = pending.shift()
      if (!currentId) continue
      result.push(currentId)

      for (const childId of sortedComponents(graph.childrenByComponent.get(currentId) ?? [])) {
        if (!groupSet.has(childId)) continue
        const nextIndegree = (indegree.get(childId) ?? 0) - 1
        indegree.set(childId, nextIndegree)
        if (nextIndegree === 0) {
          pending.push(childId)
          pending.sort((firstId, secondId) =>
            (componentOrder.get(firstId) ?? 0) - (componentOrder.get(secondId) ?? 0),
          )
        }
      }
    }

    if (result.length < group.length) {
      const resultSet = new Set(result)
      result.push(...sortedComponents(group.filter((componentId) => !resultSet.has(componentId))))
    }
    return result
  }

  const neighbours = (componentId: string) => {
    const parentNeighbours = [...(graph.parentComponents.get(componentId) ?? [])].map((id) => ({
      id,
      offset: -1,
    }))
    const childNeighbours = [...(graph.childrenByComponent.get(componentId) ?? [])].map((id) => ({
      id,
      offset: 1,
    }))
    return [...parentNeighbours, ...childNeighbours].sort(
      (first, second) =>
        (componentOrder.get(first.id) ?? 0) - (componentOrder.get(second.id) ?? 0),
    )
  }

  for (const group of weakGroups) {
    const anchorId = group.includes(rootComponentId ?? '') ? rootComponentId : group[0]
    if (!anchorId) continue

    const layers = new Map<string, number>([[anchorId, 0]])
    const pending = [anchorId]
    for (let index = 0; index < pending.length; index += 1) {
      const currentId = pending[index]
      const currentLayer = layers.get(currentId) ?? 0
      for (const neighbour of neighbours(currentId)) {
        if (layers.has(neighbour.id)) continue
        layers.set(neighbour.id, currentLayer + neighbour.offset)
        pending.push(neighbour.id)
      }
    }

    const order = topologicalOrder(group)
    const ancestors = new Set<string>([anchorId])
    const ancestorPending = [anchorId]
    for (let index = 0; index < ancestorPending.length; index += 1) {
      const currentId = ancestorPending[index]
      for (const parentId of graph.parentComponents.get(currentId) ?? []) {
        if (ancestors.has(parentId)) continue
        ancestors.add(parentId)
        ancestorPending.push(parentId)
      }
    }

    // On the ancestor side, work backwards from the anchor so a longer path
    // gets compressed into a two-generation gap at the shorter branch.
    for (const childId of [...order].reverse()) {
      const childLayer = layers.get(childId)
      if (childLayer === undefined || !ancestors.has(childId)) continue

      for (const parentId of graph.parentComponents.get(childId) ?? []) {
        if (parentId === anchorId) continue
        const currentLayer = layers.get(parentId) ?? childLayer - 1
        layers.set(parentId, Math.min(currentLayer, childLayer - 1))
      }
    }

    // On the descendant and side-branch side, prefer the deepest parent path.
    // This makes the only unavoidable mismatch at a merge a gap of two.
    for (const childId of order) {
      if (childId === anchorId) continue
      const parentLayers = [...(graph.parentComponents.get(childId) ?? [])]
        .map((parentId) => layers.get(parentId))
        .filter((layer): layer is number => layer !== undefined)
      if (parentLayers.length === 0) continue

      const currentLayer = layers.get(childId) ?? 0
      layers.set(childId, Math.max(currentLayer, Math.max(...parentLayers) + 1))
    }

    group.forEach((componentId) => {
      const component = componentById.get(componentId)
      if (!component) return
      component.layer = layers.get(componentId) ?? 0
    })
  }
}

interface ComponentInterval {
  left: number
  right: number
}

interface ComponentLayout {
  rootLayer: number
  positions: Map<string, number>
  intervalsByLayer: Map<number, ComponentInterval[]>
}

const createGeneratedPositions = (document: FamilyTreeDocument): Map<string, Position> => {
  const graph = createFamilyComponentGraph(document)
  const { components, parentComponents, childrenByComponent } = graph
  if (components.length === 0) return new Map()

  assignComponentLayers(document, graph)

  const componentById = new Map(components.map((component) => [component.id, component]))
  const personById = new Map(document.persons.map((person) => [person.id, person]))
  const childPersonsByParentComponent = new Map<string, Map<string, Person[]>>()
  document.relationships.forEach((relationship) => {
    if (relationship.type !== 'parent-child') return

    const parentComponentId = graph.componentByPerson.get(relationship.fromId)
    const childComponentId = graph.componentByPerson.get(relationship.toId)
    const childPerson = personById.get(relationship.toId)
    if (!parentComponentId || !childComponentId || !childPerson) return

    const childrenByComponent =
      childPersonsByParentComponent.get(parentComponentId) ?? new Map<string, Person[]>()
    const childPersons: Person[] = childrenByComponent.get(childComponentId) ?? []
    if (!childPersons.some((person) => person.id === childPerson.id)) {
      childPersons.push(childPerson)
    }
    childrenByComponent.set(childComponentId, childPersons)
    childPersonsByParentComponent.set(parentComponentId, childrenByComponent)
  })
  const layoutParentByChild = new Map<string, string>()
  const layoutChildren = new Map<string, string[]>()
  components.forEach((component) => {
    const parentId = [...(parentComponents.get(component.id) ?? [])].sort(
      (firstId, secondId) =>
        (componentById.get(firstId)?.order ?? 0) - (componentById.get(secondId)?.order ?? 0),
    )[0]
    if (!parentId) return

    layoutParentByChild.set(component.id, parentId)
    const children = layoutChildren.get(parentId) ?? []
    children.push(component.id)
    layoutChildren.set(parentId, children)
  })
  layoutChildren.forEach((childIds, parentId) => {
    childIds.sort(
      (firstId, secondId) => {
        const firstBirthDate = selectEarliestKnownBirthDate(
          childPersonsByParentComponent.get(parentId)?.get(firstId) ?? [],
        )
        const secondBirthDate = selectEarliestKnownBirthDate(
          childPersonsByParentComponent.get(parentId)?.get(secondId) ?? [],
        )

        if (firstBirthDate && !secondBirthDate) return -1
        if (!firstBirthDate && secondBirthDate) return 1

        return (firstBirthDate && secondBirthDate
          ? compareKnownBirthDates(firstBirthDate, secondBirthDate)
          : 0) ||
          (componentById.get(firstId)?.order ?? 0) - (componentById.get(secondId)?.order ?? 0)
      },
    )
  })

  const requiredShift = (
    occupied: ReadonlyMap<number, readonly ComponentInterval[]>,
    layout: ComponentLayout,
    layerOffset: number,
  ) => {
    let shift = 0
    layout.intervalsByLayer.forEach((intervals, relativeLayer) => {
      const occupiedIntervals = occupied.get(layerOffset + relativeLayer) ?? []
      intervals.forEach((interval) => {
        occupiedIntervals.forEach((occupiedInterval) => {
          shift = Math.max(shift, occupiedInterval.right + COMPONENT_GAP - interval.left)
        })
      })
    })
    return shift
  }

  const addIntervals = (
    occupied: Map<number, ComponentInterval[]>,
    layout: ComponentLayout,
    layerOffset: number,
    shift: number,
  ) => {
    layout.intervalsByLayer.forEach((intervals, relativeLayer) => {
      const layer = layerOffset + relativeLayer
      const targetIntervals = occupied.get(layer) ?? []
      intervals.forEach((interval) => {
        targetIntervals.push({
          left: interval.left + shift,
          right: interval.right + shift,
        })
      })
      occupied.set(layer, targetIntervals)
    })
  }

  const layoutCache = new Map<string, ComponentLayout>()
  const createComponentLayout = (
    componentId: string,
    visiting: Set<string> = new Set(),
  ): ComponentLayout => {
    const cached = layoutCache.get(componentId)
    if (cached) return cached

    const component = componentById.get(componentId)
    if (!component) {
      return { rootLayer: 0, positions: new Map(), intervalsByLayer: new Map() }
    }
    if (visiting.has(componentId)) {
      return {
        rootLayer: component.layer,
        positions: new Map([[componentId, 0]]),
        intervalsByLayer: new Map([[0, [{ left: -componentWidth(component) / 2, right: componentWidth(component) / 2 }]]]),
      }
    }

    const nextVisiting = new Set(visiting)
    nextVisiting.add(componentId)
    const occupied = new Map<number, ComponentInterval[]>()
    const childPlacements: Array<{
      layout: ComponentLayout
      layerOffset: number
      shift: number
    }> = []
    const childRootCenters: number[] = []

    for (const childId of layoutChildren.get(componentId) ?? []) {
      const child = componentById.get(childId)
      if (!child) continue

      const childLayout = createComponentLayout(childId, nextVisiting)
      const layerOffset = child.layer - component.layer
      const shift = requiredShift(occupied, childLayout, layerOffset)
      childPlacements.push({ layout: childLayout, layerOffset, shift })
      childRootCenters.push(shift)
      addIntervals(occupied, childLayout, layerOffset, shift)
    }

    const parentCenter = childRootCenters.length > 0
      ? childRootCenters.reduce((sum, center) => sum + center, 0) / childRootCenters.length
      : ORIGIN_X
    const positions = new Map<string, number>([[componentId, ORIGIN_X]])
    const intervalsByLayer = new Map<number, ComponentInterval[]>()
    childPlacements.forEach(({ layout, layerOffset, shift }) => {
      layout.positions.forEach((center, descendantId) => {
        positions.set(descendantId, center + shift - parentCenter)
      })
      layout.intervalsByLayer.forEach((intervals, relativeLayer) => {
        const targetIntervals = intervalsByLayer.get(layerOffset + relativeLayer) ?? []
        intervals.forEach((interval) => {
          targetIntervals.push({
            left: interval.left + shift - parentCenter,
            right: interval.right + shift - parentCenter,
          })
        })
        intervalsByLayer.set(layerOffset + relativeLayer, targetIntervals)
      })
    })

    const width = componentWidth(component)
    const ownIntervals = intervalsByLayer.get(0) ?? []
    ownIntervals.push({ left: -width / 2, right: width / 2 })
    intervalsByLayer.set(0, ownIntervals)

    const layout = { rootLayer: component.layer, positions, intervalsByLayer }
    layoutCache.set(componentId, layout)
    return layout
  }

  const rootIds = components
    .filter((component) => !layoutParentByChild.has(component.id))
    .sort((first, second) => first.order - second.order)
  const componentCenters = new Map<string, number>()
  const occupied = new Map<number, ComponentInterval[]>()
  const placedComponents = new Set<string>()
  const placeRoot = (rootId: string) => {
    if (placedComponents.has(rootId)) return
    const root = componentById.get(rootId)
    if (!root) return

    const layout = createComponentLayout(rootId)
    const shift = requiredShift(occupied, layout, root.layer)
    layout.positions.forEach((center, componentId) => {
      componentCenters.set(componentId, center + shift)
      placedComponents.add(componentId)
    })
    addIntervals(occupied, layout, root.layer, shift)
  }
  rootIds.forEach((root) => placeRoot(root.id))
  components.forEach((component) => placeRoot(component.id))

  const positions = new Map<string, Position>()
  components.forEach((component) => {
    const center = componentCenters.get(component.id) ?? ORIGIN_X
    const width = componentWidth(component)
    const left = center - width / 2
    component.memberIds.forEach((personId, index) => {
      positions.set(personId, {
        x: Math.round(left + index * (NODE_WIDTH + PARTNER_GAP)),
        y: ORIGIN_Y + component.layer * GENERATION_GAP,
      })
    })
  })

  const positionValues = [...positions.values()]
  if (positionValues.length > 0) {
    const leftEdge = Math.min(...positionValues.map((position) => position.x))
    const rightEdge = Math.max(...positionValues.map((position) => position.x + NODE_WIDTH))
    const layoutCenter = (leftEdge + rightEdge) / 2
    positions.forEach((position, personId) => {
      positions.set(personId, {
        ...position,
        x: Math.round(position.x - layoutCenter),
      })
    })
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
  return ''
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
    selected: selection?.type === 'person' && selection.id === person.id,
  },
})

const projectRelationship = (
  relationship: Relationship,
  selection: GraphSelection,
): Edge<RelationshipEdgeData> => {
  const origin = getRelationshipOrigin(relationship)
  const isInferred = relationship.status === 'inferred'
  const isParentChild = relationship.type === 'parent-child'
  const edgeColor = origin === 'ocr-suggestion'
    ? '#a77b28'
    : isParentChild ? '#385b59' : '#c6654c'

  return {
    id: relationship.id,
    source: relationship.fromId,
    target: relationship.toId,
    sourceHandle: isParentChild
      ? relationshipHandleIds.parentSource
      : relationshipHandleIds.marriageSide,
    targetHandle: isParentChild
      ? relationshipHandleIds.childTarget
      : relationshipHandleIds.marriageSide,
    type: 'simplebezier',
    selected: selection?.type === 'relationship' && selection.id === relationship.id,
    className: [
      'relationship-edge',
      isInferred ? 'relationship-edge--inferred' : 'relationship-edge--explicit',
      `relationship-edge--${origin}`,
      isParentChild ? 'relationship-edge--parent-child' : 'relationship-edge--marriage',
    ].join(' '),
    label: isParentChild ? '' : '⚭',
    labelStyle: { fill: edgeColor, fontSize: 10, fontWeight: 700 },
    labelBgStyle: { fill: '#fffdf8', fillOpacity: 0.94, stroke: edgeColor },
    labelBgPadding: [4, 2],
    labelBgBorderRadius: 2,
    style: {
      stroke: edgeColor,
      strokeWidth: 2.2,
      ...(isInferred ? { strokeDasharray: '7 5' } : {}),
    },
    data: {
      relationshipId: relationship.id,
      relationshipType: relationship.type,
      status: relationship.status,
      sourceUrl: relationship.sourceUrl,
      origin,
      originLabel: relationshipOriginLabel(origin),
    },
    ...(isParentChild
      ? {
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
        }
      : {}),
  }
}

export const projectFamilyTree = (
  document: FamilyTreeDocument,
  selection?: GraphSelection,
  positionOverrides: ReadonlyMap<string, Position> = new Map(),
  viewOptions: GraphViewOptions = {},
): GraphProjection => {
  const visibleDocument = filterFamilyTreeDocument(document, viewOptions)
  const positions = createGeneratedPositions(visibleDocument)

  return {
    nodes: visibleDocument.persons.map((person) =>
      projectPerson(
        person,
        positionOverrides.get(person.id) ?? positions.get(person.id) ?? { x: 120, y: 80 },
        selection,
      ),
    ),
    edges: visibleDocument.relationships.map((relationship) =>
      projectRelationship(relationship, selection),
    ),
    fitViewOptions: { ...defaultFitViewOptions },
  }
}
