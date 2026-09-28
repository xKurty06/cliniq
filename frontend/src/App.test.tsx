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

describe('demo sign-in prototype', () => {
  it('lets the presenter choose a mock user after logging out', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(screen.getByRole('heading', { name: 'You have logged out' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continue as Admin / Principal' }))

    expect(screen.getByText('Signed in as admin')).toBeInTheDocument()
  })
})
