import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '../../test/renderWithRouter'
import { IncidentLogListPage } from './IncidentLogListPage'
import { defaultIncidentLogRange, fetchIncidentLog } from './api/incidentLogApi'

describe('Incident Log List', () => {
  it('renders a privacy-safe multi-student incident list with completion statuses', async () => {
    renderWithRouter(<IncidentLogListPage />)

    expect(await screen.findByRole('heading', { name: 'Incident Log List' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Student Number' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Reason / description' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: /full name/i })).not.toBeInTheDocument()
  })

  it('searches incidents by actual Student Number', async () => {
    const user = userEvent.setup()
    const [incident] = await fetchIncidentLog({ ...defaultIncidentLogRange(), search: '', completion: 'all' })
    renderWithRouter(<IncidentLogListPage />)
    await screen.findByRole('heading', { name: 'Incident Log List' })
    await user.type(screen.getByLabelText('Search'), incident.studentNumber)
    expect(await screen.findByText('1 record shown')).toBeInTheDocument()
    expect(screen.getByText(incident.studentNumber)).toBeInTheDocument()
  })

  it('filters by completion state', async () => {
    const user = userEvent.setup()
    renderWithRouter(<IncidentLogListPage />)
    await screen.findByRole('heading', { name: 'Incident Log List' })
    await user.click(screen.getByRole('radio', { name: 'Needs completion' }))
    await waitFor(() => expect(screen.getAllByText('Needs completion').length).toBeGreaterThan(0))
  })
})
