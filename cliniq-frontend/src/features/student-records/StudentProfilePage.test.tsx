import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StudentProfilePage } from './StudentProfilePage'

describe('Student Profile', () => {
  it('renders the full name for a deliberate single-student lookup', async () => {
    render(<StudentProfilePage />)

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/\w+ \w+/)
    expect(screen.getAllByText(/\d{4}-\d{5}/).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Medical History' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Visit History' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Incident History' })).toBeInTheDocument()
  })

  it('shows Staff actions, including print', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<StudentProfilePage />)

    expect(await screen.findByRole('button', { name: 'Edit' })).toBeInTheDocument()
    screen.getByRole('button', { name: 'Print' }).click()
    expect(print).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument()
  })

  it('removes action buttons for PE/Sports Instructor read-only view', async () => {
    render(<StudentProfilePage viewer={{ id: 'usr-pe', name: 'PE Instructor', role: 'instructor' }} />)

    expect(await screen.findByText(/read-only profile view/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Print' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })
})
