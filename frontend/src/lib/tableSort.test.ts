import { describe, expect, it } from 'vitest'
import { sortTableRows } from './tableSort'

describe('table sorting', () => {
  it('keeps missing values at the bottom when dates are sorted newest first', () => {
    const rows = [
      { id: 'missing', date: null },
      { id: 'old', date: '2025-01-01' },
      { id: 'new', date: '2026-01-01' },
    ]

    expect(
      sortTableRows(rows, { key: 'date', direction: 'descending' }, (row) => row.date).map(
        (row) => row.id,
      ),
    ).toEqual(['new', 'old', 'missing'])
  })
})
