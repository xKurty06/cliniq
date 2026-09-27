import { useMemo, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Icon, Select } from '../../../components'
import { getMockDataset } from '../../../lib/mocks/dataset'
import { todayISO } from '../../../lib/dates'

function MockQr({ value }: { value: string }) {
  const cells = useMemo(() => Array.from({ length: 81 }, (_, index) => ((index * 17 + value.charCodeAt(index % value.length)) % 7) < 3), [value])
  return <svg role="img" aria-label={`QR code for ${value}`} viewBox="0 0 9 9" className="size-48 border-8 border-white bg-white" shapeRendering="crispEdges">{cells.map((filled, index) => filled && <rect key={index} x={index % 9} y={Math.floor(index / 9)} width="1" height="1" fill="currentColor" />)}<rect x="0" y="0" width="3" height="3" fill="none" stroke="currentColor" strokeWidth=".35" /><rect x="6" y="0" width="3" height="3" fill="none" stroke="currentColor" strokeWidth=".35" /><rect x="0" y="6" width="3" height="3" fill="none" stroke="currentColor" strokeWidth=".35" /></svg>
}

export function QrPrintPage() {
  const students = getMockDataset(todayISO()).students.filter((student) => !student.archived)
  const [studentNumber, setStudentNumber] = useState(students[0]?.studentNumber ?? '')
  const student = students.find((candidate) => candidate.studentNumber === studentNumber) ?? students[0]
  return <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-4 py-6 sm:px-8"><Card className="p-5 print:hidden"><h1 className="text-2xl font-bold tracking-tight text-text-primary">QR Code Print View</h1><p className="mt-1 text-sm text-text-secondary">Print a Student Number QR sticker for Staff use.</p></Card><Card className="print:border print:shadow-none"><CardHeader title="Student QR sticker" description="The QR encodes the Student Number only." icon={<Icon name="qrCode" />} actions={<Button variant="secondary" icon="printer" onClick={() => window.print()}>Print sticker</Button>} /><CardBody><div className="grid gap-6 rounded-md border-2 border-brand-green-dark p-6 sm:grid-cols-[auto_1fr] sm:items-center"><MockQr value={student?.studentNumber ?? 'none'} /><div><p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Mendez Christian Academy</p><p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{student?.studentNumber}</p><p className="mt-1 text-sm text-text-secondary">Scan to identify this student in CLINIQ.</p></div></div><div className="mt-6 max-w-sm print:hidden"><Select label="Preview student" value={studentNumber} options={students.map((item) => ({ value: item.studentNumber, label: `${item.studentNumber} — ${item.fullName}` }))} onChange={setStudentNumber} /></div></CardBody></Card></main>
}
