import { renderWithRouter } from '../test/renderWithRouter'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getRecordedAuditEntries } from '../lib/mock-db'
import { AppShell } from './AppShell'
import { navGroupsFor } from './navigation'

describe('App Shell / Navigation', () => {
  it('shows Staff navigation groups across modules', () => {
    renderWithRouter(
      <AppShell
        user={{ id: 'user-staff-01', name: 'Jennesse Baas', role: 'staff' }}
        active="dashboard"
        onLogout={() => {}}
      >
        <div>Screen</div>
      </AppShell>,
    )

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByText('Student Care')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getByText('Administration')).toBeInTheDocument()
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inventory' })).toHaveAttribute('href', '/inventory')
    expect(screen.getByText('Backup')).toBeInTheDocument()
    expect(screen.getAllByAltText('Healware logo')).toHaveLength(2)
    screen
      .getAllByAltText('Healware logo')
      .forEach((logo) => expect(logo).toHaveAttribute('src', '/Healware_Logo.png'))
  })

  it('puts an icon-only red logout action beside the signed-in user', () => {
    renderWithRouter(
      <AppShell
        user={{ id: 'user-staff-01', name: 'Jennesse Baas', role: 'staff' }}
        active="dashboard"
        onLogout={() => {}}
      >
        <div>Screen</div>
      </AppShell>,
    )

    expect(screen.getByRole('button', { name: 'Log out' })).toHaveClass('text-error')
  })

  it('offers the role-aware navigation from the mobile header', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <AppShell
        user={{ id: 'user-staff-01', name: 'Jennesse Baas', role: 'staff' }}
        active="dashboard"
        onLogout={() => {}}
      >
        <div>Screen</div>
      </AppShell>,
    )

    const opener = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(opener)
    const menu = screen.getByRole('navigation', { name: 'Mobile navigation' })
    expect(within(menu).getByRole('link', { name: 'Inventory' })).toHaveAttribute('href', '/inventory')

    await user.click(within(menu).getByRole('link', { name: 'Students' }))
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('audits logout before ending the current session', async () => {
    const onLogout = vi.fn()
    const user = userEvent.setup()
    renderWithRouter(
      <AppShell
        user={{ id: 'user-staff-01', name: 'Jennesse Baas', role: 'staff' }}
        active="dashboard"
        onLogout={onLogout}
      >
        <div>Screen</div>
      </AppShell>,
    )

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    await waitFor(() => expect(onLogout).toHaveBeenCalledOnce())
    expect(getRecordedAuditEntries()).toEqual([
      expect.objectContaining({ actionType: 'logout', userId: 'user-staff-01', targetRecord: null }),
    ])
  })

  it('limits Admin/Principal navigation to Dashboard, Reports, and Audit Log', () => {
    const groups = navGroupsFor('admin')
    expect(groups.flatMap((group) => group.items.map((item) => item.key))).toEqual([
      'dashboard',
      'reports',
      'auditLog',
    ])
  })

  it('gives PE/Sports Instructor no shell navigation groups', () => {
    expect(navGroupsFor('instructor')).toEqual([])
  })
})
