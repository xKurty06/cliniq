import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearMockAuditEntries, getMockAuditEntries } from '../../lib/mocks/audit'
import { NewVisitEntryPage } from './NewVisitEntryPage'

describe('New Visit Entry', () => {
  beforeEach(() => clearMockAuditEntries())

  it('shows the identified student and reveals Smart Triage after complaint selection', async () => {
    const user = userEvent.setup()
    render(<NewVisitEntryPage />)

    expect(await screen.findByRole('heading', { name: 'New Visit Entry' })).toBeInTheDocument()
    expect(screen.getByText(/\d{4}-\d{5}/)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText(/complaint/i), 'Fever')
    expect(screen.getByRole('heading', { name: /suggested first-aid steps for: Fever/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Check temperature')).toBeInTheDocument()
  })

  it('validates required fields inline', async () => {
    const user = userEvent.setup()
    render(<NewVisitEntryPage />)

    await screen.findByRole('heading', { name: 'New Visit Entry' })
    await user.click(screen.getByRole('button', { name: 'Save Visit' }))
    expect(screen.getByText('Select the complaint for this visit.')).toBeInTheDocument()
    expect(screen.getByText('Enter the treatment or care given.')).toBeInTheDocument()
  })

  it('creates audit entries for visit submission and follow-up creation', async () => {
    const user = userEvent.setup()
    render(<NewVisitEntryPage />)

    await screen.findByRole('heading', { name: 'New Visit Entry' })
    await user.selectOptions(screen.getByLabelText(/complaint/i), 'Headache')
    await user.click(screen.getByLabelText('Check temperature'))
    await user.type(screen.getByLabelText(/treatment/i), 'Rested in clinic and hydrated.')
    await user.click(screen.getByLabelText(/this student needs a follow-up/i))
    await user.type(screen.getByLabelText(/reason/i), 'Recheck symptoms tomorrow')
    await user.click(screen.getByRole('button', { name: 'Save Visit' }))

    expect(await screen.findByText(/visit saved/i)).toBeInTheDocument()
    expect(screen.getByText(/pending follow-up was created/i)).toBeInTheDocument()
    expect(getMockAuditEntries().map((entry) => entry.actionType)).toEqual(['submit', 'create'])
  })

  it('uses a custom-styled complaint select instead of an unstyled native control', async () => {
    render(<NewVisitEntryPage />)

    await screen.findByRole('heading', { name: 'New Visit Entry' })
    const field = screen.getByLabelText(/complaint/i)
    expect(field).toHaveClass('appearance-none')
    expect(field).toHaveClass('cursor-pointer')
    expect(field.parentElement?.querySelector('svg')).toBeTruthy()
  })
})
