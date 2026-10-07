import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  ItemsGivenField,
  SegmentedControl,
  Select,
  Skeleton,
  StudentNumberField,
  type ItemLineDraft,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useIdentifiedStudent } from '../../hooks/useIdentifiedStudent'
import { cn } from '../../lib/cn'
import { addDays, todayISO } from '../../lib/dates'
import { getMockSessionUser, StockRuleError, type ComplaintType, type InventoryItemView, type SessionUser } from '../../lib/mock-db'
import { isStudentNumber } from '../../lib/studentNumber'
import type { Disposition } from '../../types/entities'
import { fetchNewVisitContext, fetchVisitItems, findVisitStudent, submitNewVisit } from './api/newVisitApi'


const dispositionOptions = [
  { value: 'returned_to_class', label: 'Returned to class' },
  { value: 'sent_home', label: 'Sent home' },
  { value: 'referred_to_hospital', label: 'Referred to hospital' },
] satisfies Array<{ value: Disposition; label: string }>

interface Errors {
  complaint?: string
  treatment?: string
  itemsGiven?: string
  followUpDate?: string
  followUpReason?: string
}

function VisitSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-page-narrow flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5">
        <Skeleton className="h-7 w-56 max-w-full" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </Card>
      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-72 max-w-full" />
        </div>
      </Card>
    </div>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  error,
  required,
  hint,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  hint?: string
  rows?: number
}) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-text-primary">
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        required={required}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hintId, errorId) || undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'resize-y rounded-md border bg-background px-3 py-2 text-sm text-text-primary shadow-card',
          'transition-colors duration-150 hover:border-brand-green motion-reduce:transition-none',
          error ? 'border-error' : 'border-border',
        )}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  )
}

function TriagePanel({
  complaint,
  complaintTypes,
  checked,
  onToggle,
}: {
  complaint: string
  complaintTypes: ComplaintType[]
  checked: string[]
  onToggle: (step: string) => void
}) {
  const selected = complaintTypes.find((item) => item.label === complaint)
  // Not every complaint has a checklist yet (checklist content is mock-only, see mock-db.json).
  if (!selected || selected.triageSteps.length === 0) return null
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start gap-2">
        <Icon name="clipboardList" className="mt-0.5 shrink-0 text-brand-green-dark" />
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Suggested first-aid steps for: {selected.label}
          </h2>
          <p className="text-xs text-text-secondary">
            Guidance only. Staff still records the actual treatment given below.
          </p>
        </div>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {selected.triageSteps.map((step) => (
          <li key={step}>
            <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-background motion-reduce:transition-none">
              <input
                type="checkbox"
                checked={checked.includes(step)}
                onChange={() => onToggle(step)}
                className="mt-0.5 size-4 cursor-pointer accent-brand-green-dark"
              />
              <span className="text-sm text-text-primary">{step}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * New Visit Entry (Screen #11 / Reference 2). Mutating saves call the mock audit helper now, and
 * will become real audit-log writes when the Laravel endpoints land.
 */
export function NewVisitEntryPage({
  viewer = getMockSessionUser(),
  studentNumber,
}: {
  viewer?: SessionUser
  studentNumber?: string
}) {
  const today = todayISO()
  const { data, status, reload } = useAsyncData(`new-visit|${studentNumber ?? 'unidentified'}`, () =>
    fetchNewVisitContext(studentNumber),
  )
  const identified = useIdentifiedStudent(data?.student, findVisitStudent)
  const [complaint, setComplaint] = useState('')
  const [treatment, setTreatment] = useState('')
  const [disposition, setDisposition] = useState<Disposition>('returned_to_class')
  const [triageSteps, setTriageSteps] = useState<string[]>([])
  const [needsFollowUp, setNeedsFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState(addDays(today, 1))
  const [followUpReason, setFollowUpReason] = useState('')
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [lines, setLines] = useState<ItemLineDraft[]>([])
  /** Stock figures refreshed after a save; until then, the ones loaded with the form. */
  const [freshItems, setFreshItems] = useState<InventoryItemView[] | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  /** Set after a successful save: whether it created a follow-up, and what it took from inventory. */
  const [saved, setSaved] = useState<null | { withFollowUp: boolean; given: number; belowZero: string[] }>(null)
  // Allergies sit beside the medicine picker, so look the student up as soon as a full number is typed.
  const typedNumber = identified.needsStudentNumber && isStudentNumber(identified.input) ? identified.input : ''
  const { data: typedAllergies } = useAsyncData(`visit-allergies|${typedNumber}`, () =>
    typedNumber ? findVisitStudent(typedNumber).then((student) => student.allergies, () => null) : Promise.resolve(null),
  )
  const allergies = identified.student?.allergies ?? (typedNumber ? (typedAllergies ?? null) : null)
  const formRef = useRef<HTMLFormElement>(null)
  const saveAndNewRef = useRef(false)

  useEffect(() => {
    function saveAndNew() {
      saveAndNewRef.current = true
      formRef.current?.requestSubmit()
    }
    window.addEventListener('cliniq:save-and-new', saveAndNew)
    return () => window.removeEventListener('cliniq:save-and-new', saveAndNew)
  }, [])

  function updateComplaint(value: string) {
    setComplaint(value)
    setTriageSteps([])
    setErrors((current) => ({ ...current, complaint: undefined }))
  }

  function toggleStep(step: string) {
    setTriageSteps((current) =>
      current.includes(step) ? current.filter((item) => item !== step) : [...current, step],
    )
  }

  function validate(): Errors {
    const next: Errors = {}
    if (!complaint) next.complaint = 'Select the complaint for this visit.'
    if (!treatment.trim() && !lines.length) next.treatment = 'Enter treatment notes or add a medicine or supply.'
    if (lines.some((line) => line.quantity < 1)) next.itemsGiven = 'Each quantity must be at least 1.'
    if (needsFollowUp) {
      if (!followUpDate) next.followUpDate = 'Choose a follow-up date.'
      if (!followUpReason.trim()) next.followUpReason = 'Enter the follow-up reason.'
    }
    return next
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data) return
    const nextErrors = validate()
    const studentOk = identified.validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || !studentOk) return
    setSaving(true)
    setSaveError('')
    try {
      const student = await identified.resolve()
      if (!student) return
      const result = await submitNewVisit(
        {
          studentId: student.id,
          complaint,
          treatment: treatment.trim(),
          disposition,
          triageStepsCompleted: triageSteps,
          followUp: needsFollowUp
            ? {
                followUpDate,
                reason: followUpReason.trim(),
                notes: followUpNotes.trim() || null,
              }
            : null,
          itemsGiven: lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity, instructions: line.instructions })),
        },
        viewer,
      )
      // Reference 2: a successful save confirms and clears the form, so a second click can't
      // record the same visit twice. The Save-and-new shortcut takes the same path.
      setSaved({ withFollowUp: needsFollowUp, given: lines.length, belowZero: result.belowZero })
      setLines([])
      setFreshItems(await fetchVisitItems())
      setComplaint('')
      setTreatment('')
      setDisposition('returned_to_class')
      setTriageSteps([])
      setNeedsFollowUp(false)
      setFollowUpDate(addDays(today, 1))
      setFollowUpReason('')
      setFollowUpNotes('')
      setErrors({})
      identified.reset()
      saveAndNewRef.current = false
    } catch (caught) {
      // The data layer rejected a line (an item expired since the form loaded, say); nothing was saved.
      if (!(caught instanceof StockRuleError)) throw caught
      setSaveError(`${caught.message} Nothing was saved.`)
      setFreshItems(await fetchVisitItems())
    } finally {
      setSaving(false)
    }
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-page-narrow px-4 pt-10 pb-8 sm:px-8">
        <ErrorState title="Unable to load the visit form." onRetry={reload} />
      </div>
    )
  }

  if (!data) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading visit form…
        </p>
        <VisitSkeleton />
      </>
    )
  }

  return (
    <div className="mx-auto flex max-w-page-narrow flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">New Visit</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {identified.student
                ? `${identified.student.fullName} · ${identified.student.studentNumber} · ${identified.student.gradeLevel}`
                : 'Student not identified yet. Enter the Student Number below.'}
            </p>
          </div>
          <Badge tone="info" variant="soft" icon="stethoscope">
            Staff form
          </Badge>
        </div>
      </Card>

      {saved && (
        <div
          role="status"
          className="rounded-md border border-success bg-success/10 px-4 py-3 text-sm font-semibold text-text-primary"
        >
          Visit saved.{' '}
          {saved.given > 0 && `${saved.given} ${saved.given === 1 ? 'item was' : 'items were'} taken from inventory. `}
          {saved.withFollowUp ? 'A pending follow-up was created.' : 'No follow-up was created.'}
          {saved.belowZero.length > 0 && (
            <span className="mt-1 block text-warning">
              Now below zero: {saved.belowZero.join(', ')}. Recount and restock.
            </span>
          )}
        </div>
      )}

      {saveError && (
        <div role="alert" className="rounded-md border border-error bg-error/10 px-4 py-3 text-sm font-semibold text-text-primary">
          {saveError}
        </div>
      )}

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <Card aria-labelledby="visit-form-title">
          <CardHeader
            titleId="visit-form-title"
            title="Visit details"
            icon={<Icon name="stethoscope" />}
            description={
              identified.needsStudentNumber
                ? 'Required fields are marked. Enter the Student Number to identify the student.'
                : 'Required fields are marked. The student is already identified from lookup/scan.'
            }
          />
          <CardBody className="flex flex-col gap-4">
            {identified.needsStudentNumber && (
              <StudentNumberField
                value={identified.input}
                error={identified.error}
                onChange={identified.setInput}
              />
            )}
            <Select
              label="Complaint"
              required
              value={complaint}
              placeholder="Select complaint"
              options={data.complaintTypes.map((type) => ({ value: type.label, label: type.label }))}
              onChange={updateComplaint}
              error={errors.complaint}
            />
            {complaint ? (
              <TriagePanel
                complaint={complaint}
                complaintTypes={data.complaintTypes}
                checked={triageSteps}
                onToggle={toggleStep}
              />
            ) : (
              <EmptyState
                icon="clipboardList"
                title="Select a complaint to show Smart Triage"
                description="The checklist appears inline after a complaint is selected."
                className="rounded-md border border-border bg-surface"
              />
            )}
            <TextareaField
              label="Treatment notes"
              hint="Care that isn't stock: rest, cold compress, wound cleaning, advice. Needed unless a medicine or supply is added below."
              value={treatment}
              onChange={(value) => {
                setTreatment(value)
                setErrors((current) => ({ ...current, treatment: undefined }))
              }}
              error={errors.treatment}
            />
            <ItemsGivenField
              items={freshItems ?? data.items}
              lines={lines}
              onChange={(next) => {
                setLines(next)
                setSaved(null)
                setErrors((current) => ({ ...current, treatment: undefined, itemsGiven: undefined }))
              }}
              allergies={allergies}
              error={errors.itemsGiven}
            />
            <div>
              <p className="mb-1 text-xs font-semibold text-text-primary">Disposition</p>
              <SegmentedControl
                label="Disposition"
                value={disposition}
                onChange={setDisposition}
                options={dispositionOptions}
                size="md"
              />
            </div>

            <fieldset className="rounded-md border border-border p-4">
              <legend className="px-1 text-sm font-semibold text-text-primary">Follow-up prompt</legend>
              <label className="mt-2 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-surface motion-reduce:transition-none">
                <input
                  type="checkbox"
                  checked={needsFollowUp}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setNeedsFollowUp(event.target.checked)
                  }
                  className="mt-0.5 size-4 cursor-pointer accent-brand-green-dark"
                />
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    This student needs a follow-up
                  </span>
                  <span className="block text-xs text-text-secondary">
                    Creates a pending follow-up connected to this visit.
                  </span>
                </span>
              </label>
              {needsFollowUp && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DatePicker
                    label="Follow-up date"
                    value={followUpDate}
                    min={today}
                    required
                    onChange={(next) => {
                      setFollowUpDate(next)
                      setErrors((current) => ({ ...current, followUpDate: undefined }))
                    }}
                    error={errors.followUpDate}
                  />
                  <Input
                    label="Reason"
                    value={followUpReason}
                    required
                    onChange={(event) => {
                      setFollowUpReason(event.target.value)
                      setErrors((current) => ({ ...current, followUpReason: undefined }))
                    }}
                    error={errors.followUpReason}
                  />
                  <div className="sm:col-span-2">
                    <TextareaField
                      label="Notes"
                      value={followUpNotes}
                      onChange={setFollowUpNotes}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </fieldset>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button type="button" variant="neutral" onClick={() => window.history.back()}>Cancel</Button>
              <Button type="submit" variant="primary" loading={saving}>
                Save Visit
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  )
}
