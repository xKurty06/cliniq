import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { getRecordedAuditEntries, getStudent, listIncidents, resetMockDb } from '../../lib/mock-db'
import { IncidentEntryPage } from './IncidentEntryPage'

const STUDENT = '2026-00001'

describe('Incident Entry', () => {
  beforeEach(() => resetMockDb())

  it('starts as Stage 1 fast capture with visible status', async () => {
    render(<IncidentEntryPage studentNumber={STUDENT} />)

    expect(await screen.findByRole('heading', { name: 'Incident Entry' })).toBeInTheDocument()
    expect(screen.getByText('Needs completion')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stage 1 fast capture' })).toBeInTheDocument()
    expect(screen.getByText(/\d{4}-\d{5}/)).toBeInTheDocument()
  })

  it('validates Stage 1 essentials inline', async () => {
    const user = userEvent.setup()
    render(<IncidentEntryPage />)

    await screen.findByRole('heading', { name: 'Incident Entry' })
    await user.click(screen.getByRole('button', { name: 'Save Stage 1' }))
    expect(screen.getByText('Select the emergency complaint.')).toBeInTheDocument()
    expect(screen.getByText('Enter the temperature.')).toBeInTheDocument()
    expect(screen.getByText('Enter the pulse.')).toBeInTheDocument()
  })

  it('saves Stage 1, then completes Stage 2 with audit entries', async () => {
    const user = userEvent.setup()
    render(<IncidentEntryPage studentNumber={STUDENT} />)

    await screen.findByRole('heading', { name: 'Incident Entry' })
    await user.selectOptions(screen.getByLabelText(/complaint/i), 'Fainting')
    await user.type(screen.getByLabelText(/temperature/i), '37.2')
    await user.type(screen.getByLabelText(/pulse/i), '92')
    await user.click(screen.getByRole('button', { name: 'Save Stage 1' }))

    expect(await screen.findByText(/stage 1 saved/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stage 2 completion' })).toBeInTheDocument()
    expect(getRecordedAuditEntries().map((entry) => entry.actionType)).toEqual(['submit'])

    await user.type(screen.getByLabelText(/blood pressure/i), '120/80')
    await user.type(screen.getByLabelText(/oxygen saturation/i), '98%')
    await user.type(screen.getByLabelText(/treatment notes/i), 'Student observed and stabilized.')
    await user.type(screen.getByLabelText(/attempt note/i), 'Guardian answered and will arrive.')
    await user.click(screen.getByRole('button', { name: 'Add attempt' }))
    await user.click(screen.getByLabelText(/this incident needs a follow-up/i))
    await user.type(screen.getByLabelText(/reason/i), 'Check after rest period')
    await user.click(screen.getByRole('button', { name: 'Complete Incident' }))

    expect(await screen.findByText(/incident completed/i)).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(getRecordedAuditEntries().map((entry) => entry.actionType)).toEqual([
      'submit',
      'update',
      'create',
      'create',
    ])
  })

  it('uses a custom-styled complaint select', async () => {
    render(<IncidentEntryPage />)

    await screen.findByRole('heading', { name: 'Incident Entry' })
    const field = screen.getByLabelText(/complaint/i)
    expect(field).toHaveClass('appearance-none')
    expect(field).toHaveClass('cursor-pointer')
    expect(field.parentElement?.querySelector('svg')).toBeTruthy()
  })

  it('asks for the Student Number when the Emergency button opened it without a student', async () => {
    const user = userEvent.setup()
    render(<IncidentEntryPage />)

    await screen.findByRole('heading', { name: 'Incident Entry' })
    expect(screen.getByText(/student not identified yet/i)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText(/complaint/i), 'Fainting')
    await user.type(screen.getByLabelText(/temperature/i), '37.2')
    await user.type(screen.getByLabelText(/pulse/i), '92')
    await user.click(screen.getByRole('button', { name: 'Save Stage 1' }))
    expect(screen.getByText('Enter the Student Number (YYYY-NNNNN).')).toBeInTheDocument()
    expect(getRecordedAuditEntries()).toEqual([])

    await user.type(screen.getByLabelText(/student number/i), '209999999')
    await user.click(screen.getByRole('button', { name: 'Save Stage 1' }))
    expect(await screen.findByText(/no student has this student number/i)).toBeInTheDocument()
    expect(getRecordedAuditEntries()).toEqual([])

    await user.clear(screen.getByLabelText(/student number/i))
    await user.type(screen.getByLabelText(/student number/i), STUDENT.replace('-', ''))
    await user.click(screen.getByRole('button', { name: 'Save Stage 1' }))
    expect(await screen.findByText(/stage 1 saved/i)).toBeInTheDocument()
    const student = await getStudent(STUDENT)
    expect(screen.getByText(new RegExp(student.fullName))).toBeInTheDocument()
    const saved = (await listIncidents()).find((incident) => incident.studentId === student.id && incident.complaint === 'Fainting' && incident.stage === 1)
    expect(saved).toBeTruthy()
  })

  it('reopens a saved Stage 1 incident directly at Stage 2', async () => {
    const stageOne = (await listIncidents()).find((incident) => incident.stage === 1)
    expect(stageOne).toBeTruthy()
    render(<IncidentEntryPage incidentId={stageOne!.id} />)

    expect(await screen.findByRole('heading', { name: 'Stage 2 completion' })).toBeInTheDocument()
    expect(screen.getAllByText(stageOne!.complaint).length).toBeGreaterThan(0)
    expect(screen.queryByLabelText(/student number/i)).not.toBeInTheDocument()
  })
})
