import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

/**
 * Picks an option from the shared `Select` the way a user does: open the trigger, then choose from
 * its listbox. `option` is the option's value or its visible label.
 */
export async function selectOption(user: UserEvent, trigger: HTMLElement, option: string) {
  await user.click(trigger)
  await user.selectOptions(screen.getByRole('listbox'), option)
}
