import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse } from 'yaml'

const usage = 'Verwendung: node scripts/detect-family-loops.mjs <stammbaum.yaml> [--json]'

const personName = (person) => {
  if (!person) return 'Unbekannte Person'
  return `${person.firstName} ${person.lastName}`.trim()
}

const addParentRelationship = (parentsByChild, relationship) => {
  const parentRelationships = parentsByChild.get(relationship.toId) ?? []
  parentRelationships.push(relationship)
  parentsByChild.set(relationship.toId, parentRelationships)
}

const ancestorPathsFrom = (parentsByChild, startId) => {
  const paths = new Map([[
    startId,
    { personIds: [startId], relationshipIds: [] },
  ]])
  const pending = [startId]

  while (pending.length > 0) {
    const currentId = pending.shift()
    const currentPath = paths.get(currentId)

    for (const relationship of parentsByChild.get(currentId) ?? []) {
      const ancestorId = relationship.fromId
      if (paths.has(ancestorId)) continue

      paths.set(ancestorId, {
        personIds: [...currentPath.personIds, ancestorId],
        relationshipIds: [...currentPath.relationshipIds, relationship.id],
      })
      pending.push(ancestorId)
    }
  }

  return paths
}

const bloodPathBetween = (parentsByChild, startId, targetId) => {
  const firstPaths = ancestorPathsFrom(parentsByChild, startId)
  const secondPaths = ancestorPathsFrom(parentsByChild, targetId)
  let shortestPath = null

  for (const [ancestorId, firstPath] of firstPaths) {
    const secondPath = secondPaths.get(ancestorId)
    if (!secondPath) continue

    const candidate = {
      personIds: [
        ...firstPath.personIds,
        ...secondPath.personIds.slice(0, -1).reverse(),
      ],
      relationshipIds: [
        ...firstPath.relationshipIds,
        ...[...secondPath.relationshipIds].reverse(),
      ],
    }

    if (!shortestPath || candidate.relationshipIds.length < shortestPath.relationshipIds.length) {
      shortestPath = candidate
    }
  }

  return shortestPath
}

export const detectFamilyLoops = (document) => {
  const persons = Array.isArray(document?.persons) ? document.persons : []
  const relationships = Array.isArray(document?.relationships) ? document.relationships : []
  const personsById = new Map(persons.map((person) => [person.id, person]))
  const parentsByChild = new Map(persons.map((person) => [person.id, []]))

  relationships
    .filter((relationship) =>
      relationship.type === 'parent-child' &&
      personsById.has(relationship.fromId) &&
      personsById.has(relationship.toId))
    .forEach((relationship) => addParentRelationship(parentsByChild, relationship))

  return relationships
    .filter((relationship) =>
      relationship.type === 'marriage' &&
      personsById.has(relationship.fromId) &&
      personsById.has(relationship.toId))
    .flatMap((relationship) => {
      const path = bloodPathBetween(parentsByChild, relationship.fromId, relationship.toId)
      if (!path) return []

      return [{
        marriageId: relationship.id,
        firstPersonId: relationship.fromId,
        secondPersonId: relationship.toId,
        pathPersonIds: path.personIds,
        pathRelationshipIds: path.relationshipIds,
      }]
    })
}

export const formatFamilyLoopReport = (document, loops) => {
  if (loops.length === 0) {
    return 'Keine Verwandtschafts-Ehen gefunden.'
  }

  const personsById = new Map((document.persons ?? []).map((person) => [person.id, person]))
  const nameFor = (personId) => personName(personsById.get(personId))
  const pathLabel = (loop) => loop.pathPersonIds
    .map((personId, index) => {
      const name = nameFor(personId)
      const relationshipId = loop.pathRelationshipIds[index]
      return relationshipId
        ? `${name} --[Eltern-Kind: ${relationshipId}]--`
        : name
    })
    .join(' ')
  const loopLabel = (loop) => [
    ...loop.pathPersonIds.map(nameFor),
    `${nameFor(loop.firstPersonId)} [Ehe: ${loop.marriageId}]`,
  ].join(' -> ')

  return [
    `Gefundene Verwandtschafts-Ehen: ${loops.length}`,
    '',
    ...loops.flatMap((loop, index) => [
      `${index + 1}. Ehe ${loop.marriageId}: ${nameFor(loop.firstPersonId)} ↔ ${nameFor(loop.secondPersonId)}`,
      `   Verwandtschaftspfad: ${pathLabel(loop)}`,
      `   Loop: ${loopLabel(loop)}`,
      '',
    ]),
  ].join('\n').trim()
}

const parseDocument = (source) => {
  const document = parse(source)
  if (
    !document ||
    typeof document !== 'object' ||
    !Array.isArray(document.persons) ||
    !Array.isArray(document.relationships)
  ) {
    throw new Error('Die YAML-Datei muss persons und relationships als Listen enthalten.')
  }

  return document
}

const main = async () => {
  const args = process.argv.slice(2)
  const asJson = args.includes('--json')
  const fileName = args.find((arg) => !arg.startsWith('-'))

  if (!fileName) {
    console.error(usage)
    process.exitCode = 1
    return
  }

  try {
    const source = await readFile(path.resolve(fileName), 'utf8')
    const document = parseDocument(source)
    const loops = detectFamilyLoops(document)
    console.log(asJson ? JSON.stringify(loops, null, 2) : formatFamilyLoopReport(document, loops))
  } catch (error) {
    console.error(`Fehler: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
