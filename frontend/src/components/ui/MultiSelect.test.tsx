import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MultiSelect } from './MultiSelect'

describe('MultiSelect', () => {
  it('puts the all-values option first and selects it by default', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <MultiSelect
        label="Action type"
        values={[]}
        options={[{ value: 'archive', label: 'Archive' }]}
        allLabel="All actions"
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /action type all actions/i }))
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toHaveAccessibleName('All actions')
    expect(checkboxes[0]).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Archive' })).not.toBeChecked()
  })

  it('clears selected values when all is chosen', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <MultiSelect
        label="Action type"
        values={['archive']}
        options={[{ value: 'archive', label: 'Archive' }]}
        allLabel="All actions"
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /action type 1 selected/i }))
    await user.click(screen.getByRole('checkbox', { name: 'All actions' }))
    expect(onChange).toHaveBeenCalledWith([])
  })
})
