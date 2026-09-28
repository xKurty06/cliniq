import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { todayISO } from '../lib/dates'
import { getMockDataset } from '../lib/mocks/dataset'
import type { SessionUser } from '../lib/mocks/session'
import { AppRoutes } from './AppRoutes'

// jsdom has no canvas. Replace the chart with a stub that keeps its accessible label.
vi.mock('react-chartjs-2', () => {
  const Stub = (props: { 'aria-label'?: string }) => (
    <div role="img" aria-label={props['aria-label']} />
  )
  return { Bar: Stub, Line: Stub }
})

const STAFF: SessionUser = { id: 'usr-nurse', name: 'Ms. Jenne Baas', role: 'staff' }
const ADMIN: SessionUser = { id: 'usr-principal', name: 'Principal', role: 'admin' }
const INSTRUCTOR: SessionUser = { id: 'usr-pe', name: 'PE Instructor', role: 'instructor' }

function CurrentPath() {
  const location = useLocation()
  return <output data-testid="path">{location.pathname + location.search}</output>
}

function renderAt(route: string, user: SessionUser = STAFF) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppRoutes user={user} />
      <CurrentPath />
    </MemoryRouter>,
  )
}

describe('App routes', () => {
  it('opens a screen by path inside the shell and marks its nav item current', async () => {
    renderAt('/students')

    expect(await screen.findByRole('heading', { name: 'Student List' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Students' })).toHaveAttribute('aria-current', 'page')
  })

  it('navigates between screens from the sidebar without a page reload', async () => {
    const user = userEvent.setup()
    renderAt('/students')
    await screen.findByRole('heading', { name: 'Student List' })

    await user.click(screen.getByRole('link', { name: 'Visits' }))

    expect(await screen.findByRole('heading', { name: 'Visit Log List' })).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('/visits')
  })

  it('opens the Staff incident log from sidebar navigation', async () => {
    const user = userEvent.setup()
    renderAt('/students')
    await screen.findByRole('heading', { name: 'Student List' })
    await user.click(screen.getByRole('link', { name: 'Incidents' }))
    expect(await screen.findByRole('heading', { name: 'Incident Log List' })).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('/incidents')
  })

  it('resolves the student from the /students/:studentNumber segment', async () => {
    const student = getMockDataset(todayISO()).students.find((s) => !s.archived)!
    renderAt(`/students/${student.studentNumber}`)

    expect(await screen.findByRole('heading', { name: student.fullName })).toBeInTheDocument()
  })

  it('shows an error, not a different student, for an unknown Student Number', async () => {
    renderAt('/students/1999-99999')

    expect(await screen.findByText('Unable to load the student profile.')).toBeInTheDocument()
  })

  it('redirects Admin/Principal away from Staff-only screens to the Dashboard', async () => {
    renderAt('/students', ADMIN)

    expect(await screen.findByRole('heading', { name: 'Clinic Overview' })).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/)
  })

  it('sends the PE/Sports Instructor to the read-only QR lookup, with no shell', async () => {
    renderAt('/', INSTRUCTOR)

    expect(await screen.findByRole('heading', { name: 'Instructor Lookup' })).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('/qr/scan')
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
  })

  it('shows a not-found screen for an unknown path', async () => {
    renderAt('/nope')

    expect(screen.getByText("This page doesn't exist.")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to home screen' })).toHaveAttribute('href', '/')
  })
})
