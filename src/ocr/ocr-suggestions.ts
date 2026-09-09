import type {
  DateValue,
  FamilyTreeDocument,
  Gender,
  Person,
  PersonDraft,
  RelationshipType,
} from '../domain/types'
import { normalizePartialDate, parsePartialDate } from '../domain/life-date'
import { buildOcrSourceUrl } from './ocr-source-url'
import {
  PRIMARY_OCR_MODEL_ID,
  SUPPLEMENTAL_OCR_MODEL_ID,
  type OcrPage,
} from './ocr-file-adapter'

export type OcrSuggestionDirection = 'candidate-child' | 'candidate-parent' | 'spouse'

export interface OcrSuggestionSource {
  bookId: string
  bookLabel?: string | null
  pageId: string
  runId: string
  pageNumber: number
  modelId: string
  section: string | null
  path: string
}

export interface OcrSuggestionScoreBreakdown {
  name: number
  date: number
  gender: number
  relationship: number
  source: number
}

export interface OcrSuggestionEvidence {
  count: number
  sources: OcrSuggestionSource[]
}

export interface OcrSuggestion {
  id: string
  newPerson: PersonDraft
  existingPersonId: string
  relationshipType: RelationshipType
  direction: OcrSuggestionDirection
  reason: string
  score: number
  scoreBreakdown: OcrSuggestionScoreBreakdown
  scoreReasons: string[]
  ageReason?: string
  evidence: OcrSuggestionEvidence
  excerpt: string
  source: OcrSuggestionSource
  sourceUrl: string
}

export interface OcrPersonMatch {
  id: string
  personId: string
  matchedName: Pick<PersonDraft, 'firstName' | 'lastName'>
  reason: string
  score: number
  scoreBreakdown: OcrSuggestionScoreBreakdown
  scoreReasons: string[]
  excerpt: string
  source: OcrSuggestionSource
  sourceUrl: string
}

const STOP_WORDS = new Set([
  'apr',
  'april',
  'aprl',
  'aus',
  'aug',
  'august',
  'bemerkungen',
  'bestattet',
  'baur',
  'confirmirt',
  'copulirt',
  'd',
  'dec',
  'dez',
  'dezember',
  'der',
  'die',
  'das',
  'des',
  'dem',
  'den',
  'ein',
  'eine',
  'einer',
  'einem',
  'einen',
  'ehe',
  'ehefrau',
  'ehemann',
  'ehegatte',
  'ehegattin',
  'eltern',
  'feb',
  'februar',
  'fbr',
  'geb',
  'geboren',
  'geborene',
  'geborener',
  'gestorben',
  'fr',
  'frau',
  'getant',
  'getauft',
  'getanft',
  'h',
  'herr',
  'hr',
  'in',
  'ann',
  'ist',
  'jahr',
  'jan',
  'januar',
  'ian',
  'ibr',
  'iuni',
  'iuli',
  'juni',
  'juli',
  'knablein',
  'kinder',
  'kind',
  'kindlein',
  'konfirmirt',
  'mai',
  'maerz',
  'marz',
  'mar',
  'mann',
  'mit',
  'namen',
  'nach',
  'nov',
  'november',
  'nro',
  'nr',
  'okt',
  'oct',
  'oktober',
  'october',
  'präsident',
  'praesident',
  'samtliche',
  'sammtliche',
  'sämmtliche',
  'sämtliche',
  'sept',
  'spt',
  'september',
  'sohn',
  'sohnchen',
  'sohnlein',
  'sbi',
  'glilinge',
  'tadgeb',
  'tod',
  'todgeb',
  'todt',
  'todtgeb',
  'toch',
  'tochter',
  'tochterchen',
  'tochterlein',
  'und',
  'verheiratet',
  'von',
  'zu',
  'u',
  'v',
  'yb',
  'wittwer',
  'wittwe',
  'witwe',
])

const relevantSectionPrefixes = [
  'familienregister',
  'taufen',
  'heiraten',
  'begrabnisse',
  'begraebnisse',
]

const modelPriorityOf = (modelId: string) =>
  modelId === PRIMARY_OCR_MODEL_ID
    ? 0
    : modelId === SUPPLEMENTAL_OCR_MODEL_ID
      ? 1
      : 2

const sourceScoreOf = (modelId: string) =>
  modelPriorityOf(modelId) === 0 ? 10 : modelPriorityOf(modelId) === 1 ? 8 : 5

const normalizeOcrText = (value: string) =>
  value
    .normalize('NFKC')
    .replaceAll('ſ', 's')
    .replaceAll('А', 'A')
    .replaceAll('а', 'a')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const comparableText = (value: string) =>
  normalizeOcrText(value)
    .toLocaleLowerCase('de-DE')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('ß', 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizedSection = (value: string | null) =>
  comparableText(value ?? '').replace(/\s+/g, '')

const OCR_MONTHS = new Map<string, string>([
  ['jan', '01'],
  ['januar', '01'],
  ['ian', '01'],
  ['feb', '02'],
  ['febr', '02'],
  ['februar', '02'],
  ['fbr', '02'],
  ['mar', '03'],
  ['maerz', '03'],
  ['marz', '03'],
  ['mrz', '03'],
  ['apr', '04'],
  ['april', '04'],
  ['aprl', '04'],
  ['mai', '05'],
  ['may', '05'],
  ['jun', '06'],
  ['juni', '06'],
  ['iun', '06'],
  ['jul', '07'],
  ['juli', '07'],
  ['iuli', '07'],
  ['aug', '08'],
  ['august', '08'],
  ['7ber', '09'],
  ['7br', '09'],
  ['8ber', '10'],
  ['8br', '10'],
  ['9ber', '11'],
  ['9br', '11'],
  ['10ber', '12'],
  ['10br', '12'],
  ['sep', '09'],
  ['sept', '09'],
  ['september', '09'],
  ['spt', '09'],
  ['okt', '10'],
  ['oct', '10'],
  ['oktober', '10'],
  ['october', '10'],
  ['nov', '11'],
  ['november', '11'],
  ['novbr', '11'],
  ['dez', '12'],
  ['dezember', '12'],
  ['dec', '12'],
  ['december', '12'],
  ['dezbr', '12'],
  ['decbr', '12'],
])

const validDate = (year: string, month?: string, day?: string): DateValue | null => {
  const value = month === undefined
    ? year
    : day === undefined
      ? `${year}-${month}`
      : `${year}-${month}-${day.padStart(2, '0')}`

  const yearNumber = Number(year)
  const monthNumber = month === undefined ? null : Number(month)
  const dayNumber = day === undefined ? null : Number(day)
  if (
    !Number.isInteger(yearNumber) ||
    yearNumber < 1000 ||
    yearNumber > 2200 ||
    (monthNumber !== null && (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12)) ||
    (dayNumber !== null && (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31))
  ) {
    return null
  }

  return parsePartialDate(value) ? value : null
}

const dateFromMonthName = (monthName: string, year: string, day?: string) => {
  const month = OCR_MONTHS.get(comparableText(monthName))
  return month ? validDate(year, month, day) : null
}

const extractDateFromText = (value: string): DateValue | null => {
  const text = normalizeOcrText(value)
  const numericDate = text.match(/\b(?<day>\d{1,2})[./-](?<month>\d{1,2})[./-](?<year>\d{4})\b/u)
  if (numericDate?.groups) {
    const date = validDate(
      numericDate.groups.year ?? '',
      numericDate.groups.month?.padStart(2, '0'),
      numericDate.groups.day,
    )
    if (date) return date
  }

  const isoDate = text.match(/\b(?<year>\d{4})[./-](?<month>\d{1,2})[./-](?<day>\d{1,2})\b/u)
  if (isoDate?.groups) {
    const date = validDate(
      isoDate.groups.year ?? '',
      isoDate.groups.month?.padStart(2, '0'),
      isoDate.groups.day,
    )
    if (date) return date
  }

  const numericMonthDate = text.match(/\b(?<year>\d{4})[./-](?<month>\d{1,2})\b/u)
  if (numericMonthDate?.groups) {
    const date = validDate(
      numericMonthDate.groups.year ?? '',
      numericMonthDate.groups.month?.padStart(2, '0'),
    )
    if (date) return date
  }

  const namedFullDate = text.match(
    /\b(?<day>\d{1,2})\.?\s+(?<month>[\p{L}\p{N}]+)\s+(?<year>\d{4})\b/iu,
  )
  if (namedFullDate?.groups) {
    const date = dateFromMonthName(
      namedFullDate.groups.month ?? '',
      namedFullDate.groups.year ?? '',
      namedFullDate.groups.day,
    )
    if (date) return date
  }

  const namedMonthDate = text.match(/\b(?<month>[\p{L}\p{N}]+)\s+(?<year>\d{4})\b/iu)
  if (namedMonthDate?.groups) {
    const date = dateFromMonthName(
      namedMonthDate.groups.month ?? '',
      namedMonthDate.groups.year ?? '',
    )
    if (date) return date
  }

  const yearDate = text.match(/\b(?<year>\d{4})\b/u)
  return yearDate?.groups?.year ? validDate(yearDate.groups.year) : null
}

const isRelevantOcrSection = (section: string | null) => {
  const normalized = normalizedSection(section)
  return relevantSectionPrefixes.some((prefix) => normalized.startsWith(prefix))
}

const nameToken = (value: string) => {
  const cleaned = value.replace(/^[^\p{L}]+|[^\p{L}'’.-]+$/gu, '')
  if (!cleaned || /^\d+$/u.test(cleaned)) return null
  if (STOP_WORDS.has(comparableText(cleaned))) return null
  if (!/^[\p{L}][\p{L}'’.-]*$/u.test(cleaned)) return null
  return cleaned
}

const titleCaseToken = (value: string) => {
  const lower = value.toLocaleLowerCase('de-DE')
  return lower.replace(/(^|[-'’])\p{L}/gu, (letter) => letter.toLocaleUpperCase('de-DE'))
}

const extractName = (segment: string): Pick<PersonDraft, 'firstName' | 'lastName'> | null => {
  const tokens: string[] = []
  for (const rawToken of segment.split(/\s+/u)) {
    const candidate = nameToken(rawToken)
    if (!candidate) {
      if (tokens.length >= 2 && STOP_WORDS.has(comparableText(rawToken))) break
      continue
    }
    tokens.push(candidate)
    if (tokens.length === 4) break
  }

  if (tokens.length < 2 || tokens.length > 4) return null

  return {
    firstName: titleCaseToken(tokens[0] ?? ''),
    lastName: tokens.slice(1).map(titleCaseToken).join(' '),
  }
}

const extractNameList = (segment: string) =>
  segment
    .split(/\s+(?:und|oder)\s+|[,;]+/iu)
    .map((candidate) => extractName(candidate))
    .filter((candidate): candidate is Pick<PersonDraft, 'firstName' | 'lastName'> => Boolean(candidate))

const levenshteinDistance = (first: string, second: string) => {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index)
  for (let firstIndex = 0; firstIndex < first.length; firstIndex += 1) {
    const current = [firstIndex + 1]
    for (let secondIndex = 0; secondIndex < second.length; secondIndex += 1) {
      current.push(
        Math.min(
          (current[secondIndex] ?? Number.POSITIVE_INFINITY) + 1,
          (previous[secondIndex + 1] ?? Number.POSITIVE_INFINITY) + 1,
          (previous[secondIndex] ?? Number.POSITIVE_INFINITY) +
            (first[firstIndex] === second[secondIndex] ? 0 : 1),
        ),
      )
    }
    for (let index = 0; index < current.length; index += 1) {
      previous[index] = current[index] ?? Number.POSITIVE_INFINITY
    }
  }
  return previous[second.length] ?? Number.POSITIVE_INFINITY
}

const nameSimilarity = (ocrName: string, knownName: string, isLastName: boolean) => {
  const left = comparableText(ocrName)
  const right = comparableText(knownName)
  if (!left || !right) return null

  const distance = levenshteinDistance(left, right)
  const length = Math.max(left.length, right.length)
  const maxDistance = isLastName
    ? length <= 5 ? 1 : 2
    : length <= 4 ? 1 : 2
  if (distance > maxDistance) return null

  return 1 - distance / length
}

const nameScoreFor = (
  ocrName: Pick<PersonDraft, 'firstName' | 'lastName'>,
  person: Pick<PersonDraft, 'firstName' | 'lastName'>,
) => {
  const firstSimilarity = nameSimilarity(ocrName.firstName, person.firstName, false)
  const lastSimilarity = nameSimilarity(ocrName.lastName, person.lastName, true)
  if (firstSimilarity === null || lastSimilarity === null) return null
  return firstSimilarity * 15 + lastSimilarity * 20
}

const dateScoreFor = (ocrDate: DateValue | null, knownDate: DateValue | null) => {
  const ocrParts = parsePartialDate(ocrDate)
  const knownParts = parsePartialDate(knownDate)
  if (!ocrParts || !knownParts) return 0
  if (ocrParts.year !== knownParts.year) {
    return Math.abs(ocrParts.year - knownParts.year) === 1 ? 5 : 0
  }

  let score = 20
  if (ocrParts.month !== null && knownParts.month !== null && ocrParts.month === knownParts.month) {
    score += 10
  }
  if (ocrParts.day !== null && knownParts.day !== null && ocrParts.day === knownParts.day) {
    score += 5
  }
  return score
}

const namesFromText = (text: string) => {
  const rawTokens = text.split(/\s+/u)
  const nameWindows: Pick<PersonDraft, 'firstName' | 'lastName'>[] = []
  for (let index = 0; index < rawTokens.length - 1; index += 1) {
    const firstName = nameToken(rawTokens[index] ?? '')
    const lastName = nameToken(rawTokens[index + 1] ?? '')
    if (!firstName || !lastName) continue
    nameWindows.push({
      firstName: titleCaseToken(firstName),
      lastName: titleCaseToken(lastName),
    })
  }
  const candidates = [
    extractName(text),
    ...extractNameList(text),
    ...nameWindows,
    ...text
      .split(/[.;:\n,]+/u)
      .map((segment) => extractName(segment)),
  ].filter((candidate): candidate is Pick<PersonDraft, 'firstName' | 'lastName'> => Boolean(candidate))
  const unique = new Map<string, Pick<PersonDraft, 'firstName' | 'lastName'>>()
  for (const candidate of candidates) {
    unique.set(normalisedNameKey(candidate), candidate)
  }
  return [...unique.values()]
}

const MIN_KNOWN_NAME_SCORE = 22
const MIN_KNOWN_SCORE_GAP = 4

const datePrecisionScoreFor = (date: DateValue | null) => {
  const parts = parsePartialDate(date)
  if (!parts) return 0
  if (parts.day !== null) return 35
  if (parts.month !== null) return 30
  return 20
}

const extractNamedReferenceDate = (text: string, referenceText: string) => {
  const referenceNames = namesFromText(referenceText)
  if (referenceNames.length === 0) return null

  for (const line of text.split(/\r?\n/u)) {
    const lineNames = namesFromText(line)
    const hasReferenceName = referenceNames.some((referenceName) =>
      lineNames.some((lineName) => (nameScoreFor(referenceName, lineName) ?? 0) >= MIN_KNOWN_NAME_SCORE)
    )
    if (!hasReferenceName) continue
    const date = extractDateFromText(line)
    if (date) return date
  }

  return extractDateFromText(referenceText)
}

const candidateDateForMatch = (
  text: string,
  start: number,
  match: string,
  referenceText: string,
) => {
  const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1
  const previousLineStart = text.lastIndexOf('\n', Math.max(0, lineStart - 2)) + 1
  const currentDate = extractDateFromText(text.slice(lineStart, start + match.length))
  if (currentDate) return currentDate

  const previousLine = text.slice(previousLineStart, lineStart)
  if (extractNamedReferenceDate(previousLine, referenceText) !== null) return null
  return extractDateFromText(previousLine)
}

const findKnownPerson = (
  document: FamilyTreeDocument,
  text: string,
  ocrBirthYear: DateValue | null = null,
) => {
  const ocrNames = namesFromText(text)
  const ranked = document.persons
    .map((person, index) => {
      const nameScore = Math.max(
        ...ocrNames.map((ocrName) => nameScoreFor(ocrName, person) ?? Number.NEGATIVE_INFINITY),
      )
      return {
        person,
        index,
        nameScore,
        dateScore: dateScoreFor(ocrBirthYear, person.birthYear),
        score: nameScore + dateScoreFor(ocrBirthYear, person.birthYear),
      }
    })
    .filter(({ nameScore }) => nameScore >= MIN_KNOWN_NAME_SCORE)
    .sort((first, second) =>
      second.score - first.score ||
      second.nameScore - first.nameScore ||
      first.index - second.index,
    )

  const best = ranked[0]
  const next = ranked[1]
  if (!best || (next && best.score - next.score < MIN_KNOWN_SCORE_GAP)) return undefined
  if (ocrBirthYear !== null && best.person.birthYear !== null && best.dateScore === 0) {
    return undefined
  }
  return best.person
}

const genderForChildMarker = (marker: string): Gender | null => {
  const normalized = comparableText(marker)
  if (normalized.includes('sohn')) return 'man'
  if (normalized.includes('tochter')) return 'woman'
  return null
}

const genderForSpouseMarker = (marker: string): Gender | null => {
  const normalized = comparableText(marker)
  return normalized.includes('frau') || normalized.includes('gattin') ? 'woman' :
    normalized.includes('mann') || normalized === 'gatte' || normalized === 'ehegatte' ? 'man' : null
}

const normalisedNameKey = (person: Pick<PersonDraft, 'firstName' | 'lastName'>) =>
  comparableText(`${person.firstName} ${person.lastName}`)

const stableSuggestionId = (
  existingPersonId: string,
  relationshipType: RelationshipType,
  direction: OcrSuggestionDirection,
  person: Pick<PersonDraft, 'firstName' | 'lastName'> & { birthYear?: DateValue | null },
) => {
  const birthYear = person.birthYear === null || person.birthYear === undefined
    ? ''
    : String(person.birthYear)
  const value = `${existingPersonId}|${relationshipType}|${direction}|${normalisedNameKey(person)}|${birthYear}`
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16777619)
  }
  return `ocr-suggestion-${(hash >>> 0).toString(16)}`
}

const excerptFor = (match: string) => normalizeOcrText(match).slice(0, 280)

const sourceForPage = (page: OcrPage): OcrSuggestionSource => ({
  bookId: page.bookId,
  bookLabel: page.bookLabel,
  pageId: page.pageId,
  runId: page.runId,
  pageNumber: page.pageNumber,
  modelId: page.modelId,
  section: page.section,
  path: page.path,
})

const sourceUrlForPage = (page: OcrPage) => page.sourceUrl || buildOcrSourceUrl({
  bookId: page.bookId,
  pageId: page.pageId,
  runId: page.runId,
  pageNumber: page.pageNumber,
})

const displayMarker = (marker: string) => {
  const normalized = marker.toLocaleLowerCase('de-DE')
  return normalized.charAt(0).toLocaleUpperCase('de-DE') + normalized.slice(1)
}

const MIN_SUGGESTION_SCORE = 50

interface AgePlausibility {
  score: number
  reason: string
}

const birthYearOf = (date: DateValue | null) => parsePartialDate(date)?.year ?? null

const parentChildAgePlausibilityFor = (
  direction: OcrSuggestionDirection,
  candidateBirthYear: DateValue | null,
  existingBirthYear: DateValue | null,
): AgePlausibility | null => {
  const candidateYear = birthYearOf(candidateBirthYear)
  const existingYear = birthYearOf(existingBirthYear)
  if (candidateYear === null || existingYear === null) {
    return {
      score: 10,
      reason: 'Altersabstand: unbekannt',
    }
  }

  const ageGap = direction === 'candidate-parent'
    ? existingYear - candidateYear
    : candidateYear - existingYear
  if (ageGap < 12 || ageGap > 70) {
    return null
  }

  if (ageGap >= 20 && ageGap <= 45) {
    return {
      score: 10,
      reason: `Altersabstand: ${ageGap} Jahre, plausibel`,
    }
  }

  if ((ageGap >= 15 && ageGap <= 19) || (ageGap >= 46 && ageGap <= 60)) {
    return {
      score: 5,
      reason: `Altersabstand: ${ageGap} Jahre, außergewöhnlich`,
    }
  }

  return {
    score: 2,
    reason: `Altersabstand: ${ageGap} Jahre, sehr ungewöhnlich`,
  }
}

interface ScoreBreakdownResult {
  breakdown: OcrSuggestionScoreBreakdown
  ageReason: string | null
}

const scoreBreakdownFor = (
  existingPerson: Pick<FamilyTreeDocument['persons'][number], 'firstName' | 'lastName' | 'birthYear'>,
  existingCandidate: Pick<FamilyTreeDocument['persons'][number], 'firstName' | 'lastName' | 'birthYear'> | null,
  knownText: string,
  relationshipType: RelationshipType,
  gender: Gender | null,
  birthYear: DateValue | null,
  referenceBirthYear: DateValue | null,
  direction: OcrSuggestionDirection,
  modelId: string,
): ScoreBreakdownResult | null => {
  const agePlausibility = relationshipType === 'parent-child'
    ? parentChildAgePlausibilityFor(direction, birthYear, existingPerson.birthYear)
    : { score: 8, reason: null }
  if (!agePlausibility) return null

  return {
    breakdown: {
      name: Math.round(Math.min(
        35,
        Math.max(
          0,
          ...namesFromText(knownText).map((name) => nameScoreFor(name, existingPerson) ?? 0),
        ),
      )),
      date: referenceBirthYear === null
        ? existingCandidate
          ? dateScoreFor(birthYear, existingCandidate.birthYear)
          : datePrecisionScoreFor(birthYear)
        : dateScoreFor(referenceBirthYear, existingPerson.birthYear),
      gender: gender ? 10 : 0,
      relationship: agePlausibility.score,
      source: sourceScoreOf(modelId),
    },
    ageReason: agePlausibility.reason,
  }
}

const scoreReasonsFor = (
  breakdown: OcrSuggestionScoreBreakdown,
  ageReason: string | null = null,
) => [
  `Name: ${breakdown.name}/35`,
  `Datum: ${breakdown.date}/35`,
  `Geschlecht: ${breakdown.gender}/10`,
  `Beziehung: ${breakdown.relationship}/10`,
  `Quelle: ${breakdown.source}/10`,
  ...(ageReason ? [ageReason] : []),
]

const createSuggestion = (
  document: FamilyTreeDocument,
  page: OcrPage,
  match: string,
  candidate: Pick<PersonDraft, 'firstName' | 'lastName'>,
  existingPersonId: string,
  relationshipType: RelationshipType,
  direction: OcrSuggestionDirection,
  gender: Gender | null,
  reason: string,
  birthYear: DateValue | null = null,
  referenceBirthYear: DateValue | null = null,
  knownText = '',
): OcrSuggestion | null => {
  if (!candidate.firstName || !candidate.lastName) return null
  const existingPerson = document.persons.find((person) => person.id === existingPersonId)
  if (!existingPerson) return null
  const sameNamedPeople = document.persons.filter(
    (person) => normalisedNameKey(person) === normalisedNameKey(candidate),
  )
  const candidateBirthDate = normalizePartialDate(birthYear)
  if (
    sameNamedPeople.length > 0 &&
    (candidateBirthDate === null || sameNamedPeople.some(
      (person) => normalizePartialDate(person.birthYear) === candidateBirthDate,
    ))
  ) {
    return null
  }

  const existingCandidate = sameNamedPeople[0] ?? null

  const scoreBreakdown = scoreBreakdownFor(
    existingPerson,
    existingCandidate,
    knownText,
    relationshipType,
    gender,
    birthYear,
    referenceBirthYear,
    direction,
    page.modelId,
  )
  if (!scoreBreakdown) return null
  const score = Object.values(scoreBreakdown.breakdown).reduce((total, value) => total + value, 0)
  if (score < MIN_SUGGESTION_SCORE) return null
  const source = sourceForPage(page)

  return {
    id: stableSuggestionId(existingPersonId, relationshipType, direction, {
      ...candidate,
      birthYear,
    }),
    newPerson: {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      gender,
      birthYear,
      deathYear: null,
      position: null,
      comment: null,
    },
    existingPersonId,
    relationshipType,
    direction,
    reason,
    score,
    scoreBreakdown: scoreBreakdown.breakdown,
    scoreReasons: scoreReasonsFor(scoreBreakdown.breakdown, scoreBreakdown.ageReason),
    ageReason: scoreBreakdown.ageReason ?? undefined,
    evidence: { count: 1, sources: [source] },
    excerpt: excerptFor(match),
    source,
    sourceUrl: sourceUrlForPage(page),
  }
}

const childMarkerSource = '(?:(?:zwillings?)?(?:s(?:ö|o|oe)hn(?:lein|chen)?|t(?:ö|o|oe)chter(?:lein|chen)?|kind(?:lein|chen)?))'
const childConnectorSource = '(?:aus der Ehe von|des|der|vom|von|d\\.|v\\.)'

const parentChildPatterns = [
  new RegExp(
    `(?<candidate>[^.;:\\n]+?),?\\s+(?<marker>${childMarkerSource})(?:[,.])?\\s+(?<connector>${childConnectorSource})\\s+(?<parent>[^.;:\\n]+)`,
    'giu',
  ),
  new RegExp(
    `(?<marker>${childMarkerSource})\\s+(?<connector>${childConnectorSource})\\s+(?<parent>[^.;:\\n]+?)\\s*[:,;-]\\s*(?<candidate>[^.;:\\n]+)`,
    'giu',
  ),
]

const childrenPattern = new RegExp(
  `\\bKinder\\s+(?:des|der|von|vom|d\\.|v\\.)\\s+(?<parent>[^.;:\\n]+?)\\s*(?::|\\bsind\\b|\\bseien\\b)\\s*(?<children>[^.;:\\n]+)`,
  'giu',
)

const spouseMarkerSource = '(?:Ehefrau|Ehemann|Ehegatte(?:n|in)?|Gattin|Gatte|Ehrfrau|Ehfrau)'
const spouseRelationMarkerSource = '(?:verheiratet\\s+mit|Ehepartner(?:in)?|Ehegatte(?:n|in)?)'

const spousePatterns = [
  new RegExp(
    `(?<candidate>[^;:\\n]{1,120}),?\\s+(?<marker>${spouseMarkerSource})\\s+(?:von|des|der|d\\.|v\\.)\\s+(?<spouse>[^.;:\\n]+)`,
    'giu',
  ),
  new RegExp(
    `(?<spouse>[^.;:\\n]+?),?\\s+(?<marker>${spouseRelationMarkerSource})\\s+(?<candidate>[^.;:\\n]+)`,
    'giu',
  ),
]

const birthNamePattern = /\b(?:geb\.|geboren(?:e|er)?|Geburtsname)\s+(?<birthName>[^.;:,\n]+)/giu

const familyChildrenHeadingPattern = /(?:s[äa]mmtliche|s[äa]mtliche|saemtliche)\s+kinder\b/iu
const familyStatusPattern = /^(?:geboren|confirmirt|konfirmirt|copulirt|gestorben|bemerkungen)\b/iu

const normalizedOcrLines = (value: string) =>
  value
    .normalize('NFKC')
    .replaceAll('ſ', 's')
    .replaceAll('А', 'A')
    .replaceAll('а', 'a')
    .split(/\r?\n/u)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

const nameTokensFrom = (segment: string) =>
  segment
    .split(/\s+/u)
    .map((rawToken) => {
      if (/\d/u.test(rawToken)) return null
      const token = nameToken(rawToken.replace(/[.,]+$/u, ''))
      return token && !token.includes('.') ? token : null
    })
    .filter((token): token is string => Boolean(token))

const extractFamilyName = (
  line: string,
  familyName: string,
): Pick<PersonDraft, 'firstName' | 'lastName'> | null => {
  if (familyStatusPattern.test(line)) return null
  if (/(?:tadgeb|todt?geb|knäblein|knablein|sahelei|töch(?:ter)?lein)/iu.test(line)) return null
  const tokens = nameTokensFrom(line)
  if (tokens.length === 0 || tokens.length > 4) return null
  if (tokens.some((token) => token.replace(/[.'’_-]/gu, '').length < 3)) return null

  const familyNameKey = comparableText(familyName)
  const hasFamilyName = comparableText(tokens.at(-1) ?? '') === familyNameKey
  const firstNameTokens = hasFamilyName ? tokens.slice(0, -1) : tokens
  if (firstNameTokens.length === 0) return null

  return {
    firstName: firstNameTokens.map(titleCaseToken).join(' '),
    lastName: hasFamilyName
      ? titleCaseToken(tokens.at(-1) ?? '')
      : titleCaseToken(familyName),
  }
}

interface FamilyRegisterMatch {
  candidate: Pick<PersonDraft, 'firstName' | 'lastName'>
  knownPersonId: string
  match: string
  birthYear: DateValue | null
}

const nearestKnownPersonBefore = (
  document: FamilyTreeDocument,
  lines: readonly string[],
  start: number,
) => {
  const contextStart = Math.max(0, start - 64)
  for (let index = start - 1; index >= contextStart; index -= 1) {
    const knownPerson = findKnownPerson(document, lines[index] ?? '')
    if (knownPerson) return knownPerson
  }

  return findKnownPerson(document, lines.slice(contextStart, start).join(' '))
}

const familyRegisterMatches = (
  document: FamilyTreeDocument,
  text: string,
): FamilyRegisterMatch[] => {
  const lines = normalizedOcrLines(text)
  const matches: FamilyRegisterMatch[] = []

  for (const [headingIndex, heading] of lines.entries()) {
    if (!familyChildrenHeadingPattern.test(heading)) continue

    const nameHeadingIndex = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line, index }) => index < headingIndex && /^namen\b/iu.test(line))
      .at(-1)?.index
    const candidateStart = nameHeadingIndex === undefined
      ? Math.max(0, headingIndex - 10)
      : nameHeadingIndex + 1
    const knownPerson = nearestKnownPersonBefore(document, lines, candidateStart)
    if (!knownPerson) continue

    for (const line of lines.slice(candidateStart, headingIndex)) {
      const candidate = extractFamilyName(line, knownPerson.lastName)
      if (!candidate) continue
      matches.push({
        candidate,
        knownPersonId: knownPerson.id,
        match: `${line} ${heading}`,
        birthYear: extractDateFromText(`${line} ${heading}`),
      })
    }
  }

  return matches
}

const createChildReason = (marker: string, candidate: Pick<PersonDraft, 'firstName' | 'lastName'>, parent: string) =>
  `OCR-Muster „${displayMarker(marker)}“ verbindet ${candidate.firstName} ${candidate.lastName} mit ${parent}.`

const createSpouseReason = (
  marker: string,
  candidate: Pick<PersonDraft, 'firstName' | 'lastName'>,
  spouse: string,
  hasBirthName: boolean,
) =>
  `OCR-Muster „${displayMarker(marker)}“${hasBirthName ? ' mit Geburtsname' : ''} verbindet ${
    candidate.firstName
  } ${candidate.lastName} mit ${spouse}.`

const oppositeGender = (gender: Gender | null): Gender | null =>
  gender === 'woman' ? 'man' : gender === 'man' ? 'woman' : null

const createParentReason = (
  marker: string,
  candidate: Pick<PersonDraft, 'firstName' | 'lastName'>,
  child: string,
) =>
  `OCR-Muster „${displayMarker(marker)}“ verbindet ${candidate.firstName} ${candidate.lastName} als Elternteil mit ${child}.`

export const detectOcrSuggestions = (
  document: FamilyTreeDocument,
  pages: readonly OcrPage[],
): OcrSuggestion[] => {
  const suggestions: OcrSuggestion[] = []

  const addCandidate = (
    page: OcrPage,
    match: string,
    candidate: Pick<PersonDraft, 'firstName' | 'lastName'> | null,
    knownText: string,
    relationshipType: RelationshipType,
    direction: OcrSuggestionDirection,
    gender: Gender | null,
    reason: string,
    birthYear: DateValue | null = null,
    referenceBirthYear: DateValue | null = null,
  ) => {
    if (!candidate) return
    const knownPerson = findKnownPerson(document, knownText, referenceBirthYear)
    if (!knownPerson) return
    const suggestion = createSuggestion(
      document,
      page,
      match,
      candidate,
      knownPerson.id,
      relationshipType,
      direction,
      gender,
      reason,
      birthYear,
      referenceBirthYear,
      knownText,
    )
    if (suggestion) suggestions.push(suggestion)
  }

  for (const page of pages) {
    if (!isRelevantOcrSection(page.section)) continue
    const lines = normalizedOcrLines(page.text)
    const textWindows = lines.map((_, start) =>
      lines.slice(Math.max(0, start - 1), start + 3).join('\n'),
    )

    for (const familyMatch of familyRegisterMatches(document, page.text)) {
      const knownPerson = document.persons.find((person) => person.id === familyMatch.knownPersonId)
      if (!knownPerson) continue
      const parentLabel = `${knownPerson.firstName} ${knownPerson.lastName}`
      addCandidate(
        page,
        familyMatch.match,
        familyMatch.candidate,
        parentLabel,
        'parent-child',
        'candidate-child',
        null,
        `OCR-Muster „Sämtliche Kinder“ im Familienregister verbindet ${familyMatch.candidate.firstName} ${familyMatch.candidate.lastName} mit ${parentLabel}.`,
        familyMatch.birthYear,
      )
    }

    for (const text of textWindows) {
      for (const pattern of parentChildPatterns) {
        for (const match of text.matchAll(pattern)) {
          const groups = match.groups
          if (!groups) continue
          const candidate = extractName(groups.candidate ?? '')
          const marker = groups.marker ?? 'Kind'
          const parentText = groups.parent ?? ''
          const birthYear = candidateDateForMatch(
            text,
            match.index ?? 0,
            match[0],
            parentText,
          )
          const referenceBirthYear = extractNamedReferenceDate(text, parentText)
          addCandidate(
            page,
            match[0],
            candidate,
            parentText,
            'parent-child',
            'candidate-child',
            genderForChildMarker(marker),
            createChildReason(marker, candidate ?? { firstName: '', lastName: '' }, parentText.trim()),
            birthYear,
            referenceBirthYear,
          )

          const knownChildBirthYear = extractNamedReferenceDate(text, groups.candidate ?? '')
          const knownChild = findKnownPerson(document, groups.candidate ?? '', knownChildBirthYear)
          const parentCandidate = extractName(parentText)
          const candidateParentBirthYear = extractNamedReferenceDate(text, parentText)
          if (knownChild && parentCandidate) {
            addCandidate(
              page,
              match[0],
              parentCandidate,
              groups.candidate ?? '',
              'parent-child',
              'candidate-parent',
              null,
              createParentReason(
                marker,
                parentCandidate,
                `${knownChild.firstName} ${knownChild.lastName}`,
              ),
              candidateParentBirthYear,
              knownChildBirthYear,
            )
          }
        }
      }

      for (const match of text.matchAll(childrenPattern)) {
        const groups = match.groups
        if (!groups) continue
        const parentText = groups.parent ?? ''
        const birthYear = candidateDateForMatch(
          text,
          match.index ?? 0,
          match[0],
          parentText,
        )
        const referenceBirthYear = extractNamedReferenceDate(text, parentText)
        for (const candidate of extractNameList(groups.children ?? '')) {
          addCandidate(
            page,
            match[0],
            candidate,
            parentText,
            'parent-child',
            'candidate-child',
            null,
            createChildReason('Kinder', candidate, parentText.trim()),
            birthYear,
            referenceBirthYear,
          )
        }
      }

      for (const pattern of spousePatterns) {
        for (const match of text.matchAll(pattern)) {
          const groups = match.groups
          if (!groups) continue
          const candidate = extractName(groups.candidate ?? '')
          const marker = groups.marker ?? 'verheiratet mit'
          const spouseText = groups.spouse ?? ''
          const hasBirthName = /\b(?:geb\.|geboren(?:e|er)?|Geburtsname)/iu.test(match[0])
          const birthYear = candidateDateForMatch(
            text,
            match.index ?? 0,
            match[0],
            spouseText,
          )
          const referenceBirthYear = extractNamedReferenceDate(text, spouseText)
          addCandidate(
            page,
            match[0],
            candidate,
            spouseText,
            'marriage',
            'spouse',
            genderForSpouseMarker(marker),
            createSpouseReason(
              marker,
              candidate ?? { firstName: '', lastName: '' },
              spouseText.trim(),
              hasBirthName,
            ),
            birthYear,
            referenceBirthYear,
          )

          const knownCandidateBirthYear = extractNamedReferenceDate(text, groups.candidate ?? '')
          const knownCandidate = findKnownPerson(document, groups.candidate ?? '', knownCandidateBirthYear)
          const spouseCandidate = extractName(spouseText)
          if (knownCandidate && spouseCandidate) {
            addCandidate(
              page,
              match[0],
              spouseCandidate,
              groups.candidate ?? '',
              'marriage',
              'spouse',
              oppositeGender(genderForSpouseMarker(marker)),
              createSpouseReason(
                marker,
                spouseCandidate,
                `${knownCandidate.firstName} ${knownCandidate.lastName}`,
                hasBirthName,
              ),
              null,
              knownCandidateBirthYear,
            )
          }
        }
      }

      for (const match of text.matchAll(birthNamePattern)) {
        const groups = match.groups
        if (!groups) continue
        const precedingText = text.slice(0, match.index ?? 0).split(/[.;:\n]/u).at(-1) ?? ''
        const candidate = extractName(precedingText)
        const knownPerson = findKnownPerson(document, groups.birthName ?? '')
        if (!candidate || !knownPerson) continue
        addCandidate(
          page,
          match[0],
          candidate,
          groups.birthName ?? '',
          'marriage',
          'spouse',
          null,
          createSpouseReason('Geburtsname', candidate, `${knownPerson.firstName} ${knownPerson.lastName}`, true),
        )
      }
    }
  }

  const compareSources = (first: OcrSuggestionSource, second: OcrSuggestionSource) =>
    modelPriorityOf(first.modelId) - modelPriorityOf(second.modelId) ||
    first.pageNumber - second.pageNumber ||
    first.pageId.localeCompare(second.pageId) ||
    first.runId.localeCompare(second.runId)

  const sourceKey = (source: OcrSuggestionSource) =>
    `${source.bookId}|${source.pageId}|${source.runId}|${source.modelId}`

  const mergeSuggestions = (first: OcrSuggestion, second: OcrSuggestion): OcrSuggestion => {
    const preferred = compareSources(first.source, second.source) <= 0 ? first : second
    const evidenceCount = first.evidence.count + second.evidence.count
    const sourceMap = new Map<string, OcrSuggestionSource>()
    for (const source of [...first.evidence.sources, ...second.evidence.sources]) {
      sourceMap.set(sourceKey(source), source)
    }
    const scoreBreakdown: OcrSuggestionScoreBreakdown = {
      name: Math.max(first.scoreBreakdown.name, second.scoreBreakdown.name),
      date: Math.max(first.scoreBreakdown.date, second.scoreBreakdown.date),
      gender: Math.max(first.scoreBreakdown.gender, second.scoreBreakdown.gender),
      relationship: Math.max(first.scoreBreakdown.relationship, second.scoreBreakdown.relationship),
      source: Math.min(
        10,
        sourceScoreOf(preferred.source.modelId) + Math.min(2, Math.max(0, evidenceCount - 1)),
      ),
    }
    const ageReason = first.scoreBreakdown.relationship >= second.scoreBreakdown.relationship
      ? first.ageReason ?? second.ageReason ?? null
      : second.ageReason ?? first.ageReason ?? null
    const score = Object.values(scoreBreakdown).reduce((total, value) => total + value, 0)

    return {
      ...preferred,
      score,
      scoreBreakdown,
      scoreReasons: [...scoreReasonsFor(scoreBreakdown, ageReason), `Belege: ${evidenceCount}`],
      ageReason: ageReason ?? undefined,
      evidence: {
        count: evidenceCount,
        sources: [...sourceMap.values()].sort(compareSources),
      },
    }
  }

  const uniqueSuggestions = new Map<string, OcrSuggestion>()
  for (const suggestion of suggestions) {
    const current = uniqueSuggestions.get(suggestion.id)
    uniqueSuggestions.set(
      suggestion.id,
      current ? mergeSuggestions(current, suggestion) : suggestion,
    )
  }

  return [...uniqueSuggestions.values()].sort(
    (first, second) =>
      second.score - first.score ||
      normalisedNameKey(first.newPerson).localeCompare(normalisedNameKey(second.newPerson), 'de') ||
      first.id.localeCompare(second.id),
  )
}

const stablePersonMatchId = (
  personId: string,
  page: OcrPage,
  lineIndex: number,
  matchedName: Pick<PersonDraft, 'firstName' | 'lastName'>,
) => {
  const value = `${personId}|${page.bookId}|${page.pageId}|${page.runId}|${lineIndex}|${normalisedNameKey(matchedName)}`
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16777619)
  }
  return `ocr-person-match-${(hash >>> 0).toString(16)}`
}

const relationshipContextFor = (text: string) => {
  const normalized = comparableText(text)
  if (/(?:sohn|tochter|kind)/u.test(normalized)) {
    return {
      relationship: 10,
      gender: genderForChildMarker(text),
      label: 'Eltern-Kind-Kontext',
    }
  }
  if (/(?:ehefrau|ehemann|ehegatte|gattin|gatte|verheiratet|ehepartner)/u.test(normalized)) {
    return {
      relationship: 8,
      gender: genderForSpouseMarker(text),
      label: 'Ehe-Kontext',
    }
  }
  return {
    relationship: 0,
    gender: null,
    label: null,
  }
}

const nearbyDateForLine = (lines: readonly string[], lineIndex: number) =>
  extractDateFromText(lines[lineIndex] ?? '') ??
  extractDateFromText(lines[lineIndex - 1] ?? '') ??
  extractDateFromText(lines[lineIndex + 1] ?? '')

export const findOcrPersonMatches = (
  person: Person,
  pages: readonly OcrPage[],
): OcrPersonMatch[] => {
  const rankedMatches: Array<{ match: OcrPersonMatch; lineIndex: number }> = []

  for (const page of pages) {
    const lines = normalizedOcrLines(page.text)
    for (const [lineIndex, line] of lines.entries()) {
      const bestName = namesFromText(line)
        .map((matchedName) => ({
          matchedName,
          score: nameScoreFor(matchedName, person),
        }))
        .filter((candidate): candidate is {
          matchedName: Pick<PersonDraft, 'firstName' | 'lastName'>
          score: number
        } => candidate.score !== null && candidate.score >= MIN_KNOWN_NAME_SCORE)
        .sort((first, second) => second.score - first.score)[0]
      if (!bestName) continue

      const context = relationshipContextFor(line)
      const gender = context.gender !== null && context.gender === person.gender ? 10 : 0
      const scoreBreakdown: OcrSuggestionScoreBreakdown = {
        name: Math.round(Math.min(35, bestName.score)),
        date: dateScoreFor(nearbyDateForLine(lines, lineIndex), person.birthYear),
        gender,
        relationship: context.relationship,
        source: sourceScoreOf(page.modelId),
      }
      const source = sourceForPage(page)
      const matchedNameLabel = `${bestName.matchedName.firstName} ${bestName.matchedName.lastName}`
      const personLabel = `${person.firstName} ${person.lastName}`
      const reason = `OCR-Name „${matchedNameLabel}“ passt zu ${personLabel}.`
      const ageReason = context.label ? `Kontext: ${context.label}` : null
      const score = Object.values(scoreBreakdown).reduce((total, value) => total + value, 0)
      const scoreReasons = [
        ...scoreReasonsFor(scoreBreakdown),
        ...(ageReason ? [ageReason] : []),
      ]

      rankedMatches.push({
        lineIndex,
        match: {
          id: stablePersonMatchId(person.id, page, lineIndex, bestName.matchedName),
          personId: person.id,
          matchedName: bestName.matchedName,
          reason,
          score,
          scoreBreakdown,
          scoreReasons,
          excerpt: excerptFor(line),
          source,
          sourceUrl: sourceUrlForPage(page),
        },
      })
    }
  }

  return rankedMatches
    .sort((first, second) =>
      second.match.score - first.match.score ||
      first.match.source.pageNumber - second.match.source.pageNumber ||
      first.match.source.pageId.localeCompare(second.match.source.pageId) ||
      first.lineIndex - second.lineIndex ||
      first.match.id.localeCompare(second.match.id),
    )
    .map(({ match }) => match)
}
