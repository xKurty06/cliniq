import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'

/** Renders a screen inside an in-memory router, for screens that render router `<Link>`s. */
export function renderWithRouter(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
