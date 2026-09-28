import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { IncompleteRecordsQueuePage } from './IncompleteRecordsQueuePage'

vi.mock('./api/incompleteRecordsApi', () => ({
  fetchIncompleteRecords: () => new Promise(() => {}),
  markIncompleteRecordResolved: vi.fn(),
}))

describe('Incomplete Records Review Queue: first-load skeleton', () => {
  it('announces loading and shows shaped placeholders', () => {
    const { container } = render(<IncompleteRecordsQueuePage />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading incomplete records...')
    expect(container.querySelectorAll('[aria-hidden="true"] .animate-pulse').length).toBeGreaterThan(8)
    expect(container.querySelector('.animate-spin')).toBeNull()
  })
})
