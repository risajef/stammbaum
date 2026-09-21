import { parse } from 'yaml'

import variantConfigSource from '../../duplicate-name-variants.yaml?raw'

export interface DuplicateNameVariantConfig {
  firstNameVariants: readonly (readonly string[])[]
  lastNameVariants: readonly (readonly string[])[]
}

export interface DuplicateNameMatcher {
  firstNamesMatch: (first: string, second: string) => boolean
  lastNamesMatch: (first: string, second: string) => boolean
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const normalizeName = (value: string) => value.trim().normalize('NFC').toLocaleLowerCase('de-DE')

const variantGroupsFor = (value: unknown, fieldName: string): string[][] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    throw new Error(`Die Konfiguration ${fieldName} muss eine Liste von Namensgruppen enthalten.`)
  }

  return value.map((group, index) => {
    if (!Array.isArray(group) || group.length < 2 || group.some((name) => typeof name !== 'string' || !name.trim())) {
      throw new Error(`Die Konfiguration ${fieldName}[${index}] muss mindestens zwei nichtleere Namen enthalten.`)
    }

    return [...new Set(group.map((name) => name.trim()))]
  })
}

export const parseDuplicateNameVariantConfig = (value: unknown): DuplicateNameVariantConfig => {
  if (!isRecord(value)) {
    throw new Error('Die Duplikat-Namenskonfiguration muss ein YAML-Objekt sein.')
  }

  return {
    firstNameVariants: variantGroupsFor(value.firstNameVariants, 'firstNameVariants'),
    lastNameVariants: variantGroupsFor(value.lastNameVariants, 'lastNameVariants'),
  }
}

const variantLookupFor = (groups: readonly (readonly string[])[]) => {
  const adjacent = new Map<string, Set<string>>()
  for (const group of groups) {
    const names = group.map(normalizeName)
    for (const name of names) {
      const neighbours = adjacent.get(name) ?? new Set<string>()
      names.forEach((neighbour) => neighbours.add(neighbour))
      adjacent.set(name, neighbours)
    }
  }

  const lookup = new Map<string, Set<string>>()
  for (const name of adjacent.keys()) {
    const reachable = new Set<string>([name])
    const pending = [name]
    while (pending.length > 0) {
      const current = pending.shift()
      if (!current) continue
      for (const neighbour of adjacent.get(current) ?? []) {
        if (reachable.has(neighbour)) continue
        reachable.add(neighbour)
        pending.push(neighbour)
      }
    }
    lookup.set(name, reachable)
  }

  return lookup
}

const equivalentName = (
  first: string,
  second: string,
  variants: ReadonlyMap<string, ReadonlySet<string>>,
) => {
  const firstName = normalizeName(first)
  const secondName = normalizeName(second)
  if (!firstName || !secondName) return false
  return firstName === secondName || variants.get(firstName)?.has(secondName) === true
}

const firstNameTokens = (value: string) => normalizeName(value).split(/\s+/).filter(Boolean)

const matchingTokens = (
  shorter: readonly string[],
  longer: readonly string[],
  variants: ReadonlyMap<string, ReadonlySet<string>>,
  tokenIndex = 0,
  used = new Set<number>(),
): boolean => {
  if (tokenIndex === shorter.length) return true

  for (let index = 0; index < longer.length; index += 1) {
    if (used.has(index) || !equivalentName(shorter[tokenIndex], longer[index], variants)) continue
    used.add(index)
    if (matchingTokens(shorter, longer, variants, tokenIndex + 1, used)) return true
    used.delete(index)
  }

  return false
}

export const createDuplicateNameMatcher = (
  config: DuplicateNameVariantConfig,
): DuplicateNameMatcher => {
  const firstNameVariants = variantLookupFor(config.firstNameVariants)
  const lastNameVariants = variantLookupFor(config.lastNameVariants)

  return {
    firstNamesMatch: (first, second) => {
      const firstTokens = firstNameTokens(first)
      const secondTokens = firstNameTokens(second)
      if (firstTokens.length === 0 || secondTokens.length === 0) return false

      const shorter = firstTokens.length <= secondTokens.length ? firstTokens : secondTokens
      const longer = firstTokens.length <= secondTokens.length ? secondTokens : firstTokens
      return matchingTokens(shorter, longer, firstNameVariants)
    },
    lastNamesMatch: (first, second) => equivalentName(first, second, lastNameVariants),
  }
}

export const duplicateNameMatcher = createDuplicateNameMatcher(
  parseDuplicateNameVariantConfig(parse(variantConfigSource)),
)
