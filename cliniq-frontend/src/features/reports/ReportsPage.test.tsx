import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReportsPage } from './ReportsPage'

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
})
