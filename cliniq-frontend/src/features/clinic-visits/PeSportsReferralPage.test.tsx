import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearMockAuditEntries, getMockAuditEntries } from '../../lib/mocks/audit'
import { PeSportsReferralPage } from './PeSportsReferralPage'
import { fetchPeReferralContext } from './api/peReferralApi'

describe('PE/Sports Injury Referral Form', () => {
  beforeEach(() => clearMockAuditEntries())

  it('renders a deliberate single-student referral form', async () => {
    const context = await fetchPeReferralContext()
    render(<PeSportsReferralPage />)

    expect(
      await screen.findByRole('heading', { name: 'PE/Sports Injury Referral Form' }),
    ).toBeInTheDocument()
    expect(screen.getByText(new RegExp(context.student.fullName))).toBeInTheDocument()
    expect(screen.getByText(/Emergency escalation not selected/)).toBeInTheDocument()
  })

  it('validates required fields inline', async () => {
    const user = userEvent.setup()
    render(<PeSportsReferralPage />)

    await screen.findByRole('heading', { name: 'PE/Sports Injury Referral Form' })
    await user.click(screen.getByRole('button', { name: 'Save Referral' }))

    expect(screen.getByText('Enter who submitted the referral.')).toBeInTheDocument()
    expect(screen.getByText('Enter the injury summary.')).toBeInTheDocument()
    expect(screen.getByText('Enter the clinical assessment.')).toBeInTheDocument()
  })

  it('loads PE defaults and saves a non-hospital referral audit entry', async () => {
    const user = userEvent.setup()
    render(<PeSportsReferralPage />)

    await screen.findByRole('heading', { name: 'PE/Sports Injury Referral Form' })
    await user.click(screen.getByRole('button', { name: 'Use PE Defaults' }))
    expect(screen.getByDisplayValue('PE Instructor')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/injury summary/i), 'Ankle twist during drills.')
    await user.type(screen.getByLabelText(/clinical assessment/i), 'Mild swelling, able to stand.')
    await user.type(screen.getByLabelText(/treatment or action taken/i), 'Cold compress and rest.')
    await user.click(screen.getByRole('button', { name: 'Save Referral' }))

    expect(await screen.findByText('PE/Sports referral saved.')).toBeInTheDocument()
    expect(getMockAuditEntries().map((entry) => entry.actionType)).toEqual(['submit'])
  })

  it('queues Emergency Response escalation when hospital referral is selected', async () => {
    const user = userEvent.setup()
    render(<PeSportsReferralPage />)

    await screen.findByRole('heading', { name: 'PE/Sports Injury Referral Form' })
    await user.click(screen.getByRole('button', { name: 'Use PE Defaults' }))
    await user.type(screen.getByLabelText(/injury summary/i), 'Head impact during basketball.')
    await user.type(screen.getByLabelText(/clinical assessment/i), 'Dizzy and needs referral.')
    await user.type(screen.getByLabelText(/treatment or action taken/i), 'Observed and called guardian.')
    await user.click(screen.getByRole('radio', { name: 'Hospital referral' }))

    expect(screen.getByText(/Continue in Emergency Response/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save Referral' }))

    expect(await screen.findByText(/Emergency Response escalation was queued/)).toBeInTheDocument()
    expect(getMockAuditEntries().map((entry) => entry.actionType)).toEqual(['submit', 'create'])
  })
})
