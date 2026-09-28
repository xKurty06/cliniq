import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReportsPage } from './ReportsPage'
import { getMockDataset } from '../../lib/mocks/dataset'
import { todayISO } from '../../lib/dates'
import { complaintCounts } from './lib/complaintCounts'

// jsdom has no canvas. Replace the chart with a stub that keeps its accessible label.
vi.mock('react-chartjs-2', () => {
  const Stub = (props: { 'aria-label'?: string }) => (
    <div role="img" aria-label={props['aria-label']} />
  )
  return { Bar: Stub, Line: Stub }
})

const STAFF = { id: 'usr-nurse', name: 'Nurse', role: 'staff' } as const

function monthVisits() {
  const month = todayISO().slice(0, 7)
  return getMockDataset(todayISO()).visits.filter((visit) => visit.dateTime.startsWith(month))
}

describe('Reports', () => {
  it('switches between print-friendly report views', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<ReportsPage viewer={{ id: 'usr-nurse', name: 'Nurse', role: 'staff' }} />)
    expect(screen.getByRole('heading', { name: 'Monthly Report' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Incident archive' }))
    expect(screen.getByRole('heading', { name: 'Incident Report Archive' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Health summaries' }))
    expect(screen.getByRole('heading', { name: 'Health Summaries' })).toBeInTheDocument()
  })

  it('uses the linked student’s actual Student Number in the incident archive', async () => {
    const user = userEvent.setup()
    render(<ReportsPage viewer={{ id: 'usr-nurse', name: 'Nurse', role: 'staff' }} />)
    await user.click(screen.getByRole('tab', { name: 'Incident archive' }))
    const incident = getMockDataset(todayISO()).incidents.find((item) => item.time.startsWith(todayISO().slice(0, 7)))!
    const student = getMockDataset(todayISO()).students.find((item) => item.id === incident.studentId)!
    const archive = screen.getByRole('table', { name: 'Incident report archive' })
    expect(within(archive).getByText(student.studentNumber)).toBeInTheDocument()
  })

  it('shows the health summary as a sorted bar chart by default, with a table view', async () => {
    const user = userEvent.setup()
    render(<ReportsPage viewer={STAFF} />)
    await user.click(screen.getByRole('tab', { name: 'Health summaries' }))

    const rows = complaintCounts(monthVisits())
    const chart = screen.getByRole('img', { name: /clinic visits by complaint/i })
    expect(chart).toHaveAccessibleName(
      `Clinic visits by complaint: ${rows.map((r) => `${r.complaint} ${r.count}`).join('; ')}.`,
    )
    expect(screen.getByRole('radio', { name: 'Chart' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Table' }))
    const table = screen.getByRole('table', { name: 'Health summary by complaint' })
    const bodyRows = within(table).getAllByRole('row').slice(1)
    expect(bodyRows.map((row) => within(row).getByRole('rowheader').textContent)).toEqual(
      rows.map((r) => r.complaint),
    )
    // Counts run from most to fewest visits.
    expect(rows.map((r) => r.count)).toEqual([...rows.map((r) => r.count)].sort((a, b) => b - a))
  })

  it('keeps both the chart and the table in the page so both print', async () => {
    const user = userEvent.setup()
    const { container } = render(<ReportsPage viewer={STAFF} />)
    await user.click(screen.getByRole('tab', { name: 'Health summaries' }))

    // Chart view: the table is hidden on screen but printed.
    expect(container.querySelector('[data-table="health-summary"]')).toHaveClass('hidden', 'print:block')

    // Table view: the chart stays mounted off-screen and hidden from assistive tech, for print.
    await user.click(screen.getByRole('radio', { name: 'Table' }))
    const chartWrapper = container.querySelector('[data-chart="health-summary"]')!.parentElement!
    expect(chartWrapper).toHaveAttribute('aria-hidden', 'true')
    expect(chartWrapper).toHaveClass('print:static')
  })

  it('shows an empty state instead of a blank chart for a month with no visits', async () => {
    const user = userEvent.setup()
    render(<ReportsPage viewer={STAFF} />)
    await user.click(screen.getByRole('tab', { name: 'Health summaries' }))
    fireEvent.change(screen.getByLabelText('Report month'), { target: { value: '2000-01' } })

    expect(screen.getByText('No clinic visits recorded this month')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /clinic visits by complaint/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Chart' })).not.toBeInTheDocument()
  })
})
