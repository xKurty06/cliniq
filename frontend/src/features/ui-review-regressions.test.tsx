import { act, renderHook, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '../test/renderWithRouter'
import { getGradeLevels, getRecordedAuditEntries, getStudent, listIncidents, listVisits, resetMockDb } from '../lib/mock-db'
import { StudentProfilePage } from './student-records/StudentProfilePage'
import { IncidentReportPage } from './emergency-response/IncidentReportPage'
import { UserFormPage } from './user-management/UserFormPage'
import { VisitLogListPage } from './clinic-visits/VisitLogListPage'
import { useAsyncData } from '../hooks/useAsyncData'
import { QrMobileHubPage } from './qr-digital-health-id/mobile/QrMobileHubPage'
import { Button, Modal } from '../components'
import { AppShell } from '../layouts/AppShell'

/**
 * Regressions from the interaction-based UI/UX review (Wednesday, September 30, 2026). Each case
 * reproduces a problem found by clicking through the running app.
 */
describe('UI/UX review regressions', () => {
  beforeEach(() => resetMockDb())

  it('archives a student only after a confirmation step, then shows the archived badge', async () => {
    const user = userEvent.setup()
    renderWithRouter(<StudentProfilePage studentNumber="2026-00001" />)

    await user.click(await screen.findByRole('button', { name: 'Archive' }))
    const dialog = screen.getByRole('dialog', { name: 'Archive this student record?' })
    expect(getRecordedAuditEntries()).toEqual([])

    await user.click(within(dialog).getByRole('button', { name: 'Archive record' }))
    expect(await screen.findByText('Archived')).toBeInTheDocument()
    expect((await getStudent('2026-00001')).archived).toBe(true)
    expect(getRecordedAuditEntries().map((entry) => entry.actionType)).toEqual(['archive'])
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })

  it('labels incident vitals in plain language and confirms report approval', async () => {
    const user = userEvent.setup()
    const [incident] = await listIncidents()
    renderWithRouter(<IncidentReportPage incidentId={incident.id} />)

    await screen.findByRole('heading', { name: 'Incident Report' })
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.queryByText('temperatureC')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Approve report' }))
    const dialog = screen.getByRole('dialog', { name: 'Approve this incident report?' })
    expect(getRecordedAuditEntries()).toEqual([])
    await user.click(within(dialog).getByRole('button', { name: 'Approve report' }))
    expect(await screen.findByText('Report approved and logged.')).toBeInTheDocument()
    expect(getRecordedAuditEntries().map((entry) => entry.actionType)).toEqual(['approve'])
  })

  it('explains empty required fields on the user form instead of ignoring the submit', async () => {
    const user = userEvent.setup()
    renderWithRouter(<UserFormPage />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Add user' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Create user' }))
    expect(screen.getByText("Enter the person's full name.")).toBeInTheDocument()
    expect(screen.getByText('Enter a username for this account.')).toBeInTheDocument()
    expect(getRecordedAuditEntries()).toEqual([])
  })

  it('paginates the visit log and reaches every visit, not only the first 120', async () => {
    const user = userEvent.setup()
    const total = (await listVisits()).length
    renderWithRouter(<VisitLogListPage />)

    expect(await screen.findByText(`${total} records shown`)).toBeInTheDocument()
    expect(screen.getByText(`Showing 1–10 of ${total} visits`)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText(`Showing 11–20 of ${total} visits`)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Search'), '2026')
    expect(await screen.findByText(/^Showing 1–/)).toBeInTheDocument()
  })
})

describe('grade-level order', () => {
  it('lists Kinder before Grade 1', async () => {
    const levels = await getGradeLevels()
    expect(levels[0]).toBe('Kinder')
    expect(levels.indexOf('Grade 2')).toBeLessThan(levels.indexOf('Grade 10'))
  })
})

/** Group A fixes from the follow-up session (Wednesday, September 30, 2026). */
describe('UI/UX review follow-up fixes', () => {
  beforeEach(() => resetMockDb())

  function ModalHarness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Modal open={open} title="Confirm" onClose={() => setOpen(false)}>
          <Button data-autofocus onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </Modal>
      </>
    )
  }

  it('moves focus into the dialog, keeps Tab inside it, and returns focus on close', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ModalHarness />)
    const opener = screen.getByRole('button', { name: 'Open dialog' })

    await user.click(opener)
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('rejects a username another account already uses, case-insensitively', async () => {
    const user = userEvent.setup()
    renderWithRouter(<UserFormPage />)

    await screen.findByRole('heading', { level: 1, name: 'Add user' })
    await user.type(screen.getByLabelText(/full name/i), 'Test Person')
    await user.type(screen.getByLabelText(/username/i), 'Demo.Nurse')
    await user.click(screen.getByRole('button', { name: 'Create user' }))

    expect(await screen.findByText('Another account already uses this username. Choose a different one.')).toBeInTheDocument()
    expect(screen.queryByText('User saved and audit event recorded.')).not.toBeInTheDocument()
    expect(getRecordedAuditEntries()).toEqual([])
  })

  it('keeps loaded data on screen while reload() re-fetches (no skeleton flash after a save)', async () => {
    let resolveSecond: (value: string) => void = () => {}
    const loader = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('first')
      .mockImplementationOnce(() => new Promise((resolve) => (resolveSecond = resolve)))
    const { result } = renderHook(() => useAsyncData('notification-log', loader))
    await waitFor(() => expect(result.current.data).toBe('first'))

    act(() => result.current.reload())
    expect(result.current.data).toBe('first')
    expect(result.current.isRefetching).toBe(true)

    await act(async () => resolveSecond('second'))
    expect(result.current.data).toBe('second')
    expect(result.current.isRefetching).toBe(false)
  })

  it('clears a previous "Student not found" message when a camera scan starts', async () => {
    const user = userEvent.setup()
    renderWithRouter(<QrMobileHubPage />)

    await user.type(screen.getByLabelText(/enter student number manually/i), '209999999')
    await user.click(screen.getByRole('button', { name: 'Look up student' }))
    expect(await screen.findByText('Student not found.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Scan QR Code' }))
    expect(screen.queryByText('Student not found.')).not.toBeInTheDocument()
  })

  it('does not expose sidebar nav groups as landmark regions', () => {
    renderWithRouter(
      <AppShell user={{ id: 'user-staff-01', name: 'Jennesse Baas', role: 'staff' }} active="dashboard" onLogout={() => {}}>
        <div>Screen</div>
      </AppShell>,
    )
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).queryAllByRole('region')).toHaveLength(0)
    expect(within(nav).getByRole('group', { name: 'Overview' })).toBeInTheDocument()
  })
})
