import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import {
  getRecordedAuditEntries,
  listIssueReports,
  resetMockDb,
  type SessionUser,
} from '../../lib/mock-db'
import { ReportIssueModal } from './ReportIssueModal'

const STAFF: SessionUser = { id: 'user-staff-01', name: 'Jennesse Baas', role: 'staff' }

describe('ReportIssueModal', () => {
  it('captures page context, saves the report, opens mailto, and closes', async () => {
    resetMockDb()
    document.title = 'CLINIQ — Reports'
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSubmitted = vi.fn()
    const open = vi.spyOn(window, 'open').mockReturnValue({} as Window)

    render(
      <MemoryRouter initialEntries={['/reports']}>
        <ReportIssueModal open user={STAFF} onClose={onClose} onSubmitted={onSubmitted} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('/reports')).toBeInTheDocument()
    expect(screen.getByText('School Clinician')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox'), 'The report table is hard to read.')
    await user.click(screen.getByRole('button', { name: 'Submit report' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(onSubmitted).toHaveBeenCalledWith(true)
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('mailto:team@example.com'),
      '_blank',
      'noopener,noreferrer',
    )
    expect((await listIssueReports())[0]).toMatchObject({
      description: 'The report table is hard to read.',
      route: '/reports',
      pageName: 'Reports',
      role: 'staff',
    })
    expect(getRecordedAuditEntries()).toEqual([
      expect.objectContaining({
        actionType: 'create',
        targetRecord: { type: 'issue-report', id: 'issue-report-0001' },
      }),
    ])

    open.mockRestore()
  })
})
