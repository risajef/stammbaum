import type { Relationship, RelationshipOrigin } from './types'

export const getRelationshipOrigin = (
  relationship: {
    origin?: RelationshipOrigin | null
    inferredFrom?: Relationship['inferredFrom']
  },
): RelationshipOrigin =>
  relationship.origin ?? (relationship.inferredFrom ? 'automatic-inference' : 'manual')

export const relationshipOriginLabel = (origin: RelationshipOrigin): string => {
  switch (origin) {
    case 'ocr-suggestion':
      return 'OCR-Vorschlag'
    case 'automatic-inference':
      return 'Automatische Ableitung'
    case 'manual':
      return 'Manuell'
  }
}

export const relationshipOriginClassName = (origin: RelationshipOrigin) =>
  `relationship-origin--${origin}`
