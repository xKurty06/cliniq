import { describe, expect, it } from 'vitest'
import { cleanComplaint, COMPLAINT_MAX_LENGTH, normalizeComplaint } from './complaints'

describe('complaint normalization', () => {
  it('trims, collapses spaces, and caps the length', () => {
    expect(cleanComplaint('  sore   throat \t')).toBe('sore throat')
    expect(cleanComplaint('   ')).toBe('')
    expect(cleanComplaint('x'.repeat(80))).toHaveLength(COMPLAINT_MAX_LENGTH)
  })

  it('stores a known suggestion in its own spelling', () => {
    const known = ['Headache', 'Cough and colds']
    expect(normalizeComplaint(' headache ', known)).toBe('Headache')
    expect(normalizeComplaint('COUGH  and colds', known)).toBe('Cough and colds')
    expect(normalizeComplaint('Nosebleed', known)).toBe('Nosebleed')
  })
})
