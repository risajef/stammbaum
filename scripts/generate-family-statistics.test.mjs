import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildStatistics,
  generateStatisticsHtml,
} from './generate-family-statistics.mjs'

const person = (id, birthYear, deathYear = null) => ({
  id,
  firstName: id,
  lastName: 'Test',
  gender: id === 'a' || id === 'c' ? 'woman' : 'man',
  birthYear,
  deathYear,
})

const parentChild = (id, fromId, toId) => ({
  id,
  type: 'parent-child',
  fromId,
  toId,
})

const marriage = (id, fromId, toId, startDate) => ({
  id,
  type: 'marriage',
  fromId,
  toId,
  startDate,
})

test('builds person-age, marriage-age, and remarriage statistics', () => {
  const document = {
    persons: [
      person('a', '1980-06-01', '2020-07-01'),
      person('b', '1985', '2015-01-01'),
      person('c', '2012-01-01'),
      person('d', '1990-01-01'),
    ],
    relationships: [
      marriage('first-marriage', 'a', 'b', '2010-06-15'),
      marriage('second-marriage', 'a', 'd', '2020-01-01'),
      parentChild('a-c', 'a', 'c'),
      parentChild('b-c', 'b', 'c'),
    ],
  }

  const statistics = buildStatistics(document, { asOf: '2025-01-01' })

  assert.deepEqual(statistics.personAges.map((entry) => entry.age), [40, 30])
  assert.equal(statistics.personAges.filter((entry) => entry.approximate).length, 1)
  assert.deepEqual(
    statistics.marriageAges.map((entry) => ({ age: entry.age, children: entry.children })),
    [
      { age: 30, children: 1 },
      { age: 25, children: 1 },
      { age: 39, children: 0 },
      { age: 30, children: 0 },
    ],
  )
  assert.deepEqual(statistics.remarriageGaps.map((entry) => entry.years), [5])

  const html = generateStatisticsHtml(statistics, { title: 'Familienstatistik' })
  assert.match(html, /Alter der Personen/)
  assert.match(html, /Alter bei der Heirat nach Kinderzahl/)
  assert.match(html, /Zeit bis zur Wiederheirat/)
  assert.match(html, /<svg /)
  assert.match(html, /transform="rotate\(-90 [^"]+" text-anchor="start" class="axis-label"/)
})

test('excludes unknown death ages from the person histogram and its x-axis', () => {
  const statistics = buildStatistics({
    persons: [
      person('historic', '1595'),
      person('deceased', '1900', '1950'),
    ],
    relationships: [],
  }, { asOf: '2025-01-01' })

  assert.deepEqual(statistics.personAges.map((entry) => entry.age), [50])

  const html = generateStatisticsHtml(statistics)
  assert.match(html, /Alter beim Tod/)
  assert.match(html, /50–54/)
  assert.doesNotMatch(html, /430–434/)
})

test('ignores incomplete dates without losing other usable observations', () => {
  const statistics = buildStatistics({
    persons: [
      person('known', '1900'),
      person('unknown', null),
    ],
    relationships: [
      marriage('undated', 'known', 'unknown', null),
    ],
  }, { asOf: '1950' })

  assert.deepEqual(statistics.personAges, [])
  assert.deepEqual(statistics.marriageAges, [])
  assert.deepEqual(statistics.remarriageGaps, [])
})
