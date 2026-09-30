import { describe, expect, it } from 'vitest'
import { normalizeStudentNumber } from './QrScannerView'

describe('normalizeStudentNumber', () => {
  it('inserts the Student Number dash for manual entry and scanner values', () => {
    expect(normalizeStudentNumber('202600001')).toBe('2026-00001')
    expect(normalizeStudentNumber('2026-00001')).toBe('2026-00001')
  })

  it('keeps deletion and partial entry usable', () => {
    expect(normalizeStudentNumber('2026-')).toBe('2026')
    expect(normalizeStudentNumber('202')).toBe('202')
  })
})
