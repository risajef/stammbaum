export type Gender = 'woman' | 'man'

export type RelationshipType = 'marriage' | 'parent-child'

export type RelationshipStatus = 'explicit' | 'inferred'

export type RelationshipOrigin = 'manual' | 'automatic-inference'

export type PartialDate = string

export type DateValue = PartialDate | number

export interface Position {
  x: number
  y: number
}

export interface Person {
  id: string
  firstName: string
  lastName: string
  gender: Gender | null
  birthYear: DateValue | null
  deathYear: DateValue | null
  position: Position | null
  comment?: string | null
}

export interface RelationshipInference {
  rule: 'spouse-parent'
  sourceRelationshipId: string
}

export interface Relationship {
  id: string
  type: RelationshipType
  fromId: string
  toId: string
  startDate?: PartialDate | null
  status: RelationshipStatus
  sourceUrl: string | null
  comment?: string | null
  inferredFrom?: RelationshipInference | null
  origin?: RelationshipOrigin
}

export interface FamilyTreeDocument {
  schemaVersion: 1
  persons: Person[]
  relationships: Relationship[]
}

export interface PersonDraft {
  firstName: string
  lastName: string
  gender?: Gender | null
  birthYear?: DateValue | null
  deathYear?: DateValue | null
  position?: Position | null
  comment?: string | null
}

export interface DomainError {
  code: string
  message: string
  field?: string
  entityId?: string
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: DomainError }
