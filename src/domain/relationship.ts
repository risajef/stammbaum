import type {
  DomainError,
  FamilyTreeDocument,
  Gender,
  Relationship,
  RelationshipStatus,
  Result,
} from './types'

export interface RelationshipOptions {
  status?: RelationshipStatus
  sourceUrl?: string | null
  comment?: string | null
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

const relationshipOptions = (
  options: RelationshipOptions,
): Result<{ status: RelationshipStatus; sourceUrl: string | null; comment: string | null }> => {
  const status = options.status ?? 'explicit'
  if (status !== 'explicit' && status !== 'inferred') {
    return {
      ok: false,
      error: error('invalid-status', 'Der Beziehungsstatus ist ungueltig.'),
    }
  }

  const sourceUrl = options.sourceUrl ?? null
  const comment = options.comment?.trim() || null
  if (sourceUrl === null) {
    return { ok: true, value: { status, sourceUrl: null, comment } }
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
        message: 'Die Quelle muss eine gueltige HTTP- oder HTTPS-URL sein.',
        field: 'sourceUrl',
      },
    }
  }

  return { ok: true, value: { status, sourceUrl: sourceUrl.trim(), comment } }
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
        'Die Geschlechtsaenderung wuerde eine bestehende Ehe ungueltig machen.',
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
      error: error('person-not-found', 'Beide Personen muessen vorhanden sein.'),
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

  const relationship: Relationship = {
    id: idFactory(),
    type: 'marriage',
    fromId,
    toId,
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
      error: error('person-not-found', 'Elternteil und Kind muessen vorhanden sein.'),
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
        'Automatische Beziehungen werden ueber ihre Voraussetzungen entfernt.',
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
        'Automatisch abgeleitete Beziehungen muessen geschlussfolgert bleiben.',
        relationshipId,
      ),
    }
  }

  const metadata = relationshipOptions({
    status: nextStatus,
    sourceUrl:
      changes.sourceUrl === undefined ? currentRelationship.sourceUrl : changes.sourceUrl,
    comment:
      changes.comment === undefined ? currentRelationship.comment : changes.comment,
  })
  if (!metadata.ok) {
    return metadata
  }

  const relationships = [...document.relationships]
  relationships[relationshipIndex] = {
    ...currentRelationship,
    ...metadata.value,
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