import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { VisitDetailPage } from './VisitDetailPage'

vi.mock('./api/visitDetailApi', () => ({
  fetchVisitDetail: () => new Promise(() => {}),
  updateVisitDetail: vi.fn(),
  valuesFromVisit: vi.fn(),
}))

describe('Visit Detail/Edit: first-load skeleton', () => {
  it('announces loading and shows shaped placeholders', () => {
    const { container } = render(<VisitDetailPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading visit detail...')
    expect(container.querySelectorAll('[aria-hidden="true"] .animate-pulse').length).toBeGreaterThan(8)
    expect(container.querySelector('.animate-spin')).toBeNull()
  })
})
