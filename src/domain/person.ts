import type {
  DateValue,
  DomainError,
  FamilyTreeDocument,
  PartialDate,
  Person,
  PersonDraft,
  Position,
  Relationship,
  Result,
} from './types'
import { synchronizeInferredRelationships } from './inference'
import { validateFamilyTreeDocument } from './document-validation'
import {
  comparePartialDates,
  isValidPartialDate,
  parsePartialDate,
  normalizePartialDate,
} from './life-date'
import { getRelationshipOrigin } from './relationship-origin'
import { validateGenderChange } from './relationship'

const normaliseComment = (value: string | null | undefined): string | null => {
  const comment = value?.trim() ?? ''
  return comment || null
}

const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `person-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const error = (
  code: string,
  message: string,
  field?: string,
  entityId?: string,
): DomainError => ({ code, message, field, entityId })

const validateDate = (value: number | string | null, field: string): DomainError | null => {
  if (value === null) {
    return null
  }

  if (!isValidPartialDate(value)) {
    return error(
      'invalid-date',
      'Das Datum muss im Format YYYY, YYYY-MM oder YYYY-MM-DD angegeben werden.',
      field,
    )
  }

  return null
}

const validatePosition = (position: Position | null): DomainError | null => {
  if (position === null) {
    return null
  }

  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    return error('invalid-position', 'Die Position muss aus endlichen Zahlen bestehen.', 'position')
  }

  return null
}

const normalisePerson = (id: string, draft: PersonDraft): Person => ({
  id,
  firstName: draft.firstName.trim(),
  lastName: draft.lastName.trim(),
  gender: draft.gender ?? null,
  birthYear: normalizePartialDate(draft.birthYear),
  deathYear: normalizePartialDate(draft.deathYear),
  position: draft.position ?? null,
  comment: normaliseComment(draft.comment),
})

const validatePerson = (person: Person): DomainError | null => {
  if (!person.firstName.trim()) {
    return error('required', 'Der Vorname ist erforderlich.', 'firstName', person.id)
  }

  if (!person.lastName.trim()) {
    return error('required', 'Der Nachname ist erforderlich.', 'lastName', person.id)
  }

  if (person.gender !== null && person.gender !== 'woman' && person.gender !== 'man') {
    return error('invalid-gender', 'Das Geschlecht muss Frau oder Mann sein.', 'gender', person.id)
  }

  const birthDateError = validateDate(person.birthYear, 'birthYear')
  if (birthDateError) {
    return { ...birthDateError, entityId: person.id }
  }

  const deathDateError = validateDate(person.deathYear, 'deathYear')
  if (deathDateError) {
    return { ...deathDateError, entityId: person.id }
  }

  if (
    person.birthYear !== null &&
    person.deathYear !== null &&
    comparePartialDates(person.deathYear, person.birthYear) === -1
  ) {
    return error(
      'invalid-life-span',
      'Das Todesdatum darf nicht vor dem Geburtsdatum liegen.',
      'deathYear',
      person.id,
    )
  }

  const positionError = validatePosition(person.position)
  if (positionError) {
    return { ...positionError, entityId: person.id }
  }

  return null
}

const mergeConflict = (
  field: string,
  entityId: string,
): DomainError => error(
  'person-merge-conflict',
  'Die Personendaten widersprechen sich und können nicht fusioniert werden.',
  field,
  entityId,
)

const mergeRequiredText = (
  first: string,
  second: string,
  field: string,
  entityId: string,
): Result<string> => {
  const firstValue = first.trim()
  const secondValue = second.trim()
  if (!firstValue || !secondValue || firstValue !== secondValue) {
    return { ok: false, error: mergeConflict(field, entityId) }
  }

  return { ok: true, value: firstValue }
}

const mergeOptionalValue = <T>(
  first: T | null,
  second: T | null,
  field: string,
  entityId: string,
): Result<T | null> => {
  if (first === null) return { ok: true, value: second }
  if (second === null) return { ok: true, value: first }
  if (first !== second) {
    return { ok: false, error: mergeConflict(field, entityId) }
  }

  return { ok: true, value: first }
}

const partialDateSpecificity = (value: PartialDate) => {
  const parts = parsePartialDate(value)
  if (!parts) return -1
  return [parts.year, parts.month, parts.day].filter((part) => part !== null).length
}

const mergePartialDates = (
  first: DateValue | null,
  second: DateValue | null,
  field: string,
  entityId: string,
): Result<PartialDate | null> => {
  const firstValue = normalizePartialDate(first)
  const secondValue = normalizePartialDate(second)
  if (firstValue === null) return { ok: true, value: secondValue }
  if (secondValue === null) return { ok: true, value: firstValue }

  const firstParts = parsePartialDate(firstValue)
  const secondParts = parsePartialDate(secondValue)
  if (!firstParts || !secondParts) {
    return { ok: false, error: mergeConflict(field, entityId) }
  }

  for (const component of ['year', 'month', 'day'] as const) {
    const firstPart = firstParts[component]
    const secondPart = secondParts[component]
    if (firstPart !== null && secondPart !== null && firstPart !== secondPart) {
      return { ok: false, error: mergeConflict(field, entityId) }
    }
  }

  return {
    ok: true,
    value:
      partialDateSpecificity(firstValue) >= partialDateSpecificity(secondValue)
        ? firstValue
        : secondValue,
  }
}

const mergeComments = (
  first: string | null | undefined,
  second: string | null | undefined,
) => {
  const firstValue = normaliseComment(first)
  const secondValue = normaliseComment(second)
  if (!firstValue) return secondValue
  if (!secondValue || firstValue === secondValue) return firstValue
  return `${firstValue}\n${secondValue}`
}

const mergePersonData = (
  survivor: Person,
  merged: Person,
): Result<Person> => {
  const firstName = mergeRequiredText(survivor.firstName, merged.firstName, 'firstName', survivor.id)
  if (!firstName.ok) return firstName

  const lastName = mergeRequiredText(survivor.lastName, merged.lastName, 'lastName', survivor.id)
  if (!lastName.ok) return lastName

  const gender = mergeOptionalValue(survivor.gender, merged.gender, 'gender', survivor.id)
  if (!gender.ok) return gender

  const birthYear = mergePartialDates(survivor.birthYear, merged.birthYear, 'birthYear', survivor.id)
  if (!birthYear.ok) return birthYear

  const deathYear = mergePartialDates(survivor.deathYear, merged.deathYear, 'deathYear', survivor.id)
  if (!deathYear.ok) return deathYear

  return {
    ok: true,
    value: {
      ...survivor,
      firstName: firstName.value,
      lastName: lastName.value,
      gender: gender.value,
      birthYear: birthYear.value,
      deathYear: deathYear.value,
      comment: mergeComments(survivor.comment, merged.comment),
    },
  }
}

const isAutomaticRelationship = (relationship: Relationship) =>
  getRelationshipOrigin(relationship) === 'automatic-inference'

const mergeRelationshipKey = (relationship: Relationship) => {
  const endpointIds = relationship.type === 'marriage'
    ? [relationship.fromId, relationship.toId].sort()
    : [relationship.fromId, relationship.toId]
  return `${relationship.type}\u0000${endpointIds[0]}\u0000${endpointIds[1]}`
}

const consolidateRelationships = (
  relationships: Relationship[],
  survivorId: string,
  mergedId: string,
): Relationship[] => {
  const consolidated = new Map<string, Relationship>()

  for (const relationship of relationships) {
    const rewritten: Relationship = {
      ...relationship,
      fromId: relationship.fromId === mergedId ? survivorId : relationship.fromId,
      toId: relationship.toId === mergedId ? survivorId : relationship.toId,
    }
    if (rewritten.fromId === rewritten.toId) continue

    const key = mergeRelationshipKey(rewritten)
    const current = consolidated.get(key)
    if (!current || (isAutomaticRelationship(current) && !isAutomaticRelationship(rewritten))) {
      consolidated.set(key, rewritten)
    }
  }

  return [...consolidated.values()]
}

const hasTooManyParents = (document: FamilyTreeDocument): string | null => {
  const parentsByChild = new Map<string, Set<string>>()
  for (const relationship of document.relationships) {
    if (relationship.type !== 'parent-child') continue
    const parents = parentsByChild.get(relationship.toId) ?? new Set<string>()
    parents.add(relationship.fromId)
    parentsByChild.set(relationship.toId, parents)
  }

  for (const [childId, parents] of parentsByChild) {
    if (parents.size > 2) return childId
  }

  return null
}

export const createEmptyDocument = (): FamilyTreeDocument => ({
  schemaVersion: 1,
  persons: [],
  relationships: [],
})

export const createPerson = (
  document: FamilyTreeDocument,
  draft: PersonDraft,
  idFactory: () => string = createId,
): Result<FamilyTreeDocument> => {
  const person = normalisePerson(idFactory(), draft)
  const validationError = validatePerson(person)

  if (validationError) {
    return { ok: false, error: validationError }
  }

  return {
    ok: true,
    value: {
      ...document,
      persons: [...document.persons, person],
    },
  }
}

export const removePerson = (
  document: FamilyTreeDocument,
  personId: string,
): Result<FamilyTreeDocument> => {
  if (!document.persons.some((person) => person.id === personId)) {
    return {
      ok: false,
      error: error(
        'person-not-found',
        'Die Person wurde nicht gefunden.',
        undefined,
        personId,
      ),
    }
  }

  const candidate: FamilyTreeDocument = {
    ...document,
    persons: document.persons.filter((person) => person.id !== personId),
    relationships: document.relationships.filter(
      (relationship) => relationship.fromId !== personId && relationship.toId !== personId,
    ),
  }
  const synchronized = synchronizeInferredRelationships(candidate)
  const validationError = validateFamilyTreeDocument(synchronized)
  if (validationError) {
    return {
      ok: false,
      error: {
        ...validationError,
        code: 'person-remove-invalid-document',
      },
    }
  }

  return { ok: true, value: synchronized }
}

export const mergePersons = (
  document: FamilyTreeDocument,
  survivorId: string,
  mergedId: string,
): Result<FamilyTreeDocument> => {
  if (survivorId === mergedId) {
    return {
      ok: false,
      error: error(
        'person-merge-same-person',
        'Eine Person kann nicht mit sich selbst fusioniert werden.',
        undefined,
        survivorId,
      ),
    }
  }

  const survivor = document.persons.find((person) => person.id === survivorId)
  const merged = document.persons.find((person) => person.id === mergedId)
  if (!survivor || !merged) {
    return {
      ok: false,
      error: error(
        'person-not-found',
        'Beide Personen müssen für die Fusion vorhanden sein.',
        undefined,
        !survivor ? survivorId : mergedId,
      ),
    }
  }

  const personResult = mergePersonData(survivor, merged)
  if (!personResult.ok) return personResult

  const candidate: FamilyTreeDocument = {
    ...document,
    persons: document.persons
      .filter((person) => person.id !== mergedId)
      .map((person) => person.id === survivorId ? personResult.value : person),
    relationships: consolidateRelationships(document.relationships, survivorId, mergedId),
  }
  const synchronized = synchronizeInferredRelationships(candidate)
  const childWithTooManyParents = hasTooManyParents(synchronized)
  if (childWithTooManyParents) {
    return {
      ok: false,
      error: error(
        'person-merge-too-many-parents',
        'Die Fusion würde einem Kind mehr als zwei Eltern geben.',
        undefined,
        childWithTooManyParents,
      ),
    }
  }

  const validationError = validateFamilyTreeDocument(synchronized)
  if (validationError) {
    return {
      ok: false,
      error: {
        ...validationError,
        code: 'person-merge-invalid-document',
      },
    }
  }

  return { ok: true, value: synchronized }
}

export const updatePerson = (
  document: FamilyTreeDocument,
  personId: string,
  changes: Partial<PersonDraft>,
): Result<FamilyTreeDocument> => {
  const personIndex = document.persons.findIndex((person) => person.id === personId)

  if (personIndex === -1) {
    return {
      ok: false,
      error: error('person-not-found', 'Die Person wurde nicht gefunden.', undefined, personId),
    }
  }

  const currentPerson = document.persons[personIndex]
  const person = normalisePerson(personId, {
    firstName: changes.firstName ?? currentPerson.firstName,
    lastName: changes.lastName ?? currentPerson.lastName,
    gender: changes.gender === undefined ? currentPerson.gender : changes.gender,
    birthYear: changes.birthYear === undefined ? currentPerson.birthYear : changes.birthYear,
    deathYear: changes.deathYear === undefined ? currentPerson.deathYear : changes.deathYear,
    position: changes.position === undefined ? currentPerson.position : changes.position,
    comment: changes.comment === undefined ? currentPerson.comment : changes.comment,
  })
  const validationError = validatePerson(person)

  if (validationError) {
    return { ok: false, error: validationError }
  }

  const genderError = validateGenderChange(document, personId, person.gender)
  if (genderError) {
    return { ok: false, error: genderError }
  }

  const persons = [...document.persons]
  persons[personIndex] = person

  return {
    ok: true,
    value: {
      ...document,
      persons,
    },
  }
}
