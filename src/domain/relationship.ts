import {
  comparePartialDates,
  isValidPartialDate,
  normalizePartialDate,
} from './life-date'
import type {
  DateValue,
  DomainError,
  FamilyTreeDocument,
  Gender,
  PartialDate,
  Person,
  Relationship,
  RelationshipOrigin,
  RelationshipStatus,
  Result,
} from './types'

export interface RelationshipOptions {
  startDate?: DateValue | null
  status?: RelationshipStatus
  sourceUrl?: string | null
  comment?: string | null
  origin?: RelationshipOrigin
}

export type RelationshipChanges = RelationshipOptions

const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `relationship-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const error = (
  code: string,
  message: string,
  entityId?: string,
): DomainError => ({ code, message, entityId })

const getPerson = (document: FamilyTreeDocument, personId: string) =>
  document.persons.find((person) => person.id === personId)

const marriageStartDate = (
  value: DateValue | null | undefined,
): Result<PartialDate | null> => {
  const startDate = normalizePartialDate(value)
  if (!isValidPartialDate(startDate)) {
    return {
      ok: false,
      error: {
        code: 'invalid-date',
        message: 'Das Datum muss im Format YYYY, YYYY-MM oder YYYY-MM-DD angegeben werden.',
        field: 'startDate',
      },
    }
  }

  return { ok: true, value: startDate }
}

const validateMarriageStartDate = (
  document: FamilyTreeDocument,
  fromId: string,
  toId: string,
  startDate: PartialDate | null,
): DomainError | null => {
  if (startDate === null) {
    return null
  }

  for (const personId of [fromId, toId]) {
    const deathDate = getPerson(document, personId)?.deathYear
    if (deathDate !== null && deathDate !== undefined && comparePartialDates(deathDate, startDate) === -1) {
      return {
        code: 'invalid-marriage-span',
        message: 'Das Eheende darf nicht vor dem Ehebeginn liegen.',
        field: 'startDate',
      }
    }
  }

  return null
}

const relationshipOptions = (
  options: RelationshipOptions,
): Result<{
  status: RelationshipStatus
  sourceUrl: string | null
  comment: string | null
  origin: RelationshipOrigin
}> => {
  const status = options.status ?? 'explicit'
  if (status !== 'explicit' && status !== 'inferred') {
    return {
      ok: false,
      error: error('invalid-status', 'Der Beziehungsstatus ist ungültig.'),
    }
  }

  const sourceUrl = options.sourceUrl ?? null
  const comment = options.comment?.trim() || null
  const origin = options.origin ?? 'manual'
  if (
    origin !== 'manual' &&
    origin !== 'ocr-suggestion' &&
    origin !== 'automatic-inference'
  ) {
    return {
      ok: false,
      error: error('invalid-origin', 'Die Beziehungsherkunft ist ungültig.'),
    }
  }
  if (sourceUrl === null) {
    return { ok: true, value: { status, sourceUrl: null, comment, origin } }
  }

  try {
    const parsedUrl = new URL(sourceUrl.trim())
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('unsupported protocol')
    }
  } catch {
    return {
      ok: false,
      error: {
        code: 'invalid-source-url',
        message: 'Die Quelle muss eine gültige HTTP- oder HTTPS-URL sein.',
        field: 'sourceUrl',
      },
    }
  }

  return { ok: true, value: { status, sourceUrl: sourceUrl.trim(), comment, origin } }
}

const hasSamePair = (relationship: Relationship, firstId: string, secondId: string) =>
  relationship.type === 'marriage' &&
  ((relationship.fromId === firstId && relationship.toId === secondId) ||
    (relationship.fromId === secondId && relationship.toId === firstId))

const hasSameDirectedPair = (
  relationship: Relationship,
  fromId: string,
  toId: string,
) =>
  relationship.type === 'parent-child' &&
  relationship.fromId === fromId &&
  relationship.toId === toId

export const validateGenderChange = (
  document: FamilyTreeDocument,
  personId: string,
  gender: Gender | null,
): DomainError | null => {
  const person = getPerson(document, personId)
  if (!person) {
    return error('person-not-found', 'Die Person wurde nicht gefunden.', personId)
  }

  for (const relationship of document.relationships) {
    if (relationship.type !== 'marriage') continue
    if (relationship.fromId !== personId && relationship.toId !== personId) continue

    const spouseId = relationship.fromId === personId ? relationship.toId : relationship.fromId
    const spouse = getPerson(document, spouseId)
    if (!spouse) continue

    const remainsValid =
      (gender === 'woman' && spouse.gender === 'man') ||
      (gender === 'man' && spouse.gender === 'woman')

    if (!remainsValid) {
      return error(
        'invalid-marriage-role',
        'Die Geschlechtsänderung würde eine bestehende Ehe ungültig machen.',
        personId,
      )
    }
  }

  return null
}

export const createMarriage = (
  document: FamilyTreeDocument,
  firstPersonId: string,
  secondPersonId: string,
  options: RelationshipOptions = {},
  idFactory: () => string = createId,
): Result<FamilyTreeDocument> => {
  if (firstPersonId === secondPersonId) {
    return {
      ok: false,
      error: error('self-relationship', 'Eine Person kann nicht sich selbst heiraten.'),
    }
  }

  const firstPerson = getPerson(document, firstPersonId)
  const secondPerson = getPerson(document, secondPersonId)
  if (!firstPerson || !secondPerson) {
    return {
      ok: false,
      error: error('person-not-found', 'Beide Personen müssen vorhanden sein.'),
    }
  }

  let fromId: string
  let toId: string
  if (firstPerson.gender === 'woman' && secondPerson.gender === 'man') {
    fromId = firstPersonId
    toId = secondPersonId
  } else if (firstPerson.gender === 'man' && secondPerson.gender === 'woman') {
    fromId = secondPersonId
    toId = firstPersonId
  } else {
    return {
      ok: false,
      error: error(
        'invalid-marriage-role',
        'Eine Ehe kann nur zwischen einer Frau und einem Mann angelegt werden.',
      ),
    }
  }

  if (document.relationships.some((relationship) => hasSamePair(relationship, fromId, toId))) {
    return {
      ok: false,
      error: error('duplicate-relationship', 'Diese Ehe besteht bereits.'),
    }
  }

  const metadata = relationshipOptions(options)
  if (!metadata.ok) {
    return metadata
  }

  const startDateResult = marriageStartDate(options.startDate)
  if (!startDateResult.ok) {
    return startDateResult
  }

  const dateError = validateMarriageStartDate(
    document,
    fromId,
    toId,
    startDateResult.value,
  )
  if (dateError) {
    return { ok: false, error: dateError }
  }

  const relationship: Relationship = {
    id: idFactory(),
    type: 'marriage',
    fromId,
    toId,
    startDate: startDateResult.value,
    ...metadata.value,
    inferredFrom: null,
  }

  return {
    ok: true,
    value: {
      ...document,
      relationships: [...document.relationships, relationship],
    },
  }
}

export const getImplicitMarriageEndDate = (
  relationship: Relationship,
  persons: readonly Person[],
): PartialDate | null => {
  if (relationship.type !== 'marriage') {
    return null
  }

  const firstPerson = persons.find((person) => person.id === relationship.fromId)
  const secondPerson = persons.find((person) => person.id === relationship.toId)
  const firstDeathDate = firstPerson?.deathYear
  const secondDeathDate = secondPerson?.deathYear
  if (firstDeathDate === null || firstDeathDate === undefined ||
      secondDeathDate === null || secondDeathDate === undefined) {
    return null
  }

  const comparison = comparePartialDates(firstDeathDate, secondDeathDate)
  if (comparison === null) {
    return null
  }

  return normalizePartialDate(comparison <= 0 ? firstDeathDate : secondDeathDate)
}

export const createParentChild = (
  document: FamilyTreeDocument,
  parentId: string,
  childId: string,
  options: RelationshipOptions = {},
  idFactory: () => string = createId,
): Result<FamilyTreeDocument> => {
  if (parentId === childId) {
    return {
      ok: false,
      error: error('self-relationship', 'Eine Person kann nicht ihr eigenes Kind sein.'),
    }
  }

  if (!getPerson(document, parentId) || !getPerson(document, childId)) {
    return {
      ok: false,
      error: error('person-not-found', 'Elternteil und Kind müssen vorhanden sein.'),
    }
  }

  if (
    document.relationships.some((relationship) =>
      hasSameDirectedPair(relationship, parentId, childId),
    )
  ) {
    return {
      ok: false,
      error: error('duplicate-relationship', 'Diese Eltern-Kind-Beziehung besteht bereits.'),
    }
  }

  const metadata = relationshipOptions(options)
  if (!metadata.ok) {
    return metadata
  }

  const relationship: Relationship = {
    id: idFactory(),
    type: 'parent-child',
    fromId: parentId,
    toId: childId,
    ...metadata.value,
    inferredFrom: null,
  }

  return {
    ok: true,
    value: {
      ...document,
      relationships: [...document.relationships, relationship],
    },
  }
}

export const removeRelationship = (
  document: FamilyTreeDocument,
  relationshipId: string,
): Result<FamilyTreeDocument> => {
  const relationship = document.relationships.find(
    (candidate) => candidate.id === relationshipId,
  )
  if (!relationship) {
    return {
      ok: false,
      error: error(
        'relationship-not-found',
        'Die Beziehung wurde nicht gefunden.',
        relationshipId,
      ),
    }
  }

  if (relationship.inferredFrom) {
    return {
      ok: false,
      error: error(
        'automatic-relationship',
        'Automatische Beziehungen werden über ihre Voraussetzungen entfernt.',
        relationshipId,
      ),
    }
  }

  return {
    ok: true,
    value: {
      ...document,
      relationships: document.relationships.filter(
        (relationship) => relationship.id !== relationshipId,
      ),
    },
  }
}

export const updateRelationship = (
  document: FamilyTreeDocument,
  relationshipId: string,
  changes: RelationshipChanges,
): Result<FamilyTreeDocument> => {
  const relationshipIndex = document.relationships.findIndex(
    (relationship) => relationship.id === relationshipId,
  )

  if (relationshipIndex === -1) {
    return {
      ok: false,
      error: error(
        'relationship-not-found',
        'Die Beziehung wurde nicht gefunden.',
        relationshipId,
      ),
    }
  }

  const currentRelationship = document.relationships[relationshipIndex]
  const nextStatus = changes.status === undefined ? currentRelationship.status : changes.status
  if (currentRelationship.inferredFrom && nextStatus !== 'inferred') {
    return {
      ok: false,
      error: error(
        'invalid-status',
        'Automatisch abgeleitete Beziehungen müssen geschlussfolgert bleiben.',
        relationshipId,
      ),
    }
  }

  const startDateResult = currentRelationship.type === 'marriage'
    ? marriageStartDate(
        changes.startDate === undefined
          ? currentRelationship.startDate
          : changes.startDate,
      )
    : { ok: true as const, value: null }
  if (!startDateResult.ok) {
    return startDateResult
  }

  const dateError = currentRelationship.type === 'marriage'
    ? validateMarriageStartDate(
        document,
        currentRelationship.fromId,
        currentRelationship.toId,
        startDateResult.value,
      )
    : null
  if (dateError) {
    return { ok: false, error: dateError }
  }

  const metadata = relationshipOptions({
    status: nextStatus,
    sourceUrl:
      changes.sourceUrl === undefined ? currentRelationship.sourceUrl : changes.sourceUrl,
    comment:
      changes.comment === undefined ? currentRelationship.comment : changes.comment,
    origin:
      changes.origin === undefined
        ? currentRelationship.origin ?? (currentRelationship.inferredFrom
          ? 'automatic-inference'
          : 'manual')
        : changes.origin,
  })
  if (!metadata.ok) {
    return metadata
  }

  const relationships = [...document.relationships]
  relationships[relationshipIndex] = {
    ...currentRelationship,
    ...metadata.value,
    ...(currentRelationship.type === 'marriage'
      ? { startDate: startDateResult.value }
      : {}),
    inferredFrom: currentRelationship.inferredFrom ?? null,
  }

  return {
    ok: true,
    value: {
      ...document,
      relationships,
    },
  }
}
