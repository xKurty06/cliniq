import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getRecordedAuditEntries, resetMockDb } from '../../lib/mock-db'
import { listFollowUps } from '../../lib/mock-db'
import { FollowUpListPage } from './FollowUpListPage'

describe('FollowUpListPage', () => {
  it('uses the linked Student Number and records completion as an audited update', async () => {
    resetMockDb()
    const user = userEvent.setup()
    render(<FollowUpListPage />)

    const [firstFollowUp] = await listFollowUps()
    expect((await screen.findAllByText(firstFollowUp.studentNumber)).length).toBeGreaterThan(0)
    await user.click(screen.getAllByRole('button', { name: 'Mark completed' })[0])

    expect(getRecordedAuditEntries()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionType: 'update', targetRecord: expect.objectContaining({ type: 'follow-up' }) }),
      ]),
    )
  })
})
