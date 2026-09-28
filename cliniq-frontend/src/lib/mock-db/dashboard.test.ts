import { describe, expect, it } from 'vitest'
import { rangeForPreset } from '../../../lib/dateRange'
import { getMockDataset, type MockDataset } from '../../../lib/mocks/dataset'
import type { FollowUp, InventoryItem, Student, Visit } from '../../../types/entities'
import {
  buildBuckets,
  buildCalendarDays,
  buildComplaintTrends,
  buildDashboardSummary,
  buildDueFollowUps,
  buildInventoryAlerts,
  detectClusters,
  MOCK_RULES,
} from './aggregate'

const TODAY = '2026-09-26'

// Hand-built records typed against the §5 entity shapes. If the entity contract changes, this
// file stops compiling, which is exactly the check the loop's "Simulate" step wants.
const student = (id: string, n: string, extra: Partial<Student> = {}): Student => ({
  id,
  studentNumber: n,
  fullName: `SECRET NAME ${id}`,
  gradeLevel: 'Grade 5',
  contactInfo: '',
  allergies: [],
  medicalConditions: [],
  emergencyContact: null,
  recordComplete: true,
  archived: false,
  ...extra,
})

const followUp = (id: string, date: string, status: FollowUp['status'] = 'pending'): FollowUp => ({
  id,
  studentId: 's1',
  relatedRecord: { type: 'visit', id: 'v1' },
  followUpDate: date,
  reason: 'Recheck temperature',
  status,
  notes: null,
  createdByUserId: 'u1',
})

const visit = (
  id: string,
  studentId: string,
  date: string,
  complaint = 'Headache',
  eventTag: string | null = null,
): Visit => ({
  id,
  studentId,
  dateTime: `${date}T09:00:00+08:00`,
  complaint,
  treatment: 'Rest',
  disposition: 'returned_to_class',
  loggedByUserId: 'u1',
  eventTag,
})

const item = (id: string, extra: Partial<InventoryItem>): InventoryItem => ({
  id,
  name: id,
  category: 'medicine',
  currentStock: 100,
  unit: 'tablets',
  expirationDate: null,
  lowStockThreshold: 10,
  ...extra,
})

function dataset(partial: Partial<MockDataset>): MockDataset {
  return {
    today: TODAY,
    students: [],
    visits: [],
    incidents: [],
    followUps: [],
    inventory: [],
    ...partial,
  }
}

describe('due/upcoming follow-ups', () => {
  const students = new Map([['s1', student('s1', '2026-00001')]])

  it('lists only pending follow-ups up to the upcoming window, with the right due state', () => {
    const data = dataset({
      followUps: [
        followUp('overdue', '2026-09-24'),
        followUp('today', TODAY),
        followUp('soon', '2026-10-03'), // exactly +7
        followUp('too-far', '2026-10-04'), // +8
        followUp('done', '2026-09-25', 'completed'),
        followUp('missed', '2026-09-20', 'missed'),
      ],
    })
    const rows = buildDueFollowUps(data, students)
    expect(rows.map((r) => [r.followUp.id, r.dueState, r.daysFromToday])).toEqual([
      ['overdue', 'overdue', -2],
      ['today', 'due_today', 0],
      ['soon', 'upcoming', 7],
    ])
  })

  it('carries the Student Number and never the name', () => {
    const rows = buildDueFollowUps(dataset({ followUps: [followUp('a', TODAY)] }), students)
    expect(rows[0].student).toEqual({ id: 's1', studentNumber: '2026-00001' })
    expect(JSON.stringify(rows)).not.toContain('SECRET NAME')
  })
})

describe('inventory alerts', () => {
  it('keeps low-stock and expiry as separate flags that can both apply', () => {
    const data = dataset({
      inventory: [
        item('both', { currentStock: 2, expirationDate: '2026-10-06' }),
        item('expired', { expirationDate: '2026-09-20' }),
        item('at-threshold', { currentStock: 10 }), // "below" the threshold = strictly less
        item('fine', { expirationDate: '2027-09-26' }),
      ],
    })
    const low = new Set(
      data.inventory.filter((i) => i.currentStock < i.lowStockThreshold).map((i) => i.id),
    )
    const rows = buildInventoryAlerts(data, low)
    expect(rows.map((r) => [r.item.id, r.flags, r.daysUntilExpiry])).toEqual([
      ['expired', ['expired'], -6],
      ['both', ['low_stock', 'nearing_expiration'], 10],
    ])
  })
})

describe('complaint trends', () => {
  it('clips week buckets to the selected range', () => {
    const buckets = buildBuckets('2026-09-02', '2026-09-26', 'week')
    expect(buckets[0]).toMatchObject({ key: '2026-08-30', from: '2026-09-02', to: '2026-09-05' })
    expect(buckets.at(-1)).toMatchObject({ from: '2026-09-20', to: '2026-09-26' })
  })

  it('charts the top complaints and lists the rest in otherComplaints', () => {
    const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const events = names.flatMap((c, i) =>
      Array.from({ length: 10 - i }, () => ({ date: '2026-09-10', complaint: c })),
    )
    const trends = buildComplaintTrends(events, '2026-09-01', '2026-09-30', 'month')
    expect(trends.series.map((s) => s.complaint)).toEqual(names.slice(0, MOCK_RULES.topComplaints))
    expect(trends.otherComplaints.map((s) => s.complaint)).toEqual(
      names.slice(MOCK_RULES.topComplaints),
    )
  })

  it('flags a spike as a possible cluster only when there are buckets to compare', () => {
    expect(detectClusters([2, 3, 12, 2])).toEqual([2])
    expect(detectClusters([12])).toEqual([])
    expect(detectClusters([6, 7, 6])).toEqual([])
  })
})

describe('dashboard summary', () => {
  const students = [
    student('s1', '2026-00001'),
    student('s2', '2026-00002', { recordComplete: false }),
    student('s3', '2020-00003', { archived: true, recordComplete: false }),
  ]
  const data = dataset({
    students,
    visits: [
      ...['2026-09-20', '2026-09-22', '2026-09-24'].map((d, i) => visit(`v${i}`, 's1', d)),
      visit('v9', 's2', '2026-09-25'),
      visit('old', 's2', '2026-08-01'),
    ],
  })
  const summary = buildDashboardSummary(
    data,
    { range: rangeForPreset('last7', TODAY), trendGranularity: 'week' },
    'now',
  )

  it('scopes visits to the range and leaves current-state counts unscoped', () => {
    expect(summary.counts).toMatchObject({ visits: 4, pendingRecords: 1, activeStudents: 2 })
  })

  it('raises a frequent-visitor warning by Student Number at the threshold', () => {
    expect(summary.frequentVisitors).toEqual([
      { student: { id: 's1', studentNumber: '2026-00001' }, visitCount: 3 },
    ])
  })

  it('never includes a student name anywhere in the payload', () => {
    expect(JSON.stringify(summary)).not.toContain('SECRET NAME')
  })
})

describe('calendar days', () => {
  it('counts visits per day and collects distinct event tags', () => {
    const data = dataset({
      visits: [
        visit('a', 's1', '2026-09-14', 'Headache', 'Intramurals'),
        visit('b', 's1', '2026-09-14', 'Fever', 'Intramurals'),
        visit('c', 's1', '2026-09-15'),
      ],
    })
    expect(buildCalendarDays(data, '2026-09-14', '2026-09-16')).toEqual([
      { date: '2026-09-14', visits: 2, incidents: 0, eventTags: ['Intramurals'] },
      { date: '2026-09-15', visits: 1, incidents: 0, eventTags: [] },
      { date: '2026-09-16', visits: 0, incidents: 0, eventTags: [] },
    ])
  })
})

describe('shared mock dataset', () => {
  it('generates unique Student Numbers in YYYY-NNNNN format', () => {
    const numbers = getMockDataset(TODAY).students.map((s) => s.studentNumber)
    expect(numbers.every((n) => /^\d{4}-\d{5}$/.test(n))).toBe(true)
    expect(new Set(numbers).size).toBe(numbers.length)
  })
})
