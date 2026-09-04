import type {
  DomainError,
  FamilyTreeDocument,
  RelationshipType,
  Result,
} from '../domain/types'

export const relationshipHandleIds = {
  marriageSide: 'marriage-side',
  parentSource: 'source-bottom',
  childTarget: 'target-top',
} as const

export interface RelationshipConnectionDraft {
  relationshipType: RelationshipType
  sourceId: string
  targetId: string
}

export interface RelationshipConnectionInput {
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

const invalidHandles = (message: string): Result<RelationshipConnectionDraft> => ({
  ok: false,
  error: {
    code: 'invalid-relationship-handles',
    message,
  },
})

export const classifyRelationshipConnection = (
  document: FamilyTreeDocument,
  connection: RelationshipConnectionInput,
): Result<RelationshipConnectionDraft> => {
  if (!connection.source || !connection.target) {
    return invalidHandles('Die Verbindung benötigt zwei Personen.')
  }

  if (connection.source === connection.target) {
    return invalidHandles('Eine Person kann nicht mit sich selbst verbunden werden.')
  }

  const sourcePerson = document.persons.find((person) => person.id === connection.source)
  const targetPerson = document.persons.find((person) => person.id === connection.target)
  if (!sourcePerson || !targetPerson) {
    return invalidHandles('Beide Personen müssen vorhanden sein.')
  }

  const isMarriage =
    connection.sourceHandle === relationshipHandleIds.marriageSide &&
    connection.targetHandle === relationshipHandleIds.marriageSide
  const isParentChild =
    connection.sourceHandle === relationshipHandleIds.parentSource &&
    connection.targetHandle === relationshipHandleIds.childTarget

  if (!isMarriage && !isParentChild) {
    return invalidHandles(
      'Nur Verbindungen zwischen seitlichen oder zwischen unterem und oberem Handle sind möglich.',
    )
  }

  return {
    ok: true,
    value: {
      relationshipType: isMarriage ? 'marriage' : 'parent-child',
      sourceId: sourcePerson.id,
      targetId: targetPerson.id,
    },
  }
}

export type RelationshipConnectionError = DomainError
