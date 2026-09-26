import { addDays, diffDays, parseISODate } from '../dates'
import type {
  FollowUp,
  Incident,
  InventoryItem,
  ISODate,
  ISODateTime,
  Student,
  Visit,
} from '../../types/entities'

/**
 * MOCK DATA: one fake clinic, shared by every screen during the frontend-first phases (ADR-006),
 * so the Dashboard, Visit Log, Follow-Up List, and so on all describe the same students.
 *
 * - Deterministic: a seeded PRNG, generated relative to "today", so the same day always gives the
 *   same data (stable screenshots/tests) while the dates always look current.
 * - Every record uses the shared entity types (Frontend Context Brief §5). If a real API response
 *   wouldn't fit these types, that shows up here first.
 * - All names, numbers, and events are fictional.
 */

export interface MockDataset {
  today: ISODate
  students: Student[]
  visits: Visit[]
  incidents: Incident[]
  followUps: FollowUp[]
  inventory: InventoryItem[]
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = [
  'Juan',
  'Maria',
  'Jose',
  'Ana',
  'Miguel',
  'Sofia',
  'Carlos',
  'Isabel',
  'Rafael',
  'Camille',
  'Paolo',
  'Andrea',
  'Gabriel',
  'Bea',
  'Nathan',
  'Kyla',
]
const LAST_NAMES = [
  'Dela Cruz',
  'Santos',
  'Reyes',
  'Garcia',
  'Mendoza',
  'Torres',
  'Villanueva',
  'Ramos',
  'Aquino',
  'Bautista',
  'Castillo',
  'Navarro',
  'Flores',
  'Domingo',
]
const GRADE_LEVELS = [
  'Kinder',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
]

/** Weighted complaint list: the weights make some complaints clearly "most common". */
const COMPLAINTS: Array<[string, number]> = [
  ['Headache', 22],
  ['Stomachache', 18],
  ['Fever', 12],
  ['Cough and colds', 12],
  ['Dizziness', 9],
  ['Minor wound', 8],
  ['Menstrual cramps', 6],
  ['Toothache', 4],
  ['Sprain', 4],
  ['Allergic reaction', 2],
]
const INCIDENT_COMPLAINTS = [
  'Fainting',
  'Fall injury',
  'Asthma attack',
  'Severe allergic reaction',
  'Head bump during PE',
]
const TREATMENTS = [
  'Rest in clinic',
  'Paracetamol given',
  'Wound cleaned and dressed',
  'Cold compress',
  'Observed, vitals normal',
]
const FOLLOW_UP_REASONS = [
  'Return tomorrow for monitoring',
  'Recheck temperature',
  'Check wound dressing',
  'Recheck blood pressure',
  'Monitor asthma symptoms',
]

function pickWeighted(rand: () => number, items: Array<[string, number]>): string {
  const total = items.reduce((sum, [, w]) => sum + w, 0)
  let roll = rand() * total
  for (const [value, weight] of items) {
    roll -= weight
    if (roll <= 0) return value
  }
  return items[0][0]
}

function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]
}

function at(date: ISODate, hour: number, minute: number): ISODateTime {
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`
}

/** Days counted back from today, so tags always land inside the default views. */
const EVENT_TAGS: Array<[number, string]> = [
  [-3, 'MCA Dance Program'],
  [-12, 'Intramurals'],
  [-11, 'Intramurals'],
  [-10, 'Intramurals'],
  [-40, 'Foundation Day'],
  [-75, 'Science Fair'],
  [-160, 'Family Day'],
]

const cache = new Map<ISODate, MockDataset>()

export function getMockDataset(today: ISODate): MockDataset {
  const cached = cache.get(today)
  if (cached) return cached
  const dataset = generate(today)
  cache.set(today, dataset)
  return dataset
}

function generate(today: ISODate): MockDataset {
  const rand = mulberry32(20260926)
  const thisYear = Number(today.slice(0, 4))

  // Students: about 900 active, a few archived, a few flagged incomplete.
  const students: Student[] = []
  const sequenceByYear = new Map<number, number>()
  for (let i = 0; i < 930; i++) {
    const year = thisYear - Math.floor(rand() * 7)
    const seq = (sequenceByYear.get(year) ?? 0) + 1
    sequenceByYear.set(year, seq)
    const complete = rand() > 0.03
    students.push({
      id: `stu-${i + 1}`,
      studentNumber: `${year}-${String(seq).padStart(5, '0')}`,
      fullName: `${pick(rand, FIRST_NAMES)} ${pick(rand, LAST_NAMES)}`,
      gradeLevel: pick(rand, GRADE_LEVELS),
      contactInfo: '09XX-XXX-XXXX',
      allergies: rand() > 0.85 ? ['Peanuts'] : [],
      medicalConditions: rand() > 0.9 ? ['Asthma'] : [],
      emergencyContact: complete
        ? {
            name: 'Parent/Guardian',
            relationship: 'Parent',
            phone: '09XX-XXX-XXXX',
            verified: rand() > 0.2,
          }
        : null,
      recordComplete: complete,
      archived: i >= 900,
    })
  }
  const active = students.filter((s) => !s.archived)

  const tagByDate = new Map(EVENT_TAGS.map(([offset, tag]) => [addDays(today, offset), tag]))
  const visits: Visit[] = []
  const incidents: Incident[] = []
  const start = addDays(today, -430)

  for (let date = start; date <= today; date = addDays(date, 1)) {
    const d = parseISODate(date)
    const weekday = d.getDay()
    if (weekday === 0) continue // No classes on Sunday.
    const month = d.getMonth() // 0-based
    const summerBreak = month === 3 || month === 4 // April–May
    let base = weekday === 6 ? 1 : 7 + Math.floor(rand() * 7)
    if (summerBreak) base = Math.floor(rand() * 2)
    const tag = tagByDate.get(date) ?? null
    if (tag) base += 6

    for (let n = 0; n < base; n++) {
      const student = pick(rand, active)
      visits.push({
        id: `vis-${visits.length + 1}`,
        studentId: student.id,
        dateTime: at(date, 7 + Math.floor(rand() * 9), Math.floor(rand() * 60)),
        complaint: pickWeighted(rand, COMPLAINTS),
        treatment: pick(rand, TREATMENTS),
        disposition: rand() > 0.9 ? 'sent_home' : 'returned_to_class',
        loggedByUserId: 'usr-nurse',
        eventTag: tag && rand() > 0.3 ? tag : null,
      })
    }

    if (!summerBreak && rand() < 0.25) {
      const daysAgo = diffDays(date, today)
      incidents.push({
        id: `inc-${incidents.length + 1}`,
        studentId: pick(rand, active).id,
        time: at(date, 8 + Math.floor(rand() * 8), Math.floor(rand() * 60)),
        complaint: pick(rand, INCIDENT_COMPLAINTS),
        vitals: { temperatureC: 36.8, pulseBpm: 92 },
        hospitalReferral: null,
        parentNotifications: [{ outcome: 'reached', timestamp: at(date, 16, 0) }],
        // Recent incidents may still be waiting for Stage 2 completion.
        stage: daysAgo < 5 && rand() > 0.4 ? 1 : 2,
        eventTag: tag,
      })
    }
  }

  // A deliberate symptom cluster: a Fever spike 8–12 days ago, so the cluster marker has something
  // to show.
  for (let offset = -12; offset <= -8; offset++) {
    const date = addDays(today, offset)
    if (parseISODate(date).getDay() === 0) continue
    for (let n = 0; n < 5; n++) {
      visits.push({
        id: `vis-${visits.length + 1}`,
        studentId: pick(rand, active).id,
        dateTime: at(date, 9 + n, 15),
        complaint: 'Fever',
        treatment: 'Paracetamol given',
        disposition: 'sent_home',
        loggedByUserId: 'usr-nurse',
        eventTag: tagByDate.get(date) ?? null,
      })
    }
  }

  // A few students with repeated recent visits, so the frequent-visitor warning has data.
  for (const [studentIndex, repeatCount] of [
    [14, 6],
    [233, 5],
    [410, 4],
    [777, 4],
  ] as const) {
    const student = active[studentIndex]
    for (let n = 0; n < repeatCount; n++) {
      let date = addDays(today, -1 - n * 4)
      if (parseISODate(date).getDay() === 0) date = addDays(date, -1)
      visits.push({
        id: `vis-${visits.length + 1}`,
        studentId: student.id,
        dateTime: at(date, 10, 30),
        complaint: pick(rand, ['Headache', 'Stomachache', 'Dizziness']),
        treatment: 'Rest in clinic',
        disposition: 'returned_to_class',
        loggedByUserId: 'usr-nurse',
        eventTag: null,
      })
    }
  }

  visits.sort((a, b) => a.dateTime.localeCompare(b.dateTime))

  // Follow-ups: past ones are mostly resolved, and there's a guaranteed spread of overdue,
  // due-today, and upcoming pending ones relative to today.
  const followUps: FollowUp[] = []
  const recentVisits = visits.slice(-400)
  for (let i = 0; i < 40; i++) {
    const visit = recentVisits[Math.floor(rand() * recentVisits.length)]
    const date = addDays(visit.dateTime.slice(0, 10), 1 + Math.floor(rand() * 2))
    const past = date < addDays(today, -3)
    followUps.push({
      id: `fu-${i + 1}`,
      studentId: visit.studentId,
      relatedRecord: { type: 'visit', id: visit.id },
      followUpDate: date,
      reason: pick(rand, FOLLOW_UP_REASONS),
      status: past
        ? rand() > 0.15
          ? 'completed'
          : rand() > 0.5
            ? 'missed'
            : 'cancelled'
        : 'pending',
      notes: null,
      createdByUserId: 'usr-nurse',
    })
  }
  const guaranteed: Array<[number, string]> = [
    [-2, 'Recheck temperature'],
    [-1, 'Check wound dressing'],
    [0, 'Return tomorrow for monitoring'],
    [0, 'Recheck blood pressure'],
    [2, 'Monitor asthma symptoms'],
    [5, 'Check wound dressing'],
    [12, 'Recheck temperature'],
  ]
  for (const [offset, reason] of guaranteed) {
    const incident = incidents[incidents.length - 1 - (followUps.length % 5)]
    followUps.push({
      id: `fu-${followUps.length + 1}`,
      studentId: pick(rand, active).id,
      relatedRecord: incident
        ? { type: 'incident', id: incident.id }
        : { type: 'visit', id: visits[visits.length - 1].id },
      followUpDate: addDays(today, offset),
      reason,
      status: 'pending',
      notes: null,
      createdByUserId: 'usr-nurse',
    })
  }

  const expiring = (days: number) => addDays(today, days)
  const inventory: InventoryItem[] = [
    {
      id: 'inv-1',
      name: 'Paracetamol 500mg',
      category: 'medicine',
      currentStock: 12,
      unit: 'tablets',
      expirationDate: expiring(210),
      lowStockThreshold: 50,
    },
    {
      id: 'inv-2',
      name: 'Alcohol 70%',
      category: 'supply',
      currentStock: 3,
      unit: 'bottles',
      expirationDate: expiring(400),
      lowStockThreshold: 5,
    },
    {
      id: 'inv-3',
      name: 'Mefenamic Acid 250mg',
      category: 'medicine',
      currentStock: 80,
      unit: 'capsules',
      expirationDate: expiring(18),
      lowStockThreshold: 30,
    },
    {
      id: 'inv-4',
      name: 'Cetirizine 10mg',
      category: 'medicine',
      currentStock: 9,
      unit: 'tablets',
      expirationDate: expiring(11),
      lowStockThreshold: 20,
    },
    {
      id: 'inv-5',
      name: 'Oral Rehydration Salts',
      category: 'medicine',
      currentStock: 25,
      unit: 'sachets',
      expirationDate: expiring(-4),
      lowStockThreshold: 10,
    },
    {
      id: 'inv-6',
      name: 'Adhesive Bandages',
      category: 'supply',
      currentStock: 150,
      unit: 'pieces',
      expirationDate: null,
      lowStockThreshold: 50,
    },
    {
      id: 'inv-7',
      name: 'Gauze Pads',
      category: 'supply',
      currentStock: 40,
      unit: 'pieces',
      expirationDate: null,
      lowStockThreshold: 25,
    },
    {
      id: 'inv-8',
      name: 'Povidone-Iodine',
      category: 'supply',
      currentStock: 6,
      unit: 'bottles',
      expirationDate: expiring(300),
      lowStockThreshold: 4,
    },
    {
      id: 'inv-9',
      name: 'Loperamide 2mg',
      category: 'medicine',
      currentStock: 30,
      unit: 'capsules',
      expirationDate: expiring(95),
      lowStockThreshold: 10,
    },
    {
      id: 'inv-10',
      name: 'Cotton Balls',
      category: 'supply',
      currentStock: 2,
      unit: 'packs',
      expirationDate: null,
      lowStockThreshold: 3,
    },
  ]

  return { today, students, visits, incidents, followUps, inventory }
}
