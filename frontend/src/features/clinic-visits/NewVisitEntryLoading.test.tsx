import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NewVisitEntryPage } from './NewVisitEntryPage'

vi.mock('./api/newVisitApi', () => ({
  fetchNewVisitContext: () => new Promise(() => {}),
}))

describe('New Visit Entry: first-load skeleton', () => {
  it('announces loading and shows shaped placeholders', () => {
    const { container } = render(<NewVisitEntryPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading visit form…')
    expect(container.querySelectorAll('[aria-hidden="true"] .animate-pulse').length).toBeGreaterThan(5)
    expect(container.querySelector('.animate-spin')).toBeNull()
  })
})
