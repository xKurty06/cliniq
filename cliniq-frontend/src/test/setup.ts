import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// The mock session remembers a previewed `?role=` per tab; don't let it leak between tests.
afterEach(() => {
  window.sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})
