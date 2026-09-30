import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getRecordedAuditEntries, resetMockDb } from '../../lib/mock-db'
import { ExcuseLetterPage } from './ExcuseLetterPage'
import { fetchExcuseLetterContext } from './api/excuseLetterApi'

describe('Excuse Letter', () => {
  beforeEach(() => {
    resetMockDb()
    vi.restoreAllMocks()
  })

  it('renders a clinic excuse letter, not a medical certificate workflow', async () => {
    const context = await fetchExcuseLetterContext()
    render(<ExcuseLetterPage />)

    expect(
      await screen.findByRole('heading', { name: 'Excuse Letter' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(new RegExp(context.student.fullName)).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Clinic Excuse Letter' })).toBeInTheDocument()
    expect(screen.getAllByText(/not a medical certificate/i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: /medical certificate/i })).not.toBeInTheDocument()
  })

  it('prints the letter preview', async () => {
    const user = userEvent.setup()
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<ExcuseLetterPage />)

    await screen.findByRole('heading', { name: 'Excuse Letter' })
    await user.click(screen.getByRole('button', { name: 'Print' }))

    expect(print).toHaveBeenCalledOnce()
  })

  it('requires nurse check before approval and writes an audit entry', async () => {
    const user = userEvent.setup()
    render(<ExcuseLetterPage />)

    await screen.findByRole('heading', { name: 'Excuse Letter' })
    expect(screen.getByRole('button', { name: 'Approve and Store' })).toBeDisabled()

    await user.click(
      screen.getByLabelText(/I checked the letter and approve storing it in the student's record/i),
    )
    await user.click(screen.getByRole('button', { name: 'Approve and Store' }))

    expect(
      await screen.findByText('Excuse letter approved and stored in the student record.'),
    ).toBeInTheDocument()
    expect(getRecordedAuditEntries().map((entry) => entry.actionType)).toEqual(['approve'])
  })
})
