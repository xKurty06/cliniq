import { useId, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  ListRow,
  RowList,
  SegmentedControl,
  Skeleton,
  StatusBadge,
  type StatusMap,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { addDays, todayISO } from '../../lib/dates'
import { getMockSessionUser, type SessionUser } from '../../lib/mocks/session'
import type { HospitalReferral, Incident, ParentNotificationOutcome } from '../../types/entities'
import {
  completeStageTwoIncident,
  fetchIncidentEntryContext,
  saveStageOneIncident,
} from './api/incidentEntryApi'

type ScreenStage = 'stage1' | 'stage2'
type IncidentStatus = 'needs_completion' | 'in_progress' | 'complete'

const incidentStatusMap = {
  needs_completion: {
    label: 'Needs completion',
    tone: 'warning',
    icon: 'alertTriangle',
    variant: 'soft',
  },
  in_progress: { label: 'In progress', tone: 'info', icon: 'clock', variant: 'soft' },
  complete: { label: 'Complete', tone: 'success', icon: 'checkCircle', variant: 'soft' },
} satisfies StatusMap<IncidentStatus>

const COMPLAINTS = ['Fainting', 'Fall injury', 'Asthma attack', 'Severe allergic reaction', 'Head bump during PE']
const notificationOutcomes = [
  { value: 'reached', label: 'Reached' },
  { value: 'not_reached', label: 'Not reached' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'left_message', label: 'Left message' },
] satisfies Array<{ value: ParentNotificationOutcome; label: string }>

interface Errors {
  complaint?: string
  temperatureC?: string
  pulseBpm?: string
  bloodPressure?: string
  oxygenSaturation?: string
  treatmentNotes?: string
  referralDestination?: string
  notificationDetail?: string
  followUpReason?: string
}

function IncidentSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1040px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <Skeleton className="h-7 w-64 max-w-full" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </Card>
      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-56 max-w-full" />
        </div>
      </Card>
    </div>
  )
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  error?: string
}) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-text-primary">
        {label} <span className="text-error">*</span>
      </label>
      <div className="relative">
        <select
          id={id}
          required
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={(event) => onChange(event.target.value)}
          className={`h-10 w-full cursor-pointer appearance-none rounded-md border bg-background px-3 pr-9 text-sm text-text-primary shadow-card transition-colors duration-150 hover:border-brand-green hover:bg-surface motion-reduce:transition-none ${
            error ? 'border-error' : 'border-border'
          }`}
        >
          <option value="">Select complaint</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand-green-dark"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  error,
  required,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  rows?: number
}) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
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
        aria-describedby={errorId}
        onChange={(event) => onChange(event.target.value)}
        className={`resize-y rounded-md border bg-background px-3 py-2 text-sm text-text-primary shadow-card transition-colors duration-150 hover:border-brand-green motion-reduce:transition-none ${
          error ? 'border-error' : 'border-border'
        }`}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  )
}

function validateStageOne(complaint: string, temperatureC: string, pulseBpm: string): Errors {
  const next: Errors = {}
  if (!complaint) next.complaint = 'Select the emergency complaint.'
  if (!temperatureC) next.temperatureC = 'Enter the temperature.'
  if (!pulseBpm) next.pulseBpm = 'Enter the pulse.'
  return next
}

/**
 * Incident Entry (Screen #16 / #16b, Reference 5). Stage 1 intentionally accepts only the fast
 * essentials; Stage 2 completes the same incident with full vitals, referral, notifications, and
 * optional follow-up.
 */
export function IncidentEntryPage({
  viewer = getMockSessionUser(),
  studentNumber,
}: {
  viewer?: SessionUser
  studentNumber?: string
}) {
  const today = todayISO()
  const { data, status, reload } = useAsyncData(`incident-entry|${studentNumber ?? 'default'}`, () =>
    fetchIncidentEntryContext(studentNumber),
  )
  const [stage, setStage] = useState<ScreenStage>('stage1')
  const [incident, setIncident] = useState<Incident | null>(null)
  const [completed, setCompleted] = useState(false)
  const [complaint, setComplaint] = useState('')
  const [temperatureC, setTemperatureC] = useState('')
  const [pulseBpm, setPulseBpm] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [oxygenSaturation, setOxygenSaturation] = useState('')
  const [treatmentNotes, setTreatmentNotes] = useState('')
  const [referToHospital, setReferToHospital] = useState(false)
  const [referralDestination, setReferralDestination] = useState('')
  const [transportMode, setTransportMode] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [notificationOutcome, setNotificationOutcome] = useState<ParentNotificationOutcome>('reached')
  const [notificationDetail, setNotificationDetail] = useState('')
  const [notifications, setNotifications] = useState<
    Array<{ outcome: ParentNotificationOutcome; timestamp: string; detail: string }>
  >([])
  const [needsFollowUp, setNeedsFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState(addDays(today, 1))
  const [followUpReason, setFollowUpReason] = useState('')
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [savingStageOne, setSavingStageOne] = useState(false)
  const [savingStageTwo, setSavingStageTwo] = useState(false)

  const statusValue: IncidentStatus = completed ? 'complete' : incident ? 'in_progress' : 'needs_completion'

  async function onStageOneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data) return
    const nextErrors = validateStageOne(complaint, temperatureC, pulseBpm)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSavingStageOne(true)
    try {
      const saved = await saveStageOneIncident(
        { studentId: data.student.id, complaint, temperatureC, pulseBpm },
        viewer,
      )
      setIncident(saved)
      setStage('stage2')
    } finally {
      setSavingStageOne(false)
    }
  }

  function addNotification() {
    if (!notificationDetail.trim()) {
      setErrors((current) => ({
        ...current,
        notificationDetail: 'Add a short note for this notification attempt.',
      }))
      return
    }
    setNotifications((current) => [
      ...current,
      {
        outcome: notificationOutcome,
        timestamp: new Date().toISOString(),
        detail: notificationDetail.trim(),
      },
    ])
    setNotificationDetail('')
    setErrors((current) => ({ ...current, notificationDetail: undefined }))
  }

  function validateStageTwo(): Errors {
    const next: Errors = {}
    if (!bloodPressure.trim()) next.bloodPressure = 'Enter the blood pressure.'
    if (!oxygenSaturation.trim()) next.oxygenSaturation = 'Enter oxygen saturation.'
    if (!treatmentNotes.trim()) next.treatmentNotes = 'Enter treatment notes.'
    if (referToHospital && !referralDestination.trim()) {
      next.referralDestination = 'Enter the hospital or clinic destination.'
    }
    if (needsFollowUp && !followUpReason.trim()) next.followUpReason = 'Enter the follow-up reason.'
    return next
  }

  async function onStageTwoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data || !incident) return
    const nextErrors = validateStageTwo()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSavingStageTwo(true)
    try {
      const hospitalReferral: HospitalReferral | null = referToHospital
        ? {
            destination: referralDestination.trim(),
            transportMode: transportMode.trim() || 'Not recorded',
            departureTime: departureTime || new Date().toISOString(),
          }
        : null
      const result = await completeStageTwoIncident(
        {
          incidentId: incident.id,
          studentId: data.student.id,
          complaint,
          temperatureC,
          pulseBpm,
          bloodPressure,
          oxygenSaturation,
          treatmentNotes,
          hospitalReferral,
          parentNotifications: notifications.map((item) => ({
            outcome: item.outcome,
            timestamp: item.timestamp,
          })),
          followUp: needsFollowUp
            ? {
                followUpDate,
                reason: followUpReason.trim(),
                notes: followUpNotes.trim() || null,
              }
            : null,
        },
        viewer,
      )
      setIncident(result.incident)
      setCompleted(true)
    } finally {
      setSavingStageTwo(false)
    }
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[1040px] px-4 py-6 sm:px-8">
        <ErrorState title="Unable to load the incident form." onRetry={reload} />
      </div>
    )
  }
  if (!data) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading incident form…
        </p>
        <IncidentSkeleton />
      </>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Incident Entry</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {data.student.fullName} · {data.student.studentNumber} · {data.student.gradeLevel}
            </p>
          </div>
          <StatusBadge status={statusValue} map={incidentStatusMap} />
        </div>
      </Card>

      {incident && (
        <div
          role="status"
          className="rounded-md border border-warning bg-warning/10 px-4 py-3 text-sm font-semibold text-text-primary"
        >
          {completed
            ? 'Incident completed. Stage 2 details are now saved.'
            : 'Stage 1 saved. This incident still needs completion.'}
        </div>
      )}

      <SegmentedControl
        label="Incident stage"
        value={stage}
        onChange={setStage}
        options={[
          { value: 'stage1', label: 'Stage 1: Fast capture', icon: 'alertTriangle' },
          { value: 'stage2', label: 'Stage 2: Complete later', icon: 'clipboardList' },
        ]}
        size="md"
      />

      {stage === 'stage1' ? (
        <form onSubmit={onStageOneSubmit} noValidate>
          <Card aria-labelledby="stage-one-title">
            <CardHeader
              titleId="stage-one-title"
              title="Stage 1 fast capture"
              icon={<Icon name="alertTriangle" />}
              description="Capture only the essentials now. Stage 2 can be completed after the immediate situation is handled."
            />
            <CardBody className="flex flex-col gap-4">
              <FieldSelect
                label="Complaint"
                value={complaint}
                onChange={(value) => {
                  setComplaint(value)
                  setErrors((current) => ({ ...current, complaint: undefined }))
                }}
                options={COMPLAINTS}
                error={errors.complaint}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  type="number"
                  step="0.1"
                  label="Temperature (°C)"
                  value={temperatureC}
                  required
                  onChange={(event) => {
                    setTemperatureC(event.target.value)
                    setErrors((current) => ({ ...current, temperatureC: undefined }))
                  }}
                  error={errors.temperatureC}
                />
                <Input
                  type="number"
                  label="Pulse (bpm)"
                  value={pulseBpm}
                  required
                  onChange={(event) => {
                    setPulseBpm(event.target.value)
                    setErrors((current) => ({ ...current, pulseBpm: undefined }))
                  }}
                  error={errors.pulseBpm}
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button variant="neutral">Cancel</Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={savingStageOne}
                  className="h-11 bg-warning text-white hover:bg-warning hover:brightness-90"
                >
                  Save Stage 1
                </Button>
              </div>
            </CardBody>
          </Card>
        </form>
      ) : (
        <form onSubmit={onStageTwoSubmit} noValidate>
          <Card aria-labelledby="stage-two-title">
            <CardHeader
              titleId="stage-two-title"
              title="Stage 2 completion"
              icon={<Icon name="clipboardList" />}
              description="Complete the same incident record with full vitals, treatment notes, referral details, and parent notification attempts."
            />
            <CardBody className="flex flex-col gap-4">
              {!incident ? (
                <EmptyState
                  icon="alertTriangle"
                  title="Save Stage 1 first"
                  description="Stage 2 opens after the fast-capture record exists."
                  className="rounded-md border border-border bg-surface"
                />
              ) : (
                <>
                  <div className="rounded-md border border-border bg-surface p-3">
                    <p className="text-xs font-semibold text-text-secondary">Stage 1 summary</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{complaint}</p>
                    <p className="text-xs text-text-secondary">
                      {temperatureC}°C · {pulseBpm} bpm
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Blood pressure"
                      value={bloodPressure}
                      required
                      onChange={(event) => {
                        setBloodPressure(event.target.value)
                        setErrors((current) => ({ ...current, bloodPressure: undefined }))
                      }}
                      error={errors.bloodPressure}
                    />
                    <Input
                      label="Oxygen saturation"
                      value={oxygenSaturation}
                      required
                      onChange={(event) => {
                        setOxygenSaturation(event.target.value)
                        setErrors((current) => ({ ...current, oxygenSaturation: undefined }))
                      }}
                      error={errors.oxygenSaturation}
                    />
                  </div>
                  <TextareaField
                    label="Treatment notes"
                    value={treatmentNotes}
                    required
                    onChange={(value) => {
                      setTreatmentNotes(value)
                      setErrors((current) => ({ ...current, treatmentNotes: undefined }))
                    }}
                    error={errors.treatmentNotes}
                  />

                  <fieldset className="rounded-md border border-border p-4">
                    <legend className="px-1 text-sm font-semibold text-text-primary">
                      Hospital referral
                    </legend>
                    <label className="mt-2 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-surface motion-reduce:transition-none">
                      <input
                        type="checkbox"
                        checked={referToHospital}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setReferToHospital(event.target.checked)
                        }
                        className="mt-0.5 size-4 cursor-pointer accent-brand-green-dark"
                      />
                      <span className="text-sm font-semibold text-text-primary">
                        Referred to hospital or clinic
                      </span>
                    </label>
                    {referToHospital && (
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Input
                          label="Destination"
                          value={referralDestination}
                          required
                          onChange={(event) => {
                            setReferralDestination(event.target.value)
                            setErrors((current) => ({ ...current, referralDestination: undefined }))
                          }}
                          error={errors.referralDestination}
                        />
                        <Input
                          label="Transport mode"
                          value={transportMode}
                          onChange={(event) => setTransportMode(event.target.value)}
                        />
                        <Input
                          type="datetime-local"
                          label="Departure time"
                          value={departureTime}
                          onChange={(event) => setDepartureTime(event.target.value)}
                        />
                      </div>
                    )}
                  </fieldset>

                  <fieldset className="rounded-md border border-border p-4">
                    <legend className="px-1 text-sm font-semibold text-text-primary">
                      Parent notification log
                    </legend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[14rem_minmax(0,1fr)_auto]">
                      <div>
                        <p className="mb-1 text-xs font-semibold text-text-primary">Outcome</p>
                        <SegmentedControl
                          label="Notification outcome"
                          value={notificationOutcome}
                          onChange={setNotificationOutcome}
                          options={notificationOutcomes}
                        />
                      </div>
                      <Input
                        label="Attempt note"
                        value={notificationDetail}
                        onChange={(event) => setNotificationDetail(event.target.value)}
                        error={errors.notificationDetail}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="self-end"
                        onClick={addNotification}
                      >
                        Add attempt
                      </Button>
                    </div>
                    {notifications.length ? (
                      <RowList className="mt-3 rounded-md border border-border">
                        {notifications.map((item, index) => (
                          <ListRow
                            key={`${item.timestamp}-${index}`}
                            primary={notificationOutcomes.find((o) => o.value === item.outcome)?.label}
                            secondary={item.detail}
                            meta={item.timestamp.slice(11, 16)}
                          />
                        ))}
                      </RowList>
                    ) : (
                      <p className="mt-3 text-xs text-text-secondary">
                        No notification attempts added yet.
                      </p>
                    )}
                  </fieldset>

                  <fieldset className="rounded-md border border-border p-4">
                    <legend className="px-1 text-sm font-semibold text-text-primary">
                      Follow-up prompt
                    </legend>
                    <label className="mt-2 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-surface motion-reduce:transition-none">
                      <input
                        type="checkbox"
                        checked={needsFollowUp}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setNeedsFollowUp(event.target.checked)
                        }
                        className="mt-0.5 size-4 cursor-pointer accent-brand-green-dark"
                      />
                      <span className="text-sm font-semibold text-text-primary">
                        This incident needs a follow-up
                      </span>
                    </label>
                    {needsFollowUp && (
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                          type="date"
                          label="Follow-up date"
                          value={followUpDate}
                          min={today}
                          required
                          onChange={(event) => setFollowUpDate(event.target.value)}
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
                          <TextareaField label="Notes" value={followUpNotes} onChange={setFollowUpNotes} rows={3} />
                        </div>
                      </div>
                    )}
                  </fieldset>

                  <div className="flex flex-wrap justify-end gap-2 pt-2">
                    <Button variant="neutral">Cancel</Button>
                    <Button type="submit" variant="primary" loading={savingStageTwo}>
                      Complete Incident
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </form>
      )}
    </div>
  )
}
