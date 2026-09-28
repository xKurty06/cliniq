import { renderWithRouter } from '../test/renderWithRouter'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'
import { navGroupsFor } from './navigation'

describe('App Shell / Navigation', () => {
  it('shows Staff navigation groups across modules', () => {
    renderWithRouter(
      <AppShell user={{ id: 'user-staff-01', name: 'Liza Manalastas', role: 'staff' }} active="dashboard">
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
  })

  it('limits Admin/Principal navigation to Dashboard and Reports', () => {
    const groups = navGroupsFor('admin')
    expect(groups.flatMap((group) => group.items.map((item) => item.key))).toEqual([
      'dashboard',
      'reports',
    ])
  })

  it('gives PE/Sports Instructor no shell navigation groups', () => {
    expect(navGroupsFor('instructor')).toEqual([])
  })
})
