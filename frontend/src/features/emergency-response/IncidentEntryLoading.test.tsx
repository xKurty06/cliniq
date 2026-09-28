import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { IncidentEntryPage } from './IncidentEntryPage'

vi.mock('./api/incidentEntryApi', () => ({
  fetchIncidentEntryContext: () => new Promise(() => {}),
}))

describe('Incident Entry: first-load skeleton', () => {
  it('announces loading and shows shaped placeholders', () => {
    const { container } = render(<IncidentEntryPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading incident form…')
    expect(container.querySelectorAll('[aria-hidden="true"] .animate-pulse').length).toBeGreaterThanOrEqual(5)
    expect(container.querySelector('.animate-spin')).toBeNull()
  })
})
