import assert from 'node:assert/strict'
import test from 'node:test'

import {
  detectFamilyLoops,
  formatFamilyLoopReport,
} from './detect-family-loops.mjs'

const person = (id, firstName = id, lastName = 'Test') => ({
  id,
  firstName,
  lastName,
})

const parentChild = (id, fromId, toId) => ({
  id,
  type: 'parent-child',
  fromId,
  toId,
})

const marriage = (id, fromId, toId) => ({
  id,
  type: 'marriage',
  fromId,
  toId,
})

test('detects a relative marriage and returns the blood relationship path', () => {
  const document = {
    persons: [
      person('grandparent', 'Maria', 'Gross'),
      person('parent-a', 'Anna', 'Gross'),
      person('parent-b', 'Hans', 'Gross'),
      person('cousin-a', 'Lina', 'Gross'),
      person('cousin-b', 'Paul', 'Gross'),
    ],
    relationships: [
      parentChild('grandparent-parent-a', 'grandparent', 'parent-a'),
      parentChild('grandparent-parent-b', 'grandparent', 'parent-b'),
      parentChild('parent-a-cousin-a', 'parent-a', 'cousin-a'),
      parentChild('parent-b-cousin-b', 'parent-b', 'cousin-b'),
      marriage('cousins-marriage', 'cousin-a', 'cousin-b'),
    ],
  }

  const loops = detectFamilyLoops(document)

  assert.deepEqual(loops, [{
    marriageId: 'cousins-marriage',
    firstPersonId: 'cousin-a',
    secondPersonId: 'cousin-b',
    pathPersonIds: ['cousin-a', 'parent-a', 'grandparent', 'parent-b', 'cousin-b'],
    pathRelationshipIds: [
      'parent-a-cousin-a',
      'grandparent-parent-a',
      'grandparent-parent-b',
      'parent-b-cousin-b',
    ],
  }])

  const report = formatFamilyLoopReport(document, loops)
  assert.match(report, /cousins-marriage/)
  assert.match(report, /Lina Gross/)
  assert.match(report, /Paul Gross/)
  assert.match(report, /Loop:/)
})

test('ignores marriages without a parent-child path between the spouses', () => {
  const document = {
    persons: [person('first', 'Anna'), person('second', 'Hans')],
    relationships: [marriage('unrelated-marriage', 'first', 'second')],
  }

  assert.deepEqual(detectFamilyLoops(document), [])
})

test('does not mistake spouses sharing a child for a relative marriage', () => {
  const document = {
    persons: [
      person('mother', 'Maria'),
      person('father', 'Johann'),
      person('child', 'Johann'),
    ],
    relationships: [
      parentChild('mother-child', 'mother', 'child'),
      parentChild('father-child', 'father', 'child'),
      marriage('parents-marriage', 'mother', 'father'),
    ],
  }

  assert.deepEqual(detectFamilyLoops(document), [])
})

test('detects a marriage between an ancestor and a descendant', () => {
  const document = {
    persons: [person('parent', 'Maria'), person('child', 'Johann')],
    relationships: [
      parentChild('parent-child', 'parent', 'child'),
      marriage('ancestor-marriage', 'parent', 'child'),
    ],
  }

  assert.deepEqual(detectFamilyLoops(document), [{
    marriageId: 'ancestor-marriage',
    firstPersonId: 'parent',
    secondPersonId: 'child',
    pathPersonIds: ['parent', 'child'],
    pathRelationshipIds: ['parent-child'],
  }])
})
