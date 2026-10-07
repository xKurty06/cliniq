import { beforeEach, describe, expect, it } from 'vitest'
import {
  approveExcuseLetter,
  excusedPeriodError,
  getExcuseLetterApproval,
  getStudentExcuseLetters,
  getVisit,
  resetMockDb,
} from '../../lib/mock-db'
import { fetchExcuseLetterContext } from './api/excuseLetterApi'

describe('Excused period', () => {
  beforeEach(() => resetMockDb())

  it('requires both dates and rejects "until" before "from"', () => {
    expect(excusedPeriodError({ excusedFrom: '2026-10-03', excusedUntil: '2026-10-05' })).toBeNull()
    expect(excusedPeriodError({ excusedFrom: '2026-10-03', excusedUntil: '2026-10-03' })).toBeNull()
    expect(excusedPeriodError({ excusedFrom: '2026-10-05', excusedUntil: '2026-10-03' })).toMatch(/can't be before/)
    expect(excusedPeriodError({ excusedFrom: '', excusedUntil: '2026-10-03' })).toMatch(/required/)
    expect(excusedPeriodError({ excusedFrom: '2026-10-03', excusedUntil: '' })).toMatch(/required/)
  })

  it('defaults a draft to the visit date, one day', async () => {
    const context = await fetchExcuseLetterContext('visit-0001')
    const visitDate = context.visit.dateTime.slice(0, 10)
    expect(context.approval).toBeNull()
    expect(context.period).toEqual({ excusedFrom: visitDate, excusedUntil: visitDate })
  })

  it('stores the period on approval, rejects an invalid one, and locks it afterwards', async () => {
    const visitDate = (await getVisit('visit-0001')).dateTime.slice(0, 10)
    await expect(
      approveExcuseLetter('visit-0001', { excusedFrom: visitDate, excusedUntil: '2000-01-01' }),
    ).rejects.toThrow(/can't be before/)
    expect(await getExcuseLetterApproval('visit-0001')).toBeNull()

    await approveExcuseLetter('visit-0001', { excusedFrom: visitDate, excusedUntil: visitDate })
    expect(await getExcuseLetterApproval('visit-0001')).toMatchObject({ excusedFrom: visitDate, excusedUntil: visitDate })
    expect((await fetchExcuseLetterContext('visit-0001')).period).toEqual({ excusedFrom: visitDate, excusedUntil: visitDate })

    await expect(
      approveExcuseLetter('visit-0001', { excusedFrom: visitDate, excusedUntil: '2099-01-01' }),
    ).rejects.toThrow(/already approved/)
  })

  it("lists a student's letters with the visit disposition", async () => {
    const visit = await getVisit('visit-0139')
    const letters = await getStudentExcuseLetters(visit.studentId)
    expect(letters).toEqual([expect.objectContaining({ visitId: 'visit-0139', disposition: 'sent_home' })])
  })
})
