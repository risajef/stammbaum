import { parse, stringify } from 'yaml'
import { z } from 'zod'

import { validateFamilyTreeDocument } from '../domain/document-validation'
import { normalizePartialDate } from '../domain/life-date'
import type { DomainError, FamilyTreeDocument, Result } from '../domain/types'

const positionSchema = z
  .object({
    x: z.number().int(),
    y: z.number().int(),
  })
  .strict()

const personSchema = z
  .object({
    id: z.string().min(1),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    gender: z.enum(['woman', 'man']).nullable().optional(),
    birthYear: z.union([z.string().trim(), z.number().int()]).nullable().optional(),
    deathYear: z.union([z.string().trim(), z.number().int()]).nullable().optional(),
    position: positionSchema.nullable().optional(),
    comment: z.string().nullable().optional(),
  })
  .strict()

const inferenceSchema = z
  .object({
    rule: z.literal('spouse-parent'),
    sourceRelationshipId: z.string().min(1),
  })
  .strict()

const relationshipSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(['marriage', 'parent-child']),
    fromId: z.string().min(1),
    toId: z.string().min(1),
    startDate: z.union([z.string().trim(), z.number().int()]).nullable().optional(),
    status: z.enum(['explicit', 'inferred']),
    sourceUrl: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    inferredFrom: inferenceSchema.nullable().optional(),
  })
  .strict()

const rawDocumentSchema = z
  .object({
    schemaVersion: z.literal(1),
    persons: z.array(personSchema),
    relationships: z.array(relationshipSchema),
  })
  .strict()

const error = (code: string, message: string, field?: string): DomainError => ({
  code,
  message,
  field,
})

const normaliseComment = (comment: string | null | undefined): string | null => {
  const trimmed = comment?.trim() ?? ''
  return trimmed || null
}

const zodError = (validationError: z.ZodError): DomainError => {
  const issue = validationError.issues[0]
  return error(
    'invalid-yaml-structure',
    issue?.message ?? 'Die YAML-Struktur ist ungültig.',
    issue?.path.join('.') || undefined,
  )
}

const normaliseDocument = (rawDocument: z.infer<typeof rawDocumentSchema>): FamilyTreeDocument => ({
  schemaVersion: 1,
  persons: rawDocument.persons.map((person) => ({
    ...person,
    gender: person.gender ?? null,
    birthYear: normalizePartialDate(person.birthYear),
    deathYear: normalizePartialDate(person.deathYear),
    position: person.position ?? null,
    comment: normaliseComment(person.comment),
  })),
  relationships: rawDocument.relationships.map((relationship) => {
    const { startDate, ...relationshipWithoutStartDate } = relationship

    return {
      ...relationshipWithoutStartDate,
      ...(relationship.type === 'marriage'
        ? { startDate: normalizePartialDate(startDate) }
        : {}),
      sourceUrl: relationship.sourceUrl ?? null,
      comment: normaliseComment(relationship.comment),
      inferredFrom: relationship.inferredFrom ?? null,
    }
  }),
})

export const parseFamilyTreeYaml = (source: string): Result<FamilyTreeDocument> => {
  let parsed: unknown
  try {
    parsed = parse(source)
  } catch {
    return {
      ok: false,
      error: error('invalid-yaml', 'Die Datei enthält keine gültige YAML-Syntax.'),
    }
  }

  const schemaResult = rawDocumentSchema.safeParse(parsed)
  if (!schemaResult.success) {
    return { ok: false, error: zodError(schemaResult.error) }
  }

  const document = normaliseDocument(schemaResult.data)
  const validationError = validateFamilyTreeDocument(document)
  if (validationError) {
    return { ok: false, error: validationError }
  }

  return { ok: true, value: document }
}

export const serializeFamilyTreeYaml = (document: FamilyTreeDocument): string => {
  const normalizedDocument: FamilyTreeDocument = {
    ...document,
    persons: document.persons.map((person) => ({
      ...person,
      birthYear: normalizePartialDate(person.birthYear),
      deathYear: normalizePartialDate(person.deathYear),
    })),
    relationships: document.relationships.map((relationship) => ({
      ...relationship,
      ...(relationship.type === 'marriage'
        ? { startDate: normalizePartialDate(relationship.startDate) }
        : {}),
    })),
  }
  const validationError = validateFamilyTreeDocument(normalizedDocument)
  if (validationError) {
    throw new Error(validationError.message)
  }

  return stringify(normalizedDocument)
}