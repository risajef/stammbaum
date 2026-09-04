import type { DateValue, PartialDate } from './types'

export interface PartialDateParts {
  year: number
  month: number | null
  day: number | null
}

const partialDatePattern = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/

const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)

const daysInMonth = (year: number, month: number) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30
  return 31
}

export const normalizePartialDate = (
  value: DateValue | null | undefined,
): PartialDate | null => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value).padStart(4, '0') : String(value)
  }

  const trimmed = value.trim()
  return trimmed || null
}

export const parsePartialDate = (value: DateValue | null | undefined): PartialDateParts | null => {
  const normalized = normalizePartialDate(value)
  if (!normalized) {
    return null
  }

  const match = normalized.match(partialDatePattern)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) : null
  const day = match[3] ? Number(match[3]) : null
  if (month !== null && (month < 1 || month > 12)) {
    return null
  }
  if (day !== null && (month === null || day < 1 || day > daysInMonth(year, month))) {
    return null
  }

  return { year, month, day }
}

export const isValidPartialDate = (value: DateValue | null | undefined) =>
  normalizePartialDate(value) === null || parsePartialDate(value) !== null

export const comparePartialDates = (
  first: DateValue | null | undefined,
  second: DateValue | null | undefined,
): -1 | 0 | 1 | null => {
  const firstParts = parsePartialDate(first)
  const secondParts = parsePartialDate(second)
  if (!firstParts || !secondParts) {
    return null
  }

  for (const component of ['year', 'month', 'day'] as const) {
    const firstValue = firstParts[component]
    const secondValue = secondParts[component]
    if (firstValue === null || secondValue === null) {
      return null
    }
    if (firstValue < secondValue) {
      return -1
    }
    if (firstValue > secondValue) {
      return 1
    }
  }

  return 0
}