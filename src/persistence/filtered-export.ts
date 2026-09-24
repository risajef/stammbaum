import type { Person, FamilyTreeDocument } from '../domain/types'
import type { BloodlineMode } from '../graph/graph-view'

export interface FilteredExportFileNameOptions {
  mode?: BloodlineMode | null
  anchorPerson?: Pick<Person, 'firstName' | 'lastName'> | null
  isLocalView?: boolean
  hideLeaves?: boolean
}

const bloodlineLabels: Record<BloodlineMode, string> = {
  blood: 'Nur Blutsverwandte',
  'direct-ancestors': 'Direkte Vorfahren',
  'extended-direct-ancestors': 'Erweiterte direkte Vorfahren',
  descendants: 'Nachkommen',
  'extended-descendants': 'Erweiterte Nachkommen',
  'direct-ancestors-and-descendants': 'Direkte Vor und Nachfahren',
  'extended-direct-ancestors-and-descendants': 'Erweiterte direkte Vor und Nachfahren',
}

const safeFileNamePart = (value: string) =>
  value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/, '')

export const createFilteredExportFileName = ({
  mode = null,
  anchorPerson = null,
  isLocalView = false,
  hideLeaves = false,
}: FilteredExportFileNameOptions = {}) => {
  const parts = [
    mode ? bloodlineLabels[mode] : 'Stammbaum',
    ...(mode && anchorPerson
      ? [safeFileNamePart(`${anchorPerson.firstName} ${anchorPerson.lastName}`)]
      : []),
    ...(isLocalView ? ['Lokale Ansicht'] : []),
    ...(hideLeaves ? ['Ohne Leafs'] : []),
  ]
    .map(safeFileNamePart)
    .filter(Boolean)

  return `${parts.join(' ') || 'Stammbaum'}.yaml`
}

export const createFilteredExportDocument = (
  document: FamilyTreeDocument,
): FamilyTreeDocument => {
  const visiblePersonIds = new Set(document.persons.map((person) => person.id))
  const visibleRelationships = document.relationships.filter(
    (relationship) =>
      visiblePersonIds.has(relationship.fromId) && visiblePersonIds.has(relationship.toId),
  )
  const visibleRelationshipIds = new Set(visibleRelationships.map((relationship) => relationship.id))

  return {
    ...document,
    persons: document.persons.map((person) => ({ ...person })),
    relationships: visibleRelationships.map((relationship) => {
      if (
        !relationship.inferredFrom ||
        visibleRelationshipIds.has(relationship.inferredFrom.sourceRelationshipId)
      ) {
        return { ...relationship }
      }

      return {
        ...relationship,
        inferredFrom: null,
        origin: 'manual',
      }
    }),
  }
}
