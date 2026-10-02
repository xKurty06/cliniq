import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('lets a password be shown and hidden again without losing it', async () => {
    const user = userEvent.setup()
    render(<Input label="Password" type="password" defaultValue="secret-pass" />)
    const field = screen.getByLabelText('Password')
    const toggle = screen.getByRole('button', { name: 'Show password' })

    expect(field).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle).toHaveAttribute('type', 'button')

    await user.click(toggle)
    expect(field).toHaveAttribute('type', 'text')
    expect(field).toHaveValue('secret-pass')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await user.click(toggle)
    expect(field).toHaveAttribute('type', 'password')
  })

  it('adds no reveal control or wrapper to a plain text field', () => {
    const { container } = render(<Input label="Username" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('draws a decorative leading icon that leaves the label as the field name', () => {
    const { container } = render(<Input label="Username" icon="user" />)
    expect(screen.getByRole('textbox', { name: 'Username' })).toHaveClass('pl-9')
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
