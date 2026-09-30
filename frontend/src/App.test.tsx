import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./routes/AppRoutes', () => ({
  AppRoutes: ({ onLogout, user }: { onLogout: () => void; user: { role: string } }) => (
    <>
      <p>Signed in as {user.role}</p>
      <button type="button" onClick={onLogout}>Log out</button>
    </>
  ),
}))

vi.mock('./components/KeyboardShortcuts', () => ({ KeyboardShortcuts: () => null }))

describe('app logout flow', () => {
  it('redirects to the Login screen after logging out', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(window.location.pathname).toBe('/login')
  })
})
