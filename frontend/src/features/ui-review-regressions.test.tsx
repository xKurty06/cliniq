import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithRouter } from '../test/renderWithRouter'
import { getGradeLevels, getRecordedAuditEntries, getStudent, listIncidents, listVisits, resetMockDb } from '../lib/mock-db'
import { StudentProfilePage } from './student-records/StudentProfilePage'
import { IncidentReportPage } from './emergency-response/IncidentReportPage'
import { UserFormPage } from './user-management/UserFormPage'
import { VisitLogListPage } from './clinic-visits/VisitLogListPage'

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
