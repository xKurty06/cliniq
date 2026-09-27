import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearMockAuditEntries, getMockAuditEntries } from '../../lib/mocks/audit'
import { VisitDetailPage } from './VisitDetailPage'
import { fetchVisitDetail } from './api/visitDetailApi'

describe('Visit Detail/Edit', () => {
  beforeEach(() => clearMockAuditEntries())

  it('shows full student and clinical details for a deliberately opened visit', async () => {
    const detail = await fetchVisitDetail()
    render(<VisitDetailPage />)

    expect(await screen.findByRole('heading', { name: 'Visit Detail/Edit' })).toBeInTheDocument()
    expect(screen.getByText(detail.student.fullName)).toBeInTheDocument()
    expect(screen.getAllByText(detail.student.studentNumber).length).toBeGreaterThan(0)
    expect(screen.getByText(detail.complaint)).toBeInTheDocument()
    expect(screen.getByText(detail.treatment)).toBeInTheDocument()
  })

  it('validates required edit fields inline', async () => {
    const user = userEvent.setup()
    render(<VisitDetailPage />)

    await screen.findByRole('heading', { name: 'Visit Detail/Edit' })
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByLabelText(/complaint/i))
    await user.clear(screen.getByLabelText(/treatment/i))
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(screen.getByText('Enter the visit complaint.')).toBeInTheDocument()
    expect(screen.getByText('Enter the treatment or care given.')).toBeInTheDocument()
  })

  it('updates the visit and writes an audit entry', async () => {
    const user = userEvent.setup()
    render(<VisitDetailPage />)

    await screen.findByRole('heading', { name: 'Visit Detail/Edit' })
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByLabelText(/treatment/i))
    await user.type(screen.getByLabelText(/treatment/i), 'Observed in clinic and released.')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Visit updated.')).toBeInTheDocument()
    expect(screen.getByText('Observed in clinic and released.')).toBeInTheDocument()
    expect(getMockAuditEntries().map((entry) => entry.actionType)).toEqual(['update'])
  })
})
