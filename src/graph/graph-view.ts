import type { DateValue, FamilyTreeDocument, Person, Relationship } from '../domain/types'
import { comparePartialDates, parsePartialDate, type PartialDateParts } from '../domain/life-date'

export type DuplicatePriority = 1 | 2 | 3 | 4

export interface DuplicatePersonPair {
  firstPersonId: string
  secondPersonId: string
  priority: DuplicatePriority
}

export interface GraphViewOptions {
  anchorPersonId?: string | null
  distance?: number | null
  bloodOnly?: boolean
  hideLeaves?: boolean
}

const personIdsFor = (document: FamilyTreeDocument) =>
  new Set(document.persons.map((person) => person.id))

const adjacencyFor = (
  document: FamilyTreeDocument,
  relationshipType?: Relationship['type'],
) => {
  const adjacency = new Map<string, Set<string>>()
  const personIds = personIdsFor(document)
  document.persons.forEach((person) => adjacency.set(person.id, new Set()))

  document.relationships.forEach((relationship) => {
    if (relationshipType && relationship.type !== relationshipType) return
    if (!personIds.has(relationship.fromId) || !personIds.has(relationship.toId)) return

    adjacency.get(relationship.fromId)?.add(relationship.toId)
    adjacency.get(relationship.toId)?.add(relationship.fromId)
  })

  return adjacency
}

const idsWithinDistance = (
  document: FamilyTreeDocument,
  anchorPersonId: string,
  maxDistance: number,
  relationshipType?: Relationship['type'],
) => {
  const adjacency = adjacencyFor(document, relationshipType)
  if (!adjacency.has(anchorPersonId)) {
    return new Set<string>()
  }

  const distances = new Map<string, number>([[anchorPersonId, 0]])
  const pending = [anchorPersonId]

  while (pending.length > 0) {
    const currentId = pending.shift()
    if (!currentId) continue

    const currentDistance = distances.get(currentId) ?? 0
    if (currentDistance >= maxDistance) continue

    for (const neighbourId of adjacency.get(currentId) ?? []) {
      if (distances.has(neighbourId)) continue
      distances.set(neighbourId, currentDistance + 1)
      pending.push(neighbourId)
    }
  }

  return new Set(distances.keys())
}

const bloodRelativeIds = (
  document: FamilyTreeDocument,
  anchorPersonId: string,
) => {
  const personIds = personIdsFor(document)
  if (!personIds.has(anchorPersonId)) {
    return new Set<string>()
  }

  const parentsByChild = new Map<string, Set<string>>()
  const childrenByParent = new Map<string, Set<string>>()
  document.relationships.forEach((relationship) => {
    if (relationship.type !== 'parent-child') return
    if (!personIds.has(relationship.fromId) || !personIds.has(relationship.toId)) return

    const parents = parentsByChild.get(relationship.toId) ?? new Set<string>()
    parents.add(relationship.fromId)
    parentsByChild.set(relationship.toId, parents)

    const children = childrenByParent.get(relationship.fromId) ?? new Set<string>()
    children.add(relationship.toId)
    childrenByParent.set(relationship.fromId, children)
  })

  const ancestors = new Set<string>([anchorPersonId])
  const pendingAncestors = [anchorPersonId]
  while (pendingAncestors.length > 0) {
    const currentId = pendingAncestors.shift()
    if (!currentId) continue

    for (const parentId of parentsByChild.get(currentId) ?? []) {
      if (ancestors.has(parentId)) continue
      ancestors.add(parentId)
      pendingAncestors.push(parentId)
    }
  }

  const relatives = new Set(ancestors)
  const pendingDescendants = [...ancestors]
  while (pendingDescendants.length > 0) {
    const currentId = pendingDescendants.shift()
    if (!currentId) continue

    for (const childId of childrenByParent.get(currentId) ?? []) {
      if (relatives.has(childId)) continue
      relatives.add(childId)
      pendingDescendants.push(childId)
    }
  }

  return relatives
}

const intersectIds = (currentIds: Set<string>, allowedIds: ReadonlySet<string>) => {
  currentIds.forEach((personId) => {
    if (!allowedIds.has(personId)) {
      currentIds.delete(personId)
    }
  })
}

const normalizedDistance = (distance: number | null | undefined) => {
  if (distance === null || distance === undefined || !Number.isFinite(distance)) {
    return null
  }

  return Math.max(0, Math.floor(distance))
}

export const filterFamilyTreeDocument = (
  document: FamilyTreeDocument,
  options: GraphViewOptions = {},
): FamilyTreeDocument => {
  const visiblePersonIds = personIdsFor(document)
  const anchorPersonId = options.anchorPersonId ?? null
  const distance = normalizedDistance(options.distance)

  if (anchorPersonId && distance !== null && visiblePersonIds.has(anchorPersonId)) {
    intersectIds(
      visiblePersonIds,
      idsWithinDistance(document, anchorPersonId, distance),
    )
  }

  if (options.bloodOnly && anchorPersonId && visiblePersonIds.has(anchorPersonId)) {
    intersectIds(
      visiblePersonIds,
      bloodRelativeIds(document, anchorPersonId),
    )
  }

  if (options.hideLeaves) {
    const parentIds = new Set(
      document.relationships
        .filter((relationship) => relationship.type === 'parent-child')
        .map((relationship) => relationship.fromId),
    )
    intersectIds(visiblePersonIds, parentIds)
  }

  return {
    ...document,
    persons: document.persons.filter((person) => visiblePersonIds.has(person.id)),
    relationships: document.relationships.filter(
      (relationship) =>
        visiblePersonIds.has(relationship.fromId) && visiblePersonIds.has(relationship.toId),
    ),
  }
}

const personName = (person: Person) => `${person.firstName} ${person.lastName}`

const duplicateNameKey = (person: Person) => [person.firstName, person.lastName]
  .map((value) => value.trim().toLocaleLowerCase('de-DE'))
  .join('\u0000')

const unorderedPersonPairKey = (firstPersonId: string, secondPersonId: string) =>
  [firstPersonId, secondPersonId].sort().join('\u0000')

type BirthDateState =
  | { kind: 'missing' }
  | { kind: 'invalid' }
  | { kind: 'present'; parts: PartialDateParts }

const birthDateState = (value: DateValue | null): BirthDateState => {
  if (value === null || (typeof value === 'string' && value.trim() === '')) {
    return { kind: 'missing' }
  }

  const parts = parsePartialDate(value)
  return parts ? { kind: 'present', parts } : { kind: 'invalid' }
}

const compatibleKnownBirthDates = (
  first: PartialDateParts,
  second: PartialDateParts,
) => {
  for (const component of ['year', 'month', 'day'] as const) {
    const firstValue = first[component]
    const secondValue = second[component]
    if (firstValue !== null && secondValue !== null && firstValue !== secondValue) {
      return false
    }
  }

  return true
}

const isCompleteBirthDate = (
  date: PartialDateParts,
) => date.month !== null && date.day !== null

const duplicatePriority = (
  first: Person,
  second: Person,
  generations: ReadonlyMap<string, number>,
): DuplicatePriority | null => {
  const firstBirthDate = birthDateState(first.birthYear)
  const secondBirthDate = birthDateState(second.birthYear)

  if (firstBirthDate.kind === 'invalid' || secondBirthDate.kind === 'invalid') {
    return null
  }

  if (firstBirthDate.kind === 'present' && secondBirthDate.kind === 'present') {
    if (!compatibleKnownBirthDates(firstBirthDate.parts, secondBirthDate.parts)) {
      return null
    }

    return isCompleteBirthDate(firstBirthDate.parts) && isCompleteBirthDate(secondBirthDate.parts)
      ? 1
      : 2
  }

  const firstGeneration = generations.get(first.id)
  const secondGeneration = generations.get(second.id)
  if (
    firstGeneration === undefined ||
    secondGeneration === undefined ||
    Math.abs(firstGeneration - secondGeneration) > 1
  ) {
    return null
  }

  return firstBirthDate.kind === 'missing' && secondBirthDate.kind === 'missing' ? 4 : 3
}

export const findDuplicatePersonPairs = (
  document: FamilyTreeDocument,
  generations: ReadonlyMap<string, number>,
): DuplicatePersonPair[] => {
  const personsByName = new Map<string, Person[]>()
  const directParentChildPairs = new Set(
    document.relationships
      .filter(({ type }) => type === 'parent-child')
      .map(({ fromId, toId }) => unorderedPersonPairKey(fromId, toId)),
  )
  document.persons.forEach((person) => {
    const nameKey = duplicateNameKey(person)
    const persons = personsByName.get(nameKey) ?? []
    persons.push(person)
    personsByName.set(nameKey, persons)
  })

  const personIndexes = new Map(document.persons.map((person, index) => [person.id, index]))
  const pairs: DuplicatePersonPair[] = []
  personsByName.forEach((persons) => {
    for (let firstIndex = 0; firstIndex < persons.length - 1; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < persons.length; secondIndex += 1) {
        const first = persons[firstIndex]
        const second = persons[secondIndex]
        if (directParentChildPairs.has(unorderedPersonPairKey(first.id, second.id))) {
          continue
        }
        const priority = duplicatePriority(first, second, generations)
        if (priority === null) continue

        pairs.push({
          firstPersonId: first.id,
          secondPersonId: second.id,
          priority,
        })
      }
    }
  })

  return pairs.sort((first, second) =>
    first.priority - second.priority ||
    (personIndexes.get(first.firstPersonId) ?? 0) - (personIndexes.get(second.firstPersonId) ?? 0) ||
    (personIndexes.get(first.secondPersonId) ?? 0) - (personIndexes.get(second.secondPersonId) ?? 0),
  )
}

export const findPersonSearchMatches = (
  document: FamilyTreeDocument,
  query: string,
): Person[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase('de-DE')
  if (!normalizedQuery) {
    return []
  }

  return document.persons
    .map((person, index) => ({ person, index }))
    .filter(({ person }) => personName(person).toLocaleLowerCase('de-DE').includes(normalizedQuery))
    .sort(({ person: firstPerson, index: firstIndex }, { person: secondPerson, index: secondIndex }) => {
      const firstDate = parsePartialDate(firstPerson.birthYear)
      const secondDate = parsePartialDate(secondPerson.birthYear)

      if (firstDate && !secondDate) return -1
      if (!firstDate && secondDate) return 1
      if (firstDate && secondDate) {
        const dateComparison = comparePartialDates(firstPerson.birthYear, secondPerson.birthYear)
        if (dateComparison !== null && dateComparison !== 0) {
          return dateComparison
        }
      }

      return firstIndex - secondIndex
    })
    .map(({ person }) => person)
}
