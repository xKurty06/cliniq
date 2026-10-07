import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { getLatestVisit, getRecordedAuditEntries, resetMockDb } from '../../lib/mock-db'
import { renderWithRouter } from '../../test/renderWithRouter'
import { NewVisitEntryPage } from './NewVisitEntryPage'

const complaintField = () => screen.getByRole('combobox', { name: /complaint/i })

describe('New Visit', () => {
  beforeEach(() => resetMockDb())

  it('shows the identified student and reveals Smart Triage for a case-insensitive complaint match', async () => {
    const user = userEvent.setup()
    render(<NewVisitEntryPage studentNumber="2026-00001" />)

    expect(await screen.findByRole('heading', { name: 'New Visit' })).toBeInTheDocument()
    expect(screen.getByText(/\d{4}-\d{5}/)).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /student/i })).not.toBeInTheDocument()
    await user.type(complaintField(), 'fever')
    expect(screen.getByRole('heading', { name: /suggested first-aid steps for: Fever/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Check temperature')).toBeInTheDocument()
  })

  it('validates required fields inline, and whitespace is not a complaint', async () => {
    const user = userEvent.setup()
    render(<NewVisitEntryPage studentNumber="2026-00001" />)

    await screen.findByRole('heading', { name: 'New Visit' })
    await user.type(complaintField(), '   ')
    await user.click(screen.getByRole('button', { name: 'Save Visit' }))
    expect(screen.getByText('Enter the complaint for this visit.')).toBeInTheDocument()
    expect(screen.getByText('Enter treatment notes or add a medicine or supply.')).toBeInTheDocument()
  })

  it('creates audit entries for visit submission and follow-up creation', async () => {
    const user = userEvent.setup()
    render(<NewVisitEntryPage studentNumber="2026-00001" />)

    await screen.findByRole('heading', { name: 'New Visit' })
    await user.click(complaintField())
    await user.click(screen.getByRole('option', { name: 'Headache' }))
    await user.click(screen.getByLabelText('Check temperature'))
    await user.type(screen.getByLabelText(/treatment/i), 'Rested in clinic and hydrated.')
    await user.click(screen.getByLabelText(/this student needs a follow-up/i))
    await user.type(screen.getByLabelText(/reason/i), 'Recheck symptoms tomorrow')
    await user.click(screen.getByRole('button', { name: 'Save Visit' }))

    expect(await screen.findByText(/visit saved/i)).toBeInTheDocument()
    expect(screen.getByText(/pending follow-up was created/i)).toBeInTheDocument()
    expect(getRecordedAuditEntries().map((entry) => entry.actionType)).toEqual(['submit', 'create'])
  })

  it('suggests complaints as you type, at most 8, and saves free text with no checklist', async () => {
    const user = userEvent.setup()
    render(<NewVisitEntryPage studentNumber="2026-00001" />)

    await screen.findByRole('heading', { name: 'New Visit' })
    await user.click(complaintField())
    expect(screen.getAllByRole('option')).toHaveLength(8)
    await user.type(complaintField(), 'ache')
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(
      expect.arrayContaining(['Headache', 'Stomachache', 'Toothache']),
    )
    await user.clear(complaintField())
    await user.type(complaintField(), '  Nose   bleed ')
    expect(screen.queryByRole('heading', { name: /suggested first-aid steps/i })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText(/treatment/i), 'Pinched nose, leaned forward.')
    await user.click(screen.getByRole('button', { name: 'Save Visit' }))

    expect(await screen.findByText(/visit saved/i)).toBeInTheDocument()
    expect((await getLatestVisit()).complaint).toBe('Nose bleed')
  })

  it('stores a typed complaint in its suggestion spelling', async () => {
    const user = userEvent.setup()
    render(<NewVisitEntryPage studentNumber="2026-00001" />)

    await screen.findByRole('heading', { name: 'New Visit' })
    await user.type(complaintField(), 'headache{Escape}')
    await user.type(screen.getByLabelText(/treatment/i), 'Rested.')
    await user.click(screen.getByRole('button', { name: 'Save Visit' }))

    expect(await screen.findByText(/visit saved/i)).toBeInTheDocument()
    expect((await getLatestVisit()).complaint).toBe('Headache')
  })
})

describe('New Visit student lookup', () => {
  beforeEach(() => resetMockDb())

  it('lists nothing before 2 characters, then finds by name and shows number, name, and grade', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NewVisitEntryPage />)

    const field = await screen.findByRole('combobox', { name: /student/i })
    await user.type(field, 'q')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await user.type(field, 'uizon')
    const option = await screen.findByRole('option', { name: /2026-00001.*Gian Quizon/ })
    expect(option).toHaveTextContent("Kinder")
    await user.click(option)

    const changeButton = await screen.findByRole('button', { name: /change student \(Gian Quizon\)/i })
    expect(within(changeButton.parentElement!).getByText('2026-00001')).toBeInTheDocument()
    await user.click(changeButton)
    expect(screen.getByRole('combobox', { name: /student/i })).toHaveFocus()
  })

  it('picks with Enter after a complete Student Number, keyboard only', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NewVisitEntryPage />)

    await user.click(await screen.findByRole('combobox', { name: /student/i }))
    await user.keyboard('2026-00001')
    await screen.findByRole('option', { name: /Gian Quizon/ })
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('button', { name: /change student/i })).toBeInTheDocument()
  })

  it('finds a Student Number typed without its dash, leaves the text as typed, and picks on Enter', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NewVisitEntryPage />)

    const field = await screen.findByRole('combobox', { name: /student/i })
    await user.type(field, '202600001')
    expect(field).toHaveValue('202600001')
    await screen.findByRole('option', { name: /2026-00001.*Gian Quizon/ })
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('button', { name: /change student \(Gian Quizon\)/i })).toBeInTheDocument()
  })

  it('says when nothing matches and offers Staff a link to add the student', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NewVisitEntryPage />)

    await user.type(await screen.findByRole('combobox', { name: /student/i }), 'zzzz')
    expect(await screen.findByText(/no active student matches/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add a student/i })).toHaveAttribute('href', '/students/new')
  })

  it('asks for a pick before saving', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NewVisitEntryPage />)

    await screen.findByRole('combobox', { name: /student/i })
    await user.click(screen.getByRole('button', { name: 'Save Visit' }))
    expect(screen.getByText(/choose the student/i)).toBeInTheDocument()
  })
})
