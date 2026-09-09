import type { FamilyTreeDocument, Person, Relationship } from './types'
import { comparePartialDates } from './life-date'

const relationshipKey = (fromId: string, toId: string) => `${fromId}\u0000${toId}`

const isAutomatic = (relationship: Relationship) =>
  relationship.origin === 'automatic-inference' || Boolean(relationship.inferredFrom)

const personLabel = (person: Person | undefined) =>
  person ? `${person.firstName} ${person.lastName}` : 'Unbekannte Person'

const generatedComment = (
  document: FamilyTreeDocument,
  sourceRelationship: Relationship,
  spouseId: string,
) => {
  const parent = document.persons.find((person) => person.id === sourceRelationship.fromId)
  const spouse = document.persons.find((person) => person.id === spouseId)
  const child = document.persons.find((person) => person.id === sourceRelationship.toId)
  return `Automatisch abgeleitet: ${personLabel(spouse)} ist Ehepartner von ${personLabel(parent)} und damit möglicher Elternteil von ${personLabel(child)}.`
}

const spouseIdsFor = (
  personId: string,
  marriages: Relationship[],
) =>
  [...new Set(
    marriages
      .filter(
        (relationship) =>
          relationship.fromId === personId || relationship.toId === personId,
      )
      .map((relationship) =>
        relationship.fromId === personId ? relationship.toId : relationship.fromId,
      ),
  )]

const eligibleSpouseIds = (
  document: FamilyTreeDocument,
  parentId: string,
  childId: string,
  marriages: Relationship[],
) => {
  const spouseIds = spouseIdsFor(parentId, marriages)
  if (spouseIds.length === 1) {
    return spouseIds
  }

  const child = document.persons.find((person) => person.id === childId)
  if (!child || child.birthYear === null) {
    return []
  }

  const spouses = spouseIds.map((spouseId) =>
    document.persons.find((person) => person.id === spouseId),
  )

  const candidates = spouses
    .filter((spouse): spouse is Person => Boolean(spouse))
    .filter(
      (spouse) =>
        spouse.deathYear === null ||
        comparePartialDates(spouse.deathYear, child.birthYear) !== -1,
    )
    .map((spouse) => spouse.id)
  return candidates.length === 1 ? candidates : []
}

const createInferredId = (
  spouseId: string,
  childId: string,
  usedIds: Set<string>,
) => {
  const baseId = `inferred-${spouseId}-${childId}`
  let id = baseId
  let suffix = 2
  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`
    suffix += 1
  }
  return id
}

export const synchronizeInferredRelationships = (
  document: FamilyTreeDocument,
): FamilyTreeDocument => {
  const manualRelationships = document.relationships.filter(
    (relationship) => !isAutomatic(relationship),
  )
  const previousAutomatic = new Map(
    document.relationships
      .filter(isAutomatic)
      .map((relationship) => [
        relationshipKey(relationship.fromId, relationship.toId),
        relationship,
      ]),
  )
  const marriages = manualRelationships.filter((relationship) => relationship.type === 'marriage')
  const parentChildRelationships = manualRelationships.filter(
    (relationship) => relationship.type === 'parent-child',
  )
  const usedIds = new Set(manualRelationships.map((relationship) => relationship.id))
  const existingPairs = new Set(
    manualRelationships
      .filter((relationship) => relationship.type === 'parent-child')
      .map((relationship) => relationshipKey(relationship.fromId, relationship.toId)),
  )
  const inferredRelationships: Relationship[] = []

  for (const sourceRelationship of parentChildRelationships) {
    const spouseIds = eligibleSpouseIds(
      document,
      sourceRelationship.fromId,
      sourceRelationship.toId,
      marriages,
    )

    for (const spouseId of spouseIds) {
      const pairKey = relationshipKey(spouseId, sourceRelationship.toId)
      if (existingPairs.has(pairKey)) {
        continue
      }

      const previous = previousAutomatic.get(pairKey)
      const relationship: Relationship = {
        id: previous?.id ?? createInferredId(spouseId, sourceRelationship.toId, usedIds),
        type: 'parent-child',
        fromId: spouseId,
        toId: sourceRelationship.toId,
        status: 'inferred',
        sourceUrl: previous?.sourceUrl ?? null,
        comment:
          previous?.comment?.trim() ||
          generatedComment(document, sourceRelationship, spouseId),
        inferredFrom: {
          rule: 'spouse-parent',
          sourceRelationshipId: sourceRelationship.id,
        },
        origin: 'automatic-inference',
      }
      inferredRelationships.push(relationship)
      existingPairs.add(pairKey)
      usedIds.add(relationship.id)
    }
  }

  return {
    ...document,
    relationships: [...manualRelationships, ...inferredRelationships],
  }
}
