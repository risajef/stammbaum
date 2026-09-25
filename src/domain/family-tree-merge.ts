import { validateFamilyTreeDocument } from './document-validation'
import { normalizePartialDate } from './life-date'
import { getRelationshipOrigin } from './relationship-origin'
import type { DomainError, FamilyTreeDocument, Person, Relationship, Result } from './types'

export interface FamilyTreeMergeSource {
  fileName: string
  document: FamilyTreeDocument
}

const normalizeComment = (value: string | null | undefined) => value?.trim() || null

const normalizePerson = (person: Person): Person => ({
  ...person,
  gender: person.gender ?? null,
  birthYear: normalizePartialDate(person.birthYear),
  deathYear: normalizePartialDate(person.deathYear),
  position: person.position ? { ...person.position } : null,
  comment: normalizeComment(person.comment),
})

const normalizeRelationship = (relationship: Relationship): Relationship => ({
  ...relationship,
  ...(relationship.type === 'marriage'
    ? { startDate: normalizePartialDate(relationship.startDate) }
    : {}),
  sourceUrl: relationship.sourceUrl ?? null,
  comment: normalizeComment(relationship.comment),
  inferredFrom: relationship.inferredFrom ? { ...relationship.inferredFrom } : null,
  origin: getRelationshipOrigin(relationship),
})

const differingFields = <T extends object>(first: T, second: T) =>
  (Object.keys(first) as (keyof T)[]).filter(
    (field) => JSON.stringify(first[field]) !== JSON.stringify(second[field]),
  )

const invalidMergeError = (
  validationError: DomainError,
  document: FamilyTreeDocument,
  sourceByPersonId: Map<string, string>,
  sourceByRelationshipId: Map<string, string>,
  sources: FamilyTreeMergeSource[],
): DomainError => {
  const sourceNames = new Set<string>()
  const relationship = document.relationships.find(
    (candidate) => candidate.id === validationError.entityId,
  )

  if (relationship) {
    const relatedRelationships = validationError.code === 'duplicate-relationship'
      ? document.relationships.filter((candidate) =>
        candidate.type === relationship.type &&
        ((candidate.fromId === relationship.fromId && candidate.toId === relationship.toId) ||
          (relationship.type === 'marriage' &&
            candidate.fromId === relationship.toId && candidate.toId === relationship.fromId)),
      )
      : [relationship]

    for (const candidate of relatedRelationships) {
      const sourceName = sourceByRelationshipId.get(candidate.id)
      if (sourceName) sourceNames.add(sourceName)
    }
  } else if (validationError.entityId) {
    const sourceName = sourceByPersonId.get(validationError.entityId)
    if (sourceName) sourceNames.add(sourceName)
  }

  if (sourceNames.size === 0) {
    sources.forEach((source) => sourceNames.add(source.fileName))
  }

  return {
    ...validationError,
    code: 'merge-invalid-document',
    message: `${validationError.message} Betroffene Quelldatei(en): ${[...sourceNames].join(', ')}.`,
  }
}

export const mergeFamilyTrees = (
  sources: FamilyTreeMergeSource[],
): Result<FamilyTreeDocument> => {
  if (sources.length === 0) {
    return {
      ok: false,
      error: {
        code: 'merge-no-sources',
        message: 'Für die Fusion muss mindestens eine YAML-Datei ausgewählt werden.',
      },
    }
  }

  const personsById = new Map<string, { person: Person; fileName: string }>()
  const relationshipsById = new Map<string, { relationship: Relationship; fileName: string }>()

  for (const source of sources) {
    for (const person of source.document.persons) {
      const normalizedPerson = normalizePerson(person)
      const previous = personsById.get(person.id)

      if (!previous) {
        personsById.set(person.id, { person: normalizedPerson, fileName: source.fileName })
        continue
      }

      const fields = differingFields(previous.person, normalizedPerson)
      if (fields.length > 0) {
        return {
          ok: false,
          error: {
            code: 'merge-person-conflict',
            entityId: person.id,
            field: fields.join(', '),
            message: `Personen-ID ${person.id} unterscheidet sich in ${fields.join(', ')} zwischen ${previous.fileName} und ${source.fileName}.`,
          },
        }
      }
    }

    for (const relationship of source.document.relationships) {
      const normalizedRelationship = normalizeRelationship(relationship)
      const previous = relationshipsById.get(relationship.id)

      if (!previous) {
        relationshipsById.set(relationship.id, {
          relationship: normalizedRelationship,
          fileName: source.fileName,
        })
        continue
      }

      const fields = differingFields(previous.relationship, normalizedRelationship)
      if (fields.length > 0) {
        return {
          ok: false,
          error: {
            code: 'merge-relationship-conflict',
            entityId: relationship.id,
            field: fields.join(', '),
            message: `Beziehungs-ID ${relationship.id} unterscheidet sich in ${fields.join(', ')} zwischen ${previous.fileName} und ${source.fileName}.`,
          },
        }
      }
    }
  }

  const document: FamilyTreeDocument = {
    schemaVersion: 1,
    persons: [...personsById.values()].map(({ person }) => person),
    relationships: [...relationshipsById.values()].map(({ relationship }) => relationship),
  }
  const sourceByPersonId = new Map(
    [...personsById].map(([id, entry]) => [id, entry.fileName]),
  )
  const sourceByRelationshipId = new Map(
    [...relationshipsById].map(([id, entry]) => [id, entry.fileName]),
  )
  const validationError = validateFamilyTreeDocument(document)

  if (validationError) {
    return {
      ok: false,
      error: invalidMergeError(
        validationError,
        document,
        sourceByPersonId,
        sourceByRelationshipId,
        sources,
      ),
    }
  }

  return { ok: true, value: document }
}
