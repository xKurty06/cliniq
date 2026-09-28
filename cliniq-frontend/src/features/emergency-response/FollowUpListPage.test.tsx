import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { clearMockAuditEntries, getMockAuditEntries } from '../../lib/mocks/audit'
import { getMockDataset } from '../../lib/mocks/dataset'
import { todayISO } from '../../lib/dates'
import { FollowUpListPage } from './FollowUpListPage'

describe('FollowUpListPage', () => {
  it('uses the linked Student Number and records completion as an audited update', async () => {
    clearMockAuditEntries()
    const user = userEvent.setup()
    render(<FollowUpListPage />)

    const firstFollowUp = getMockDataset(todayISO()).followUps[0]
    const studentNumber = getMockDataset(todayISO()).students.find(
      (student) => student.id === firstFollowUp.studentId,
    )?.studentNumber
    expect(await screen.findByText(studentNumber!)).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Mark completed' })[0])

    expect(getMockAuditEntries()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionType: 'update', targetRecord: expect.objectContaining({ type: 'follow-up' }) }),
      ]),
    )
  })
})
