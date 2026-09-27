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

    expect(await screen.findByText('1 record shown')).toBeInTheDocument()
    expect(screen.getByText(visit.studentNumber)).toBeInTheDocument()
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
    await user.clear(screen.getByLabelText('From'))
    await user.type(screen.getByLabelText('From'), '2035-01-01')
    await user.clear(screen.getByLabelText('To'))
    await user.type(screen.getByLabelText('To'), '2035-01-02')

    expect(await screen.findByText('No visits found')).toBeInTheDocument()
  })
})
