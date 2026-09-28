import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReportsPage } from './ReportsPage'
import { getMockDataset } from '../../lib/mocks/dataset'
import { todayISO } from '../../lib/dates'

describe('Reports', () => {
  it('switches between print-friendly report views', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<ReportsPage viewer={{ id: 'usr-nurse', name: 'Nurse', role: 'staff' }} />)
    expect(screen.getByRole('heading', { name: 'Monthly Report' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Incident archive' }))
    expect(screen.getByRole('heading', { name: 'Incident Report Archive' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Health summaries' }))
    expect(screen.getByRole('heading', { name: 'Health Summaries' })).toBeInTheDocument()
  })

  it('uses the linked student’s actual Student Number in the incident archive', async () => {
    const user = userEvent.setup()
    render(<ReportsPage viewer={{ id: 'usr-nurse', name: 'Nurse', role: 'staff' }} />)
    await user.click(screen.getByRole('tab', { name: 'Incident archive' }))
    const incident = getMockDataset(todayISO()).incidents.find((item) => item.time.startsWith(todayISO().slice(0, 7)))!
    const student = getMockDataset(todayISO()).students.find((item) => item.id === incident.studentId)!
    const archive = screen.getByRole('table', { name: 'Incident report archive' })
    expect(within(archive).getByText(student.studentNumber)).toBeInTheDocument()
  })
})
