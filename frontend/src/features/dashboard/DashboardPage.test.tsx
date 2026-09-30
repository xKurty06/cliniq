import { renderWithRouter } from '../../test/renderWithRouter'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMockSessionUser, listStudents } from '../../lib/mock-db'
import { DashboardPage } from './DashboardPage'

// jsdom has no canvas. Replace the chart with a stub that keeps its accessible label.
vi.mock('react-chartjs-2', () => {
  const Stub = (props: { 'aria-label'?: string }) => (
    <div role="img" aria-label={props['aria-label']} />
  )
  return { Bar: Stub, Line: Stub }
})

async function renderLoaded() {
  const user = userEvent.setup()
  renderWithRouter(<DashboardPage />)
  await screen.findByRole('heading', { name: /due & upcoming follow-ups/i })
  return user
}

describe('Clinic Overview Dashboard', () => {
  beforeEach(() => window.history.replaceState(null, '', '/'))
  afterEach(() => vi.restoreAllMocks())

  it('renders every section Reference 1 requires', async () => {
    await renderLoaded()
    expect(screen.getByRole('heading', { level: 1, name: 'Clinic Overview' })).toBeInTheDocument()
    expect(
      screen.getByText(
        new RegExp(
          `good (morning|afternoon|evening), ${getMockSessionUser().name}\\. Today's clinic activity and student health updates\\.`,
          'i',
        ),
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Date range')).toBeInTheDocument()
    for (const label of [
      'Clinic visits',
      'Incidents',
      'Incomplete records',
      'Low-stock items',
      'Active students',
    ]) {
      expect(
        within(screen.getByRole('region', { name: 'Summary counts' })).getByText(label),
      ).toBeInTheDocument()
    }
    for (const name of [
      /due & upcoming follow-ups/i,
      /frequent-visitor warnings/i,
      /low-stock & expiring items/i,
      /visits trend/i,
      /common complaints/i,
      /^calendar$/i,
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('radiogroup', { name: 'Calendar period' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /print \/ save as pdf/i })).toBeInTheDocument()
  })

  it('never shows a student name anywhere on the page (display-privacy rule)', async () => {
    await renderLoaded()
    const text = document.body.textContent ?? ''
    const names = new Set((await listStudents({ includeArchived: true })).map((s) => s.fullName))
    for (const name of names) expect(text).not.toContain(name)
    // Frequent-visitor rows lead with a Student Number.
    const list = screen.getByRole('region', {
      name: /frequent-visitor warnings \(scrollable list\)/i,
    })
    const first = within(list).getAllByRole('listitem')[0]
    expect(first.textContent).toMatch(/^\d{4}-\d{5}/)
    expect(first.textContent).toMatch(/Frequent-visit warning/)
  })

  it('is view-only: no create/update/delete actions exist', async () => {
    await renderLoaded()
    const labels = screen.getAllByRole('button').map((b) => b.textContent?.trim())
    for (const label of labels) {
      expect(label).toMatch(
        /^(Today|Last 7 days|Last 30 days|This month|Custom range|Print \/ Save as PDF|Previous.*|Next.*)$/,
      )
    }
  })

  it('prints through the browser print dialog', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: /print \/ save as pdf/i }))
    expect(print).toHaveBeenCalledOnce()
  })

  it('applies the design-system interactive and accent treatments', async () => {
    await renderLoaded()
    const dateRange = screen.getByRole('button', { name: 'Date range' })
    expect(dateRange).toHaveClass('cursor-pointer')
    expect(dateRange).toHaveClass('border-border')
    expect(dateRange).toHaveClass('hover:bg-surface')
    await userEvent.click(dateRange)
    const presets = screen.getByRole('listbox', { name: 'Date range presets' })
    expect(presets).toHaveClass('border-border')
    expect(presets).toHaveClass('min-w-full')
    expect(presets).toHaveClass('w-max')
    expect(presets.querySelector('svg')).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Last 30 days' })).toHaveClass(
      'bg-surface',
      'text-brand-green-dark',
    )

    expect(screen.getByRole('button', { name: /print \/ save as pdf/i })).toHaveClass(
      'cursor-pointer',
    )
    expect(
      within(screen.getByRole('radiogroup', { name: 'Calendar period' })).getByRole('radio', {
        name: 'Monthly',
      }),
    ).toHaveClass('cursor-pointer')

    const followUpList = screen.getByRole('region', {
      name: /due & upcoming follow-ups \(scrollable list\)/i,
    })
    expect(within(followUpList).getAllByRole('listitem')[0]).not.toHaveClass('cursor-pointer')
    expect(screen.getByText('MCA Dance Program')).toHaveClass('bg-brand-yellow')
  })

  it('switches calendar views with the keyboard (radiogroup arrow keys)', async () => {
    const user = await renderLoaded()
    const group = screen.getByRole('radiogroup', { name: 'Calendar period' })
    const monthly = within(group).getByRole('radio', { name: 'Monthly' })
    expect(monthly).toHaveAttribute('aria-checked', 'true')
    monthly.focus()
    await user.keyboard('{ArrowRight}')
    expect(within(group).getByRole('radio', { name: 'Yearly' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(within(group).getByRole('radio', { name: 'Yearly' })).toHaveFocus()
    await waitFor(() => expect(screen.getByText(/tagged days in/i)).toBeInTheDocument())
  })

  it('offers a table fallback for the complaint chart', async () => {
    const user = await renderLoaded()
    await user.click(
      within(screen.getByRole('radiogroup', { name: 'Show trend as' })).getByRole('radio', {
        name: /table/i,
      }),
    )
    expect(screen.getByRole('table', { name: /complaint counts per period/i })).toBeInTheDocument()
  })

  it('explains an invalid custom date range instead of applying it', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Date range' }))
    await user.click(screen.getByRole('option', { name: 'Custom range' }))
    const from = screen.getByLabelText('From')
    await user.clear(from)
    await user.type(from, '2099-01-01')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(
      await screen.findByText(/start date must be on or before the end date/i),
    ).toBeInTheDocument()
  })

  it('applies a custom date range only after Apply is pressed', async () => {
    const user = await renderLoaded()
    const trigger = screen.getByRole('button', { name: 'Date range' })
    const before = trigger.textContent
    await user.click(trigger)
    await user.click(screen.getByRole('option', { name: 'Custom range' }))
    const from = screen.getByLabelText('From')
    await user.clear(from)
    await user.type(from, '2020-01-01')
    expect(trigger).toHaveTextContent(before ?? '')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(trigger).toHaveTextContent('Custom range')
    expect(screen.queryByRole('form', { name: 'Custom date range' })).not.toBeInTheDocument()
  })

  it('shows the plain "Clinic Overview" title for Admin/Principal, with the same sections', async () => {
    renderWithRouter(<DashboardPage viewer={{ id: 'a', name: 'Principal', role: 'admin' }} />)
    await screen.findByRole('heading', { name: /due & upcoming follow-ups/i })
    expect(screen.getByRole('heading', { level: 1, name: 'Clinic Overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /visits trend/i })).toBeInTheDocument()
  })

  it('shows an error state with a retry action when loading fails', async () => {
    window.history.replaceState(null, '', '/?mock=error')
    renderWithRouter(<DashboardPage />)
    expect(await screen.findByText('Unable to load the clinic overview.')).toBeInTheDocument()
    // The calendar is an independent data source, so it reports and retries its own failure.
    expect(await screen.findByText('Unable to load the calendar.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /try again/i })).toHaveLength(2)
  })

  it('shows calm empty states when there is no data', async () => {
    window.history.replaceState(null, '', '/?mock=empty')
    renderWithRouter(<DashboardPage />)
    expect(await screen.findByText('No follow-ups due')).toBeInTheDocument()
    expect(screen.getByText('No frequent-visitor warnings')).toBeInTheDocument()
    expect(screen.getByText('No inventory alerts')).toBeInTheDocument()
    expect(screen.getByText('No complaints recorded in this date range')).toBeInTheDocument()
  })
})
