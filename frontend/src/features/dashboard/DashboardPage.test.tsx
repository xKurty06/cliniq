import { pickDate } from '../../test/pickDate'
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
      'Incomplete',
      'Low-stock items',
      'Active students',
    ]) {
      expect(
        // Labels may be split across a no-wrap span (TitleLink), so match the label paragraph's full text.
        within(screen.getByRole('region', { name: 'Summary counts' })).getByText(
          (_, el) => el?.tagName === 'P' && el.textContent === label,
        ),
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

  it('uses compact dates and labelled visit totals in calendar cards', async () => {
    await renderLoaded()
    expect(screen.getAllByText(/^[A-Z][a-z]{2} \d{1,2}$/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^\d+ Visits?$/).length).toBeGreaterThan(0)
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

  it('gives Staff read-only drill-down links and an inline calendar day summary', async () => {
    const user = await renderLoaded()
    const summary = screen.getByRole('region', { name: 'Summary counts' })
    for (const [label, href] of [
      ['Clinic visits', '/visits'],
      ['Incidents', '/incidents'],
      ['Incomplete', '/students/incomplete'],
      ['Low-stock items', '/inventory'],
      ['Active students', '/students'],
    ]) {
      const link = within(summary).getByRole('link', { name: label })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveClass('text-current', 'hover:underline', 'hover:brightness-75')
    }
    expect(within(summary).queryByText('View all')).not.toBeInTheDocument()

    const followUps = screen.getByRole('region', {
      name: /due & upcoming follow-ups \(scrollable list\)/i,
    })
    expect(within(followUps).getAllByRole('link')[0].getAttribute('href')).toMatch(/^\/students\//)

    const frequentVisitors = screen.getByRole('region', {
      name: /frequent-visitor warnings \(scrollable list\)/i,
    })
    expect(within(frequentVisitors).getAllByRole('link')[0].getAttribute('href')).toMatch(
      /^\/students\//,
    )
    expect(screen.queryByRole('link', { name: 'View all' })).not.toBeInTheDocument()

    const inventory = screen.getByRole('region', {
      name: /low-stock & expiring items \(scrollable list\)/i,
    })

    // The widget's own title is the drill-down link; the count badge stays outside it.
    for (const [title, href] of [
      ['Due & upcoming follow-ups', '/follow-ups'],
      ['Low-stock & expiring items', '/inventory'],
    ]) {
      const heading = screen.getByRole('heading', { name: new RegExp(title, 'i') })
      const link = within(heading).getByRole('link', { name: title })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveClass('text-current', 'hover:underline')
      expect(link.querySelector('svg')).toBeInTheDocument()
    }
    expect(
      within(screen.getByRole('heading', { name: /frequent-visitor warnings/i })).queryByRole('link'),
    ).not.toBeInTheDocument()

    const oralRehydrationSalts = within(inventory).getByRole('link', {
      name: 'Oral Rehydration Salts',
    })
    expect(oralRehydrationSalts).toHaveClass('max-w-full')
    expect(oralRehydrationSalts.firstElementChild).toHaveClass('truncate')
    expect(oralRehydrationSalts.querySelector('svg')).toHaveClass('shrink-0')

    expect(within(inventory).getAllByRole('link')[0]).toHaveAttribute('href', '/inventory')

    const day = screen.getAllByRole('button', { name: /view activity for/i })[0]
    await user.click(day)
    expect(screen.getByRole('region', { name: /activity on/i })).toBeInTheDocument()
  })

  it('is view-only: no create/update/delete actions exist', async () => {
    await renderLoaded()
    const labels = screen
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label') ?? b.textContent?.trim())
    for (const label of labels) {
      expect(label).toMatch(
        /^(Date range|All|Today|Last 7 days|Last 30 days|This month|Custom range|Print \/ Save as PDF|Previous.*|Next.*|View activity for.*)$/,
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
    expect(screen.getByRole('option', { name: 'All' })).toHaveClass(
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
    expect(within(followUpList).getAllByRole('link')[0]).toHaveClass('cursor-pointer', 'underline', 'text-brand-green-dark')
    expect(screen.getByText('MCA Dance Program')).toHaveClass('bg-brand-yellow')
  })

  it('stacks inventory badges only when the alert card is narrow', async () => {
    await renderLoaded()
    const inventoryList = screen.getByRole('region', {
      name: /low-stock & expiring items \(scrollable list\)/i,
    })
    const cetirizineRow = within(inventoryList).getByText('Cetirizine 10mg').closest('li')
    const badgeGroup = within(cetirizineRow as HTMLElement)
      .getByText('Expires in 11 days')
      .closest('div')

    expect(badgeGroup).toHaveClass(
      'flex',
      'flex-wrap',
      '@max-[28rem]:flex-col',
      '@max-[28rem]:flex-nowrap',
      '@max-[28rem]:items-end',
    )
  })

  it('keeps all alert cards on one shared height track', async () => {
    await renderLoaded()
    const alertCards = within(screen.getByRole('region', { name: 'Alerts' })).getAllByRole(
      'region',
      { name: /scrollable list/i },
    )

    expect(alertCards).toHaveLength(3)
    expect(screen.getByRole('region', { name: 'Alerts' })).toHaveClass('lg:auto-rows-[26rem]')
    for (const list of alertCards) {
      expect(list).toHaveClass('min-h-0', 'flex-1', 'lg:max-h-none')
      expect(list.parentElement).toHaveClass('h-full', 'min-h-0')
    }
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
    await waitFor(() => expect(screen.getByText(/activity days in/i)).toBeInTheDocument())
  })

  it('offers a table fallback for the complaint chart', async () => {
    const user = await renderLoaded()
    await user.click(
      within(screen.getByRole('radiogroup', { name: 'Show trend as' })).getByRole('radio', {
        name: /table/i,
      }),
    )
    const table = screen.getByRole('table', { name: /complaint counts per period/i })
    expect(table).toBeInTheDocument()
    expect(table).toHaveClass('table-fixed')
    expect(table.parentElement).toHaveClass('[&_table]:min-w-max')
    expect(table.querySelectorAll('thead th')).toHaveLength(14)
    expect(
      screen.getByText(/earlier periods — narrow the date range to see them/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sort by Total, currently descending' }),
    ).toBeInTheDocument()
    expect(table.querySelector('thead th')).toHaveClass('sticky', 'left-0', 'bg-background')
    const columns = table.querySelectorAll('col')
    expect(columns[0]).toHaveAttribute('style', 'width: 26ch;')
    expect(columns[1]).toHaveAttribute('style', 'width: 8rem;')
    expect(columns[columns.length - 1]).toHaveAttribute('style', 'width: 5rem;')
    expect(table.querySelector('thead th:last-child')).toHaveClass(
      'sticky',
      'right-0',
      'bg-background',
    )
  })

  it('explains an invalid custom date range instead of applying it', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Date range' }))
    await user.click(screen.getByRole('option', { name: 'Custom range' }))
    await pickDate(user, screen.getByLabelText('To'), '2024-12-31')
    await pickDate(user, screen.getByLabelText('From'), '2025-01-01')
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
    await pickDate(user, screen.getByLabelText('From'), '2020-01-01')
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
    expect(
      within(screen.getByRole('region', { name: 'Summary counts' })).queryAllByRole('link'),
    ).toHaveLength(0)
    expect(screen.queryByRole('link', { name: 'View all' })).not.toBeInTheDocument()
    for (const name of [
      /due & upcoming follow-ups \(scrollable list\)/i,
      /frequent-visitor warnings \(scrollable list\)/i,
      /low-stock & expiring items \(scrollable list\)/i,
    ]) {
      const list = screen.getByRole('region', { name })
      expect(within(list).queryAllByRole('link')).toHaveLength(0)
      expect(within(list).getAllByRole('listitem')[0]).not.toHaveClass('cursor-pointer')
    }
    expect(screen.queryByRole('button', { name: /view activity for/i })).not.toBeInTheDocument()
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
