import type { DateValue, FamilyTreeDocument, Person, Relationship } from '../domain/types'
import { comparePartialDates, parsePartialDate, type PartialDateParts } from '../domain/life-date'
import { duplicateNameMatcher, type DuplicateNameMatcher } from './duplicate-name-variants'

export type DuplicatePriority = 1 | 2 | 3 | 4

export interface DuplicatePersonPair {
  firstPersonId: string
  secondPersonId: string
  priority: DuplicatePriority
}

export type BloodlineMode =
  | 'blood'
  | 'direct-ancestors'
  | 'extended-direct-ancestors'
  | 'descendants'
  | 'extended-descendants'
  | 'direct-ancestors-and-descendants'
  | 'extended-direct-ancestors-and-descendants'

export interface GraphViewOptions {
  anchorPersonId?: string | null
  bloodlineAnchorPersonId?: string | null
  distance?: number | null
  bloodlineMode?: BloodlineMode | null
  hideLeaves?: boolean
  unfilteredPersonIds?: readonly string[]
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

type FamilyIndexes = {
  parentsByChild: Map<string, Set<string>>
  childrenByParent: Map<string, Set<string>>
  partnersByPerson: Map<string, Set<string>>
}

const familyIndexesFor = (document: FamilyTreeDocument): FamilyIndexes => {
  const personIds = personIdsFor(document)
  const parentsByChild = new Map<string, Set<string>>()
  const childrenByParent = new Map<string, Set<string>>()
  const partnersByPerson = new Map<string, Set<string>>()

  document.persons.forEach((person) => {
    parentsByChild.set(person.id, new Set())
    childrenByParent.set(person.id, new Set())
    partnersByPerson.set(person.id, new Set())
  })

  document.relationships.forEach((relationship) => {
    if (!personIds.has(relationship.fromId) || !personIds.has(relationship.toId)) return

    if (relationship.type === 'parent-child') {
      parentsByChild.get(relationship.toId)?.add(relationship.fromId)
      childrenByParent.get(relationship.fromId)?.add(relationship.toId)
      return
    }

    partnersByPerson.get(relationship.fromId)?.add(relationship.toId)
    partnersByPerson.get(relationship.toId)?.add(relationship.fromId)
  })

  return { parentsByChild, childrenByParent, partnersByPerson }
}

const ancestorIdsFor = (
  anchorPersonId: string,
  parentsByChild: ReadonlyMap<string, ReadonlySet<string>>,
) => {
  const ancestors = new Set<string>([anchorPersonId])
  const pending = [anchorPersonId]

  while (pending.length > 0) {
    const currentId = pending.shift()
    if (!currentId) continue

    for (const parentId of parentsByChild.get(currentId) ?? []) {
      if (ancestors.has(parentId)) continue
      ancestors.add(parentId)
      pending.push(parentId)
    }
  }

  return ancestors
}

const bloodRelativeIds = (
  indexes: FamilyIndexes,
  anchorPersonId: string,
) => {
  const ancestors = ancestorIdsFor(anchorPersonId, indexes.parentsByChild)
  const relatives = new Set(ancestors)
  const pendingDescendants = [...ancestors]

  while (pendingDescendants.length > 0) {
    const currentId = pendingDescendants.shift()
    if (!currentId) continue

    for (const childId of indexes.childrenByParent.get(currentId) ?? []) {
      if (relatives.has(childId)) continue
      relatives.add(childId)
      pendingDescendants.push(childId)
    }
  }

  return relatives
}

const descendantIds = (
  indexes: FamilyIndexes,
  anchorPersonId: string,
) => {
  const descendants = new Set<string>([anchorPersonId])
  const pending = [anchorPersonId]

  while (pending.length > 0) {
    const currentId = pending.shift()
    if (!currentId) continue

    for (const childId of indexes.childrenByParent.get(currentId) ?? []) {
      if (descendants.has(childId)) continue
      descendants.add(childId)
      pending.push(childId)
    }
  }

  return descendants
}

const descendantIdsWithPartners = (
  indexes: FamilyIndexes,
  anchorPersonId: string,
) => {
  const descendants = descendantIds(indexes, anchorPersonId)
  const included = new Set(descendants)

  descendants.forEach((descendantId) => {
    for (const partnerId of indexes.partnersByPerson.get(descendantId) ?? []) {
      included.add(partnerId)
    }
  })

  return included
}

const extendedDescendantIds = (
  indexes: FamilyIndexes,
  anchorPersonId: string,
) => {
  const descendants = descendantIds(indexes, anchorPersonId)
  const included = descendantIdsWithPartners(indexes, anchorPersonId)
  const descendantPartners = new Set<string>()

  descendants.forEach((descendantId) => {
    if (descendantId === anchorPersonId) return

    for (const partnerId of indexes.partnersByPerson.get(descendantId) ?? []) {
      descendantPartners.add(partnerId)
    }
  })

  descendantPartners.forEach((partnerId) => {
    included.add(partnerId)
    for (const childId of indexes.childrenByParent.get(partnerId) ?? []) {
      included.add(childId)
    }
  })

  return included
}

const directAncestorIds = (
  indexes: FamilyIndexes,
  anchorPersonId: string,
  extended: boolean,
) => {
  const ancestors = ancestorIdsFor(anchorPersonId, indexes.parentsByChild)
  const directAncestors = new Set(ancestors)
  directAncestors.delete(anchorPersonId)

  const included = new Set(ancestors)
  const siblings = new Set<string>()

  if (extended) {
    directAncestors.forEach((ancestorId) => {
      for (const parentId of indexes.parentsByChild.get(ancestorId) ?? []) {
        for (const siblingId of indexes.childrenByParent.get(parentId) ?? []) {
          if (siblingId !== ancestorId) siblings.add(siblingId)
        }
      }
    })
    siblings.forEach((siblingId) => included.add(siblingId))
  }

  const partnerSources = new Set(directAncestors)
  if (extended) {
    siblings.forEach((siblingId) => partnerSources.add(siblingId))
  }
  partnerSources.forEach((personId) => {
    for (const partnerId of indexes.partnersByPerson.get(personId) ?? []) {
      included.add(partnerId)
    }
  })

  return included
}

const bloodlineIds = (
  document: FamilyTreeDocument,
  anchorPersonId: string,
  mode: BloodlineMode,
) => {
  const indexes = familyIndexesFor(document)
  if (mode === 'blood') return bloodRelativeIds(indexes, anchorPersonId)
  if (mode === 'descendants') return descendantIdsWithPartners(indexes, anchorPersonId)
  if (mode === 'extended-descendants') {
    return extendedDescendantIds(indexes, anchorPersonId)
  }
  if (mode === 'direct-ancestors-and-descendants') {
    return new Set([
      ...directAncestorIds(indexes, anchorPersonId, false),
      ...descendantIdsWithPartners(indexes, anchorPersonId),
    ])
  }
  if (mode === 'extended-direct-ancestors-and-descendants') {
    return new Set([
      ...directAncestorIds(indexes, anchorPersonId, true),
      ...extendedDescendantIds(indexes, anchorPersonId),
    ])
  }

  return directAncestorIds(
    indexes,
    anchorPersonId,
    mode === 'extended-direct-ancestors',
  )
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
  const allPersonIds = personIdsFor(document)
  const visiblePersonIds = new Set(allPersonIds)
  const anchorPersonId = options.anchorPersonId ?? null
  const bloodlineAnchorPersonId = options.bloodlineAnchorPersonId ?? anchorPersonId
  const distance = normalizedDistance(options.distance)

  if (anchorPersonId && distance !== null && visiblePersonIds.has(anchorPersonId)) {
    intersectIds(
      visiblePersonIds,
      idsWithinDistance(document, anchorPersonId, distance),
    )
  }

  if (
    options.bloodlineMode &&
    bloodlineAnchorPersonId &&
    visiblePersonIds.has(bloodlineAnchorPersonId)
  ) {
    intersectIds(
      visiblePersonIds,
      bloodlineIds(document, bloodlineAnchorPersonId, options.bloodlineMode),
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

  for (const personId of options.unfilteredPersonIds ?? []) {
    if (allPersonIds.has(personId)) {
      visiblePersonIds.add(personId)
    }
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
  nameMatcher: DuplicateNameMatcher = duplicateNameMatcher,
): DuplicatePersonPair[] => {
  const directParentChildPairs = new Set(
    document.relationships
      .filter(({ type }) => type === 'parent-child')
      .map(({ fromId, toId }) => unorderedPersonPairKey(fromId, toId)),
  )
  const personIndexes = new Map(document.persons.map((person, index) => [person.id, index]))
  const pairs: DuplicatePersonPair[] = []
  for (let firstIndex = 0; firstIndex < document.persons.length - 1; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < document.persons.length; secondIndex += 1) {
      const first = document.persons[firstIndex]
      const second = document.persons[secondIndex]
      if (
        !nameMatcher.firstNamesMatch(first.firstName, second.firstName) ||
        !nameMatcher.lastNamesMatch(first.lastName, second.lastName) ||
        directParentChildPairs.has(unorderedPersonPairKey(first.id, second.id))
      ) {
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
