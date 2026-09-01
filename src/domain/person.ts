import type {
  DomainError,
  FamilyTreeDocument,
  Person,
  PersonDraft,
  Position,
  Result,
} from './types'
import { validateGenderChange } from './relationship'

const emptyValue = (value: number | null | undefined): number | null =>
  value === undefined ? null : value

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

const validateYear = (value: number | null, field: string): DomainError | null => {
  if (value === null) {
    return null
  }

  if (!Number.isInteger(value)) {
    return error('invalid-year', 'Das Jahr muss eine ganze Zahl sein.', field)
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
  birthYear: emptyValue(draft.birthYear),
  deathYear: emptyValue(draft.deathYear),
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

  const birthYearError = validateYear(person.birthYear, 'birthYear')
  if (birthYearError) {
    return { ...birthYearError, entityId: person.id }
  }

  const deathYearError = validateYear(person.deathYear, 'deathYear')
  if (deathYearError) {
    return { ...deathYearError, entityId: person.id }
  }

  if (
    person.birthYear !== null &&
    person.deathYear !== null &&
    person.deathYear < person.birthYear
  ) {
    return error(
      'invalid-life-span',
      'Das Todesjahr darf nicht vor dem Geburtsjahr liegen.',
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