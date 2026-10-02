import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ComplaintTrends, TrendTable } from './ComplaintTrends'
import type { ComplaintTrends as ComplaintTrendsData, TrendBucket } from '../../../types/dashboard'

vi.mock('react-chartjs-2', () => ({
  Line: (props: { 'aria-label'?: string }) => <div role="img" aria-label={props['aria-label']} />,
}))

const buckets: TrendBucket[] = Array.from({ length: 14 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0')
  const date = `2026-09-${day}`
  return { key: date, label: `P${index + 1}`, from: date, to: date }
})

const trends: ComplaintTrendsData = {
  granularity: 'week',
  buckets,
  series: [
    {
      complaint: 'Headache',
      counts: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      total: 3,
      clusterBuckets: [],
    },
    {
      complaint: 'No activity',
      counts: Array(14).fill(0),
      total: 0,
      clusterBuckets: [],
    },
  ],
  otherComplaints: [
    {
      complaint: 'Earlier only',
      counts: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      total: 2,
      clusterBuckets: [],
    },
  ],
}

describe('TrendTable', () => {
  it('keeps Chart selectable when a range has one period', async () => {
    const user = userEvent.setup()
    const singlePeriod: ComplaintTrendsData = {
      ...trends,
      buckets: [buckets[0]],
      series: trends.series.map((row) => ({ ...row, counts: [row.counts[0]] })),
      otherComplaints: trends.otherComplaints.map((row) => ({ ...row, counts: [row.counts[0]] })),
    }
    render(
      <ComplaintTrends
        trends={singlePeriod}
        granularity="week"
        onGranularityChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: 'Chart' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Table' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('img', { name: /visits and incidents by week/i })).toBeInTheDocument()
    expect(screen.queryByRole('table', { name: /complaint counts per period/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Table' }))
    expect(screen.getByRole('columnheader', { name: /Sep 1, 2026/i })).toBeInTheDocument()
  })

  it("leaves the chart's full bucket range uncapped", () => {
    render(<ComplaintTrends trends={trends} granularity="week" onGranularityChange={vi.fn()} />)

    const chartLabel = screen.getByRole('img').getAttribute('aria-label') ?? ''
    expect(chartLabel.split('; ')).toHaveLength(14)
  })

  it('caps period columns, keeps Total descending by default, and notes hidden periods', () => {
    render(<TrendTable trends={trends} />)

    const table = screen.getByRole('table', { name: /complaint counts per period/i })
    expect(table.querySelectorAll('thead th')).toHaveLength(14)
    expect(screen.getByText(/\+ 2 earlier periods — narrow the date range/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sort by Total, currently descending' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('All visits & incidents')
    expect(screen.getByRole('columnheader', { name: 'Complaint' })).toHaveClass('sticky', 'left-0')
    expect(table.querySelector('col')).toHaveAttribute('style', 'width: 24ch;')
    expect(screen.getByRole('columnheader', { name: 'Total' })).toHaveClass('sticky', 'right-0')
    expect(table.querySelector('thead')).not.toHaveTextContent('Week of')
  })

  it('hides zero-activity rows in the visible window and reveals them with the toggle', async () => {
    const user = userEvent.setup()
    render(<TrendTable trends={trends} />)

    expect(screen.queryByRole('row', { name: /No activity/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Earlier only/ })).not.toBeInTheDocument()

    const toggle = screen.getByRole('button', { name: 'Show all complaint types' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)

    expect(screen.getByRole('row', { name: /No activity/ })).toBeInTheDocument()
    const earlierOnlyRow = screen.getByRole('row', { name: /Earlier only/ })
    expect(earlierOnlyRow).toBeInTheDocument()
    expect(within(earlierOnlyRow).getAllByRole('cell').at(-1)).toHaveTextContent('0')
    expect(
      screen.getByRole('button', { name: 'Hide zero-activity complaint types' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps the Common complaints totals unchanged when table rows are revealed', async () => {
    const user = userEvent.setup()
    render(<ComplaintTrends trends={trends} granularity="week" onGranularityChange={vi.fn()} />)

    await user.click(screen.getByRole('radio', { name: 'Table' }))
    const commonTotal = screen.getByText(/other complaint types, 2 cases/i)
    const before = commonTotal.textContent
    await user.click(screen.getByRole('button', { name: 'Show all complaint types' }))

    expect(commonTotal).toHaveTextContent(before ?? '')
  })
})
