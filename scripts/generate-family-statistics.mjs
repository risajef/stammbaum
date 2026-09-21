import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse } from 'yaml'

const usage = [
  'Verwendung: node scripts/generate-family-statistics.mjs <stammbaum.yaml>',
  '  [--output familien-statistik.html] [--as-of YYYY-MM-DD]',
].join('\n')

const partialDatePattern = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/

const asRecord = (value) => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null
)

const datePartsOf = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
      day: value.getUTCDate(),
    }
  }

  if (value === null || value === undefined) return null

  const normalized = typeof value === 'number'
    ? (Number.isInteger(value) ? String(value).padStart(4, '0') : String(value))
    : String(value).trim()
  const match = normalized.match(partialDatePattern)
  if (!match) return null

  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) : null
  const day = match[3] ? Number(match[3]) : null
  if (month !== null && (month < 1 || month > 12)) return null
  if (day !== null && (month === null || day < 1 || day > 31)) return null

  return { year, month, day }
}

const dateIsApproximate = (parts) => parts.month === null || parts.day === null

const dateFraction = (parts) => (
  parts.year + ((parts.month ?? 1) - 1) / 12 + ((parts.day ?? 1) - 1) / 365
)

const roundedToOneDecimal = (value) => Math.round(value * 10) / 10

const ageInYears = (birthValue, endValue) => {
  const birth = datePartsOf(birthValue)
  const end = datePartsOf(endValue)
  if (!birth || !end) return null

  let age = end.year - birth.year
  if (
    birth.month !== null &&
    end.month !== null &&
    (end.month < birth.month ||
      (end.month === birth.month && birth.day !== null && end.day !== null && end.day < birth.day))
  ) {
    age -= 1
  }

  return age >= 0 ? age : null
}

const yearsBetween = (firstValue, secondValue) => {
  const first = datePartsOf(firstValue)
  const second = datePartsOf(secondValue)
  if (!first || !second) return null

  const years = dateFraction(second) - dateFraction(first)
  return years >= 0 ? roundedToOneDecimal(years) : null
}

const isoDateToday = () => new Date().toISOString().slice(0, 10)

const validDocument = (document) => {
  if (!asRecord(document) || !Array.isArray(document.persons) || !Array.isArray(document.relationships)) {
    throw new Error('Die YAML-Datei muss persons und relationships als Listen enthalten.')
  }
  return document
}

const childrenByParentFor = (document, personsById) => {
  const childrenByParent = new Map(
    document.persons.map((person) => [person.id, new Set()]),
  )

  for (const relationship of document.relationships) {
    if (
      relationship?.type !== 'parent-child' ||
      !personsById.has(relationship.fromId) ||
      !personsById.has(relationship.toId)
    ) continue

    childrenByParent.get(relationship.fromId).add(relationship.toId)
  }

  return childrenByParent
}

const commonChildrenCount = (firstId, secondId, childrenByParent) => {
  const firstChildren = childrenByParent.get(firstId) ?? new Set()
  const secondChildren = childrenByParent.get(secondId) ?? new Set()
  let count = 0

  for (const childId of firstChildren) {
    if (secondChildren.has(childId)) count += 1
  }

  return count
}

const personAgesFor = (document) => {
  const observations = []

  for (const person of document.persons) {
    const birth = datePartsOf(person.birthYear)
    const death = datePartsOf(person.deathYear)
    if (!birth || !death) continue

    const age = ageInYears(person.birthYear, person.deathYear)
    if (age === null) continue

    observations.push({
      personId: person.id,
      age,
      approximate: dateIsApproximate(birth) || dateIsApproximate(death),
      endpoint: 'death',
    })
  }

  return observations
}

const marriageAgesFor = (document, personsById, childrenByParent) => {
  const observations = []

  for (const relationship of document.relationships) {
    if (relationship?.type !== 'marriage') continue

    const firstPerson = personsById.get(relationship.fromId)
    const secondPerson = personsById.get(relationship.toId)
    const start = datePartsOf(relationship.startDate)
    if (!firstPerson || !secondPerson || !start) continue

    const children = commonChildrenCount(
      firstPerson.id,
      secondPerson.id,
      childrenByParent,
    )

    for (const person of [firstPerson, secondPerson]) {
      const birth = datePartsOf(person.birthYear)
      const age = ageInYears(person.birthYear, relationship.startDate)
      if (!birth || age === null) continue

      observations.push({
        marriageId: relationship.id,
        personId: person.id,
        age,
        children,
        approximate: dateIsApproximate(birth) || dateIsApproximate(start),
      })
    }
  }

  return observations
}

const remarriageGapsFor = (document, personsById) => {
  const marriagesByPerson = new Map(
    document.persons.map((person) => [person.id, []]),
  )

  for (const relationship of document.relationships) {
    if (relationship?.type !== 'marriage' || !datePartsOf(relationship.startDate)) continue

    for (const personId of [relationship.fromId, relationship.toId]) {
      if (!personsById.has(personId)) continue
      marriagesByPerson.get(personId).push({
        marriageId: relationship.id,
        partnerId: personId === relationship.fromId ? relationship.toId : relationship.fromId,
        startDate: relationship.startDate,
        approximate: dateIsApproximate(datePartsOf(relationship.startDate)),
      })
    }
  }

  const observations = []
  for (const [personId, marriages] of marriagesByPerson) {
    marriages.sort((first, second) => dateFraction(datePartsOf(first.startDate)) - dateFraction(datePartsOf(second.startDate)))

    for (let index = 1; index < marriages.length; index += 1) {
      const previous = marriages[index - 1]
      const current = marriages[index]
      const previousPartner = personsById.get(previous.partnerId)
      const previousPartnerDeathDate = previousPartner?.deathYear
      const previousPartnerDeath = datePartsOf(previousPartnerDeathDate)
      if (!previousPartnerDeath) continue

      const years = yearsBetween(previousPartnerDeathDate, current.startDate)
      if (years === null) continue

      observations.push({
        personId,
        previousMarriageId: previous.marriageId,
        previousPartnerId: previous.partnerId,
        nextMarriageId: current.marriageId,
        years,
        approximate: previous.approximate || current.approximate || dateIsApproximate(previousPartnerDeath),
      })
    }
  }

  return observations
}

export const buildStatistics = (inputDocument, options = {}) => {
  const document = validDocument(inputDocument)
  const asOf = options.asOf ?? isoDateToday()
  const asOfParts = datePartsOf(asOf)
  if (!asOfParts) throw new Error(`Ungültiges Auswertungsdatum: ${asOf}`)

  const personsById = new Map(document.persons.map((person) => [person.id, person]))
  const childrenByParent = childrenByParentFor(document, personsById)

  return {
    asOf,
    personCount: document.persons.length,
    marriageCount: document.relationships.filter((relationship) => relationship?.type === 'marriage').length,
    personAges: personAgesFor(document),
    marriageAges: marriageAgesFor(document, personsById, childrenByParent),
    remarriageGaps: remarriageGapsFor(document, personsById),
  }
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const bucketStartFor = (value, binSize) => Math.floor(value / binSize) * binSize

const histogramBuckets = (values, binSize) => {
  const buckets = new Map()
  for (const value of values) {
    if (!Number.isFinite(value)) continue
    const start = bucketStartFor(value, binSize)
    buckets.set(start, (buckets.get(start) ?? 0) + 1)
  }

  return [...buckets.entries()]
    .sort(([first], [second]) => first - second)
    .map(([start, count]) => ({ start, count }))
}

const chartFrame = (title, content, note = '') => `
  <section class="chart-card">
    <h2>${escapeHtml(title)}</h2>
    ${content}
    ${note ? `<p class="chart-note">${escapeHtml(note)}</p>` : ''}
  </section>`

const emptyChart = '  <p class="empty-chart">Keine ausreichenden Datumsangaben für diese Auswertung.</p>'

const renderHistogramSvg = (values, {
  binSize,
  color,
  xLabel,
}) => {
  const buckets = histogramBuckets(values, binSize)
  if (buckets.length === 0) return emptyChart

  const width = 900
  const height = 360
  const margin = { top: 22, right: 24, bottom: 58, left: 52 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1)
  const barWidth = plotWidth / buckets.length
  const yFor = (count) => margin.top + plotHeight - (count / maxCount) * plotHeight
  const labelY = height - margin.bottom + 18
  const yTicks = [...new Set([0, Math.ceil(maxCount / 2), maxCount])]

  const grid = yTicks.map((tick) => `
    <line x1="${margin.left}" x2="${width - margin.right}" y1="${yFor(tick)}" y2="${yFor(tick)}" class="grid-line" />
    <text x="${margin.left - 10}" y="${yFor(tick) + 4}" text-anchor="end" class="axis-label">${tick}</text>`).join('')
  const bars = buckets.map((bucket, index) => {
    const x = margin.left + index * barWidth + 2
    const y = yFor(bucket.count)
    const barHeight = plotHeight - (y - margin.top)
    return `
      <rect x="${x}" y="${y}" width="${Math.max(1, barWidth - 4)}" height="${barHeight}" rx="3" fill="${color}" />
      <text x="${x + Math.max(1, barWidth - 4) / 2}" y="${labelY}" transform="rotate(-90 ${x + Math.max(1, barWidth - 4) / 2} ${labelY})" text-anchor="start" class="axis-label">${bucket.start}–${bucket.start + binSize - 1}</text>`
  }).join('')

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Histogramm">
    ${grid}
    <line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}" class="axis-line" />
    <line x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}" class="axis-line" />
    ${bars}
    <text x="${width / 2}" y="${height - 10}" text-anchor="middle" class="axis-title">${escapeHtml(xLabel)}</text>
    <text x="16" y="${height / 2}" text-anchor="middle" transform="rotate(-90 16 ${height / 2})" class="axis-title">Anzahl</text>
  </svg>`
}

const renderGroupedHistogramSvg = (observations, binSize) => {
  if (observations.length === 0) return emptyChart

  const groups = [...new Set(observations.map((entry) => entry.children))].sort((first, second) => first - second)
  const bins = [...new Set(observations.map((entry) => bucketStartFor(entry.age, binSize)))].sort((first, second) => first - second)
  const counts = new Map()
  for (const bin of bins) {
    counts.set(bin, new Map(groups.map((group) => [group, 0])))
  }
  for (const observation of observations) {
    const bin = bucketStartFor(observation.age, binSize)
    const groupCounts = counts.get(bin)
    groupCounts.set(observation.children, groupCounts.get(observation.children) + 1)
  }

  const width = 900
  const height = 410
  const margin = { top: 22, right: 24, bottom: 82, left: 52 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const maxCount = Math.max(...bins.map((bin) => [...counts.get(bin).values()].reduce((sum, count) => sum + count, 0)), 1)
  const barWidth = plotWidth / bins.length
  const yFor = (count) => margin.top + plotHeight - (count / maxCount) * plotHeight
  const palette = ['#2563eb', '#0f766e', '#d97706', '#be123c', '#7c3aed', '#4d7c0f', '#c2410c', '#0891b2']
  const yTicks = [...new Set([0, Math.ceil(maxCount / 2), maxCount])]
  const labelY = height - margin.bottom + 18

  const grid = yTicks.map((tick) => `
    <line x1="${margin.left}" x2="${width - margin.right}" y1="${yFor(tick)}" y2="${yFor(tick)}" class="grid-line" />
    <text x="${margin.left - 10}" y="${yFor(tick) + 4}" text-anchor="end" class="axis-label">${tick}</text>`).join('')
  const bars = bins.map((bin, binIndex) => {
    const x = margin.left + binIndex * barWidth + 2
    let accumulated = 0
    const segments = groups.map((group, groupIndex) => {
      const count = counts.get(bin).get(group)
      const y = yFor(accumulated + count)
      const segmentHeight = (count / maxCount) * plotHeight
      accumulated += count
      if (count === 0) return ''
      return `<rect x="${x}" y="${y}" width="${Math.max(1, barWidth - 4)}" height="${segmentHeight}" fill="${palette[groupIndex % palette.length]}" />`
    }).join('')

    return `${segments}
      <text x="${x + Math.max(1, barWidth - 4) / 2}" y="${labelY}" transform="rotate(-90 ${x + Math.max(1, barWidth - 4) / 2} ${labelY})" text-anchor="start" class="axis-label">${bin}–${bin + binSize - 1}</text>`
  }).join('')
  const legend = groups.map((group, index) => `
    <span class="legend-item"><i style="background:${palette[index % palette.length]}"></i>${group} ${group === 1 ? 'Kind' : 'Kinder'}</span>`).join('')

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Histogramm">
    ${grid}
    <line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}" class="axis-line" />
    <line x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}" class="axis-line" />
    ${bars}
    <text x="${width / 2}" y="${height - 10}" text-anchor="middle" class="axis-title">Alter bei der Heirat (Jahre)</text>
    <text x="16" y="${height / 2}" text-anchor="middle" transform="rotate(-90 16 ${height / 2})" class="axis-title">Anzahl Personen</text>
  </svg>
  <div class="legend">${legend}</div>`
}

export const generateStatisticsHtml = (statistics, options = {}) => {
  const title = options.title ?? 'Familienstatistik'
  const approximateAgeCount = statistics.personAges.filter((entry) => entry.approximate).length
  const approximateMarriageCount = statistics.marriageAges.filter((entry) => entry.approximate).length
  const approximateGapCount = statistics.remarriageGaps.filter((entry) => entry.approximate).length

  const personAgeChart = renderHistogramSvg(
    statistics.personAges.map((entry) => entry.age),
    { binSize: 5, color: '#2563eb', xLabel: 'Alter (5-Jahres-Gruppen)' },
  )
  const marriageAgeChart = renderGroupedHistogramSvg(statistics.marriageAges, 5)
  const remarriageChart = renderHistogramSvg(
    statistics.remarriageGaps.map((entry) => entry.years),
    { binSize: 5, color: '#be123c', xLabel: 'Jahre zwischen Eheschließungen (5-Jahres-Gruppen)' },
  )

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #172033; background: #f4f6f8; }
      body { margin: 0; }
      main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 48px; }
      h1 { margin: 0 0 8px; font-size: clamp(1.8rem, 4vw, 2.8rem); }
      h2 { margin: 0 0 14px; font-size: 1.15rem; }
      .intro { color: #536174; margin: 0 0 22px; }
      .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 0 0 18px; }
      .summary-card, .chart-card { background: white; border: 1px solid #d9e0e8; border-radius: 14px; box-shadow: 0 6px 18px #1522380b; }
      .summary-card { padding: 14px 16px; }
      .summary-card strong { display: block; font-size: 1.6rem; }
      .summary-card span { color: #536174; font-size: .82rem; }
      .chart-card { padding: 18px 18px 14px; margin-top: 16px; overflow: hidden; }
      svg { display: block; width: 100%; min-height: 250px; }
      .grid-line { stroke: #e7ebf0; stroke-width: 1; }
      .axis-line { stroke: #8a96a6; stroke-width: 1.2; }
      .axis-label { fill: #536174; font-size: 12px; }
      .axis-title { fill: #344054; font-size: 13px; font-weight: 600; }
      .chart-note, .empty-chart { color: #667085; font-size: .85rem; margin: 10px 0 0; }
      .legend { display: flex; flex-wrap: wrap; gap: 8px 14px; margin: -8px 0 0 52px; color: #536174; font-size: .8rem; }
      .legend-item { display: inline-flex; align-items: center; gap: 5px; }
      .legend-item i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
      .footnote { color: #667085; font-size: .82rem; line-height: 1.5; margin-top: 22px; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p class="intro">Erstellt am ${escapeHtml(statistics.asOf)}. Teil-Datumsangaben werden über das bekannte Jahr berücksichtigt.</p>
      <div class="summary">
        <div class="summary-card"><strong>${statistics.personCount}</strong><span>Personen im YAML</span></div>
        <div class="summary-card"><strong>${statistics.personAges.length}</strong><span>auswertbare Personenalter${approximateAgeCount ? ` (${approximateAgeCount} ungefähr)` : ''}</span></div>
        <div class="summary-card"><strong>${statistics.marriageAges.length}</strong><span>auswertbare Heiratsalter${approximateMarriageCount ? ` (${approximateMarriageCount} ungefähr)` : ''}</span></div>
        <div class="summary-card"><strong>${statistics.remarriageGaps.length}</strong><span>Wiederheirats-Abstände${approximateGapCount ? ` (${approximateGapCount} ungefähr)` : ''}</span></div>
      </div>
      ${chartFrame('Alter der Personen', personAgeChart, 'Verwendet wird das Alter beim Tod. Personen ohne Todesdatum werden nicht berücksichtigt.')}
      ${chartFrame('Alter bei der Heirat nach Kinderzahl', marriageAgeChart, 'Gezählt werden gemeinsame Kinder, die bei beiden Ehepartnern als Eltern verknüpft sind. Jede Person trägt ihr eigenes Heiratsalter bei.')}
      ${chartFrame('Zeit bis zur Wiederheirat', remarriageChart, 'Gezeigt wird der Abstand zwischen dem Tod des vorherigen Ehepartners und dem Beginn der nächsten datierten Ehe.')}
      <p class="footnote">Ehen ohne Startdatum sowie Personen ohne benötigte Geburts-, Todes- oder Heiratsdaten können in den jeweiligen Diagrammen nicht erscheinen.</p>
    </main>
  </body>
</html>`
}

const parseDocument = (source) => validDocument(parse(source))

const parseCliArguments = (args) => {
  let inputFile = null
  let outputFile = 'familien-statistik.html'
  let asOf = null

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--output') {
      outputFile = args[index + 1]
      index += 1
    } else if (argument === '--as-of') {
      asOf = args[index + 1]
      index += 1
    } else if (argument.startsWith('-')) {
      throw new Error(`Unbekannte Option: ${argument}`)
    } else if (!inputFile) {
      inputFile = argument
    } else {
      throw new Error(`Unerwartetes Argument: ${argument}`)
    }
  }

  if (!inputFile) throw new Error(usage)
  if (outputFile === undefined || outputFile.startsWith('-')) throw new Error('Nach --output muss ein Dateiname folgen.')
  if (asOf !== null && !datePartsOf(asOf)) throw new Error('Nach --as-of muss ein Datum im Format YYYY-MM-DD stehen.')

  return { inputFile, outputFile, asOf }
}

const main = async () => {
  try {
    const { inputFile, outputFile, asOf } = parseCliArguments(process.argv.slice(2))
    const source = await readFile(path.resolve(inputFile), 'utf8')
    const statistics = buildStatistics(parseDocument(source), { asOf: asOf ?? isoDateToday() })
    const html = generateStatisticsHtml(statistics)
    const outputPath = path.resolve(outputFile)
    await writeFile(outputPath, html, 'utf8')
    console.log(`Familienstatistik erstellt: ${outputPath}`)
  } catch (error) {
    console.error(`Fehler: ${error instanceof Error ? error.message : String(error)}`)
    console.error(usage)
    process.exitCode = 1
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
