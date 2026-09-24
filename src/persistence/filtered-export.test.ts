import { describe, expect, it } from 'vitest'

import type { FamilyTreeDocument } from '../domain/types'
import {
  createFilteredExportDocument,
  createFilteredExportFileName,
} from './filtered-export'

const document: FamilyTreeDocument = {
  schemaVersion: 1,
  persons: [
    {
      id: 'visible-parent',
      firstName: 'Ernst',
      lastName: 'Weber',
      gender: 'man',
      birthYear: null,
      deathYear: null,
      position: null,
    },
    {
      id: 'visible-child',
      firstName: 'Anna',
      lastName: 'Weber',
      gender: 'woman',
      birthYear: null,
      deathYear: null,
      position: null,
    },
  ],
  relationships: [
    {
      id: 'visible-relationship',
      type: 'parent-child',
      fromId: 'visible-parent',
      toId: 'visible-child',
      status: 'inferred',
      sourceUrl: null,
      comment: 'Sichtbare Notiz',
      inferredFrom: {
        rule: 'spouse-parent',
        sourceRelationshipId: 'hidden-source',
      },
      origin: 'automatic-inference',
    },
  ],
}

describe('filtered family tree export', () => {
  it('normalizes an inference whose source is outside the visible projection', () => {
    const exported = createFilteredExportDocument(document)
    const relationship = exported.relationships[0]

    expect(relationship).toMatchObject({
      id: 'visible-relationship',
      status: 'inferred',
      comment: 'Sichtbare Notiz',
      inferredFrom: null,
      origin: 'manual',
    })
  })

  it('creates a safe descriptive filename from the applied filter anchor', () => {
    expect(createFilteredExportFileName({
      mode: 'direct-ancestors',
      anchorPerson: { firstName: 'Ernst', lastName: 'Weber' },
    })).toBe('Direkte Vorfahren Ernst Weber.yaml')

    expect(createFilteredExportFileName({
      mode: 'extended-direct-ancestors-and-descendants',
      anchorPerson: { firstName: 'Ernst/..', lastName: 'Weber:?' },
    })).toBe('Erweiterte direkte Vor und Nachfahren Ernst.. Weber.yaml')
  })

  it('uses a neutral yaml filename without a person filter', () => {
    expect(createFilteredExportFileName({})).toBe('Stammbaum.yaml')
    expect(createFilteredExportFileName({ isLocalView: true, hideLeaves: true }))
      .toBe('Stammbaum Lokale Ansicht Ohne Leafs.yaml')
  })
})
