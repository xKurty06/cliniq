import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QrScannerView } from './QrScannerView'

describe('QrScannerView', () => {
  it('uses the manual Student Number fallback', async () => {
    const user = userEvent.setup()
    const onDetected = vi.fn()
    render(
      <QrScannerView
        title="Identify student"
        description="Shared scanner"
        onDetected={onDetected}
      />,
    )

    await user.type(screen.getByLabelText(/enter student number manually/i), '2026-00001')
    await user.click(screen.getByRole('button', { name: 'Look up student' }))
    expect(onDetected).toHaveBeenCalledWith('2026-00001')
  })

  it('offers a demo scan for frontend previewing', async () => {
    const user = userEvent.setup()
    const onDetected = vi.fn()
    render(
      <QrScannerView
        title="Identify student"
        description="Shared scanner"
        onDetected={onDetected}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Use demo scan' }))
    expect(onDetected).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{5}$/))
  })
})
