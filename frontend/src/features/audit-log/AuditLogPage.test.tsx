import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { getRecordedAuditEntries, listStudents } from '../../lib/mock-db'
import { AuditLogPage } from './AuditLogPage'

const STAFF = { id: 'user-staff-01', name: 'Jennesse Baas', role: 'staff' } as const

function renderPage() {
  return render(<MemoryRouter><AuditLogPage viewer={STAFF} /></MemoryRouter>)
}

describe('Audit Log', () => {
  it('shows a paginated, newest-first privacy-safe audit list', async () => {
    renderPage()
    const table = await screen.findByRole('table', { name: 'Filtered audit log' })
    const student = (await listStudents({ includeArchived: true })).find((item) => item.id === 'student-0006')!

    expect(within(table).getAllByRole('row')[1]).toHaveTextContent(student.studentNumber)
    expect(within(table).getAllByRole('row')[1]).not.toHaveTextContent(student.fullName)
    expect(within(table).queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument()
    expect(screen.getByText(/Showing 1–10 of/)).toBeInTheDocument()
  })

  it('filters entries by the resolved account name', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('table', { name: 'Filtered audit log' })

    await user.selectOptions(screen.getByLabelText('User'), 'user-admin-01')

    await screen.findByText(/7 entries shown/)
    const [table] = screen.getAllByRole('table', { name: 'Filtered audit log' })
    expect(within(table).getAllByText('Gilan Avelida')).toHaveLength(7)
  })

  it('filters action types through the multi-select control', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('table', { name: 'Filtered audit log' })

    await user.click(screen.getByRole('button', { name: /action type all actions/i }))
    await user.click(screen.getByRole('checkbox', { name: 'Archive' }))
    await user.click(screen.getByRole('button', { name: /action type 1 selected/i }))

    await screen.findByText(/2 entries shown/)
    const [table] = screen.getAllByRole('table', { name: 'Filtered audit log' })
    expect(within(table).getAllByText('Archive')).toHaveLength(2)
    expect(within(table).queryByText('Login')).not.toBeInTheDocument()
  })

  it('moves through audit pages without rendering the full list at once', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('table', { name: 'Filtered audit log' })

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument()
    expect(screen.getByText(/Showing 11–20 of/)).toBeInTheDocument()
  })

  it('prints the current filtered view without writing another audit event', async () => {
    const user = userEvent.setup()
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const auditCountBefore = getRecordedAuditEntries().length
    renderPage()
    await screen.findByRole('table', { name: 'Filtered audit log' })

    await user.click(screen.getByRole('button', { name: 'Print / Save as PDF' }))

    expect(print).toHaveBeenCalledOnce()
    expect(getRecordedAuditEntries()).toHaveLength(auditCountBefore)
  })
})
