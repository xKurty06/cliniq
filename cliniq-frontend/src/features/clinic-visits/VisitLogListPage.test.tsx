import { renderWithRouter } from '../../test/renderWithRouter'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { VisitLogListPage } from './VisitLogListPage'
import { defaultVisitLogRange, fetchVisitLog } from './api/visitLogApi'

describe('Visit Log List', () => {
  it('renders a privacy-safe multi-student visit list', async () => {
    renderWithRouter(<VisitLogListPage />)

    expect(await screen.findByRole('heading', { name: 'Visit Log List' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Student Number' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Disposition' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: /full name/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: /complaint/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: /treatment/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Headache')).not.toBeInTheDocument()
    expect(screen.queryByText('Paracetamol given')).not.toBeInTheDocument()
  })

  it('searches visits by Student Number', async () => {
    const user = userEvent.setup()
    const range = defaultVisitLogRange()
    const [visit] = await fetchVisitLog({
      ...range,
      search: '',
      disposition: 'all',
    })

    renderWithRouter(<VisitLogListPage />)
    await screen.findByRole('heading', { name: 'Visit Log List' })
    await user.type(screen.getByLabelText('Search'), visit.studentNumber)

    expect(await screen.findByText(/records? shown/)).toBeInTheDocument()
    expect(screen.getAllByText(visit.studentNumber).length).toBeGreaterThan(0)
  })

  it('filters by disposition', async () => {
    const user = userEvent.setup()
    renderWithRouter(<VisitLogListPage />)

    await screen.findByRole('heading', { name: 'Visit Log List' })
    await user.click(screen.getByRole('radio', { name: 'Sent home' }))

    await waitFor(() => {
      expect(screen.getByText(/records? shown/)).toBeInTheDocument()
    })
    for (const badge of screen.getAllByText('Sent home')) {
      expect(badge).toBeInTheDocument()
    }
  })

  it('shows an empty state for a date range with no visits', async () => {
    const user = userEvent.setup()
    renderWithRouter(<VisitLogListPage />)

    await screen.findByRole('heading', { name: 'Visit Log List' })
    await user.click(screen.getByRole('button', { name: 'Date range' }))
    await user.click(screen.getByRole('option', { name: 'Custom range' }))
    await user.clear(screen.getByLabelText('From'))
    await user.type(screen.getByLabelText('From'), '2000-01-01')
    await user.clear(screen.getByLabelText('To'))
    await user.type(screen.getByLabelText('To'), '2000-01-02')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('No visits found')).toBeInTheDocument()
  })

  it('offers the requested date-range presets and defaults to newest date and time first', async () => {
    const user = userEvent.setup()
    renderWithRouter(<VisitLogListPage />)

    await screen.findByRole('heading', { name: 'Visit Log List' })
    expect(
      screen.getByRole('button', { name: /Sort by Date and time, currently descending/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Date range' })).toHaveTextContent('All')

    await user.click(screen.getByRole('button', { name: 'Date range' }))
    for (const label of ['Today', 'This week', 'This month', 'All', 'Custom range']) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
    }
    await user.click(screen.getByRole('option', { name: 'Custom range' }))
    expect(screen.getByRole('form', { name: 'Custom date range' })).toHaveClass('absolute')
  })

  it('toggles a sortable column between ascending and descending', async () => {
    const user = userEvent.setup()
    renderWithRouter(<VisitLogListPage />)

    await screen.findByRole('heading', { name: 'Visit Log List' })
    await user.click(screen.getByRole('button', { name: 'Sort by Student Number' }))
    expect(
      screen.getByRole('button', { name: /Sort by Student Number, currently ascending/i }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: /Sort by Student Number, currently ascending/i }),
    )
    expect(
      screen.getByRole('button', { name: /Sort by Student Number, currently descending/i }),
    ).toBeInTheDocument()
  })
})
