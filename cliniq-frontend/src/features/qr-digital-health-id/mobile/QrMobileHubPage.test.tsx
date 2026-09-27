import { renderWithRouter } from '../../../test/renderWithRouter'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearMockAuditEntries, getMockAuditEntries } from '../../../lib/mocks/audit'
import { demoStudentNumber } from '../api/qrLookupApi'
import { QrMobileHubPage } from './QrMobileHubPage'

describe('QR Mobile Hub', () => {
  beforeEach(() => clearMockAuditEntries())

  it('shows Staff mobile quick actions after lookup', async () => {
    const user = userEvent.setup()
    renderWithRouter(<QrMobileHubPage />)

    expect(screen.getByRole('heading', { name: 'QR Scan / Lookup' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /emergency button/i })).toHaveAttribute(
      'href',
      '/incidents/new',
    )
    await user.click(screen.getByRole('button', { name: 'Use demo scan' }))

    expect(await screen.findByRole('heading', { name: /quick actions/i })).toBeInTheDocument()
    const studentNumber = demoStudentNumber()
    expect(screen.getByRole('link', { name: 'Record Visit' })).toHaveAttribute(
      'href',
      `/visits/new?student=${studentNumber}`,
    )
    expect(screen.getByRole('link', { name: 'Log Emergency' })).toHaveAttribute(
      'href',
      `/incidents/new?student=${studentNumber}`,
    )
    expect(screen.getByRole('link', { name: 'View Full Profile' })).toHaveAttribute(
      'href',
      `/students/${studentNumber}`,
    )
    expect(screen.getByRole('link', { name: 'Dispense Medicine' })).toHaveAttribute(
      'href',
      `/inventory/dispense?student=${studentNumber}`,
    )
    expect(getMockAuditEntries().map((entry) => entry.actionType)).toEqual(['scan'])
  })

  it('shows Instructor read-only lookup with no action buttons', async () => {
    const user = userEvent.setup()
    renderWithRouter(<QrMobileHubPage viewer={{ id: 'usr-pe', name: 'PE Instructor', role: 'instructor' }} />)

    expect(screen.getByRole('heading', { name: 'Instructor Lookup' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /emergency button/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Use demo scan' }))

    expect(await screen.findByRole('heading', { name: 'Read-only health history' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Record Visit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Log Emergency' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Dispense Medicine' })).not.toBeInTheDocument()
    expect(getMockAuditEntries().map((entry) => entry.actionType)).toEqual(['scan'])
  })
})
