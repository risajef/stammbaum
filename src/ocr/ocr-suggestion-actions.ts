import { createPerson } from '../domain/person'
import { createMarriage, createParentChild } from '../domain/relationship'
import { normalizePartialDate } from '../domain/life-date'
import type { DomainError, FamilyTreeDocument, PersonDraft, Result } from '../domain/types'
import type { OcrSuggestion } from './ocr-suggestions'

export interface OcrSuggestionIdFactories {
  personId: () => string
  relationshipId: () => string
}

const createId = (prefix: string) => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const error = (code: string, message: string): DomainError => ({ code, message })

const comparableName = (firstName: string, lastName: string) =>
  `${firstName} ${lastName}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de-DE')
    .replaceAll('ß', 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const defaultFactories = (): OcrSuggestionIdFactories => ({
  personId: () => createId('person'),
  relationshipId: () => createId('relationship'),
})

const validateSuggestionShape = (
  document: FamilyTreeDocument,
  suggestion: OcrSuggestion,
  draft: PersonDraft,
): DomainError | null => {
  if (!document.persons.some((person) => person.id === suggestion.existingPersonId)) {
    return error('person-not-found', 'Die Bezugsperson des OCR-Vorschlags wurde nicht gefunden.')
  }

  if (!draft.firstName?.trim()) {
    return { ...error('required', 'Der Vorname ist erforderlich.'), field: 'firstName' }
  }
  if (!draft.lastName?.trim()) {
    return { ...error('required', 'Der Nachname ist erforderlich.'), field: 'lastName' }
  }

  const candidateName = comparableName(
    draft.firstName,
    draft.lastName,
  )
  const candidateBirthDate = normalizePartialDate(draft.birthYear)
  if (document.persons.some((person) =>
    comparableName(person.firstName, person.lastName) === candidateName &&
    normalizePartialDate(person.birthYear) === candidateBirthDate
  )) {
    return error('duplicate-person', 'Die vorgeschlagene Person ist bereits vorhanden.')
  }

  if (
    suggestion.relationshipType === 'parent-child' &&
    suggestion.direction !== 'candidate-child' &&
    suggestion.direction !== 'candidate-parent'
  ) {
    return error('invalid-candidate', 'Die Richtung des Eltern-Kind-Vorschlags ist ungültig.')
  }
  if (suggestion.relationshipType === 'marriage' && suggestion.direction !== 'spouse') {
    return error('invalid-candidate', 'Die Richtung des Ehevorschlags ist ungültig.')
  }

  return null
}

export const acceptOcrSuggestion = (
  document: FamilyTreeDocument,
  suggestion: OcrSuggestion,
  factories: OcrSuggestionIdFactories = defaultFactories(),
  draft: PersonDraft = suggestion.newPerson,
): Result<FamilyTreeDocument> => {
  const shapeError = validateSuggestionShape(document, suggestion, draft)
  if (shapeError) {
    return { ok: false, error: shapeError }
  }

  const personResult = createPerson(document, draft, factories.personId)
  if (!personResult.ok) {
    return { ok: false, error: { ...personResult.error, code: 'invalid-candidate' } }
  }

  const candidateId = personResult.value.persons.at(-1)?.id
  if (!candidateId) {
    return {
      ok: false,
      error: error('invalid-candidate', 'Die vorgeschlagene Person konnte nicht angelegt werden.'),
    }
  }

  const options = {
    status: 'explicit' as const,
    sourceUrl: suggestion.sourceUrl,
    comment: suggestion.reason,
    origin: 'ocr-suggestion' as const,
  }
  const relationshipResult = suggestion.relationshipType === 'marriage'
    ? createMarriage(
        personResult.value,
        candidateId,
        suggestion.existingPersonId,
        options,
        factories.relationshipId,
      )
    : createParentChild(
        personResult.value,
        suggestion.direction === 'candidate-parent'
          ? candidateId
          : suggestion.existingPersonId,
        suggestion.direction === 'candidate-parent'
          ? suggestion.existingPersonId
          : candidateId,
        options,
        factories.relationshipId,
      )

  if (!relationshipResult.ok) {
    return { ok: false, error: relationshipResult.error }
  }

  return relationshipResult
}

export const rejectOcrSuggestion = (
  suggestions: readonly OcrSuggestion[],
  suggestionId: string,
): OcrSuggestion[] => suggestions.filter((suggestion) => suggestion.id !== suggestionId)
