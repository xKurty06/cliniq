import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PeSportsReferralPage } from './PeSportsReferralPage'

vi.mock('./api/peReferralApi', () => ({
  fetchPeReferralContext: () => new Promise(() => {}),
  submitPeReferral: vi.fn(),
}))

describe('PE/Sports Injury Referral Form: first-load skeleton', () => {
  it('announces loading and shows shaped placeholders', () => {
    const { container } = render(<PeSportsReferralPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading PE/Sports referral...')
    expect(container.querySelectorAll('[aria-hidden="true"] .animate-pulse').length).toBeGreaterThan(6)
    expect(container.querySelector('.animate-spin')).toBeNull()
  })
})
