import type { DomainError, FamilyTreeDocument, Relationship } from './types'
import { comparePartialDates, isValidPartialDate } from './life-date'

const error = (code: string, message: string, entityId?: string): DomainError => ({
  code,
  message,
  entityId,
})

const isValidSourceUrl = (sourceUrl: string) => {
  try {
    const parsedUrl = new URL(sourceUrl.trim())
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

const hasRelationshipPair = (
  relationships: Relationship[],
  relationship: Relationship,
  reverse: boolean,
) =>
  relationships.some((candidate) => {
    if (candidate.type !== relationship.type) return false
    if (candidate.id === relationship.id) return false

    if (reverse) {
      return (
        candidate.fromId === relationship.toId && candidate.toId === relationship.fromId
      )
    }

    return candidate.fromId === relationship.fromId && candidate.toId === relationship.toId
  })

export const validateFamilyTreeDocument = (
  document: FamilyTreeDocument,
): DomainError | null => {
  if (document.schemaVersion !== 1) {
    return error('unsupported-schema-version', 'Die YAML-Schema-Version wird nicht unterstützt.')
  }

  const personIds = new Set<string>()
  for (const person of document.persons) {
    if (personIds.has(person.id)) {
      return error('duplicate-person-id', 'Eine Personen-ID kommt mehrfach vor.', person.id)
    }
    personIds.add(person.id)

    if (!person.firstName.trim() || !person.lastName.trim()) {
      return error('invalid-person-name', 'Vor- und Nachname müssen ausgefüllt sein.', person.id)
    }

    if (
      person.gender !== null &&
      person.gender !== 'woman' &&
      person.gender !== 'man'
    ) {
      return error('invalid-gender', 'Das Geschlecht muss Frau oder Mann sein.', person.id)
    }

    if (!isValidPartialDate(person.birthYear) || !isValidPartialDate(person.deathYear)) {
      return error(
        'invalid-date',
        'Lebensdaten müssen im Format YYYY, YYYY-MM oder YYYY-MM-DD angegeben werden.',
        person.id,
      )
    }

    if (
      person.birthYear !== null &&
      person.deathYear !== null &&
      comparePartialDates(person.deathYear, person.birthYear) === -1
    ) {
      return error(
        'invalid-life-span',
        'Das Todesdatum darf nicht vor dem Geburtsdatum liegen.',
        person.id,
      )
    }
  }

  const relationshipIds = new Set<string>()
  for (const relationship of document.relationships) {
    if (relationshipIds.has(relationship.id)) {
      return error(
        'duplicate-relationship-id',
        'Eine Beziehungs-ID kommt mehrfach vor.',
        relationship.id,
      )
    }
    relationshipIds.add(relationship.id)

    if (!personIds.has(relationship.fromId) || !personIds.has(relationship.toId)) {
      return error(
        'relationship-person-not-found',
        'Eine Beziehung verweist auf eine unbekannte Person.',
        relationship.id,
      )
    }

    if (relationship.fromId === relationship.toId) {
      return error(
        'self-relationship',
        'Eine Beziehung darf nicht auf dieselbe Person zeigen.',
        relationship.id,
      )
    }

    if (relationship.status !== 'explicit' && relationship.status !== 'inferred') {
      return error('invalid-status', 'Der Beziehungsstatus ist ungültig.', relationship.id)
    }

    if (relationship.type === 'marriage') {
      if (!isValidPartialDate(relationship.startDate)) {
        return error(
          'invalid-date',
          'Das Ehebeginn-Datum muss im Format YYYY, YYYY-MM oder YYYY-MM-DD angegeben werden.',
          relationship.id,
        )
      }

      if (relationship.startDate !== null && relationship.startDate !== undefined) {
        for (const personId of [relationship.fromId, relationship.toId]) {
          const deathDate = document.persons.find((person) => person.id === personId)?.deathYear
          if (
            deathDate !== null &&
            deathDate !== undefined &&
            comparePartialDates(deathDate, relationship.startDate) === -1
          ) {
            return error(
              'invalid-marriage-span',
              'Das Eheende darf nicht vor dem Ehebeginn liegen.',
              relationship.id,
            )
          }
        }
      }
    }

    if (relationship.sourceUrl !== null && !isValidSourceUrl(relationship.sourceUrl)) {
      return error(
        'invalid-source-url',
        'Die Quelle muss eine gültige HTTP- oder HTTPS-URL sein.',
        relationship.id,
      )
    }

    if (relationship.inferredFrom) {
      if (relationship.status !== 'inferred' || relationship.type !== 'parent-child') {
        return error(
          'invalid-inference',
          'Automatische Beziehungen müssen geschlussfolgerte Eltern-Kind-Beziehungen sein.',
          relationship.id,
        )
      }

      const sourceRelationship = document.relationships.find(
        (candidate) => candidate.id === relationship.inferredFrom?.sourceRelationshipId,
      )
      if (
        relationship.inferredFrom.rule !== 'spouse-parent' ||
        !sourceRelationship ||
        sourceRelationship.type !== 'parent-child' ||
        sourceRelationship.inferredFrom ||
        sourceRelationship.toId !== relationship.toId ||
        sourceRelationship.fromId === relationship.fromId
      ) {
        return error(
          'invalid-inference',
          'Die automatische Herkunft der Beziehung ist ungültig.',
          relationship.id,
        )
      }

      const hasSourceMarriage = document.relationships.some(
        (candidate) =>
          candidate.type === 'marriage' &&
          ((candidate.fromId === sourceRelationship.fromId &&
            candidate.toId === relationship.fromId) ||
            (candidate.fromId === relationship.fromId &&
              candidate.toId === sourceRelationship.fromId)),
      )
      if (!hasSourceMarriage) {
        return error(
          'invalid-inference',
          'Die automatische Elternschaft verweist auf keine bestehende Ehe.',
          relationship.id,
        )
      }
    }

    if (relationship.type === 'marriage') {
      const woman = document.persons.find((person) => person.id === relationship.fromId)
      const man = document.persons.find((person) => person.id === relationship.toId)
      if (woman?.gender !== 'woman' || man?.gender !== 'man') {
        return error(
          'invalid-marriage-role',
          'Eine Ehe muss von einer Frau zu einem Mann zeigen.',
          relationship.id,
        )
      }

      if (hasRelationshipPair(document.relationships, relationship, true)) {
        return error('duplicate-relationship', 'Eine Ehe kommt mehrfach vor.', relationship.id)
      }
    }

    if (relationship.type === 'parent-child') {
      if (hasRelationshipPair(document.relationships, relationship, false)) {
        return error(
          'duplicate-relationship',
          'Eine Eltern-Kind-Beziehung kommt mehrfach vor.',
          relationship.id,
        )
      }
    }
  }

  return null
}