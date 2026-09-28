import { useState, type FormEvent } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  SegmentedControl,
  Skeleton,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { getMockSessionUser, type SessionUser } from '../../lib/mock-db'
import type { Disposition } from '../../types/entities'
import {
  fetchPeReferralContext,
  submitPeReferral,
  type PeReferralValues,
} from './api/peReferralApi'

const dispositionOptions = [
  { value: 'returned_to_class', label: 'Returned to class' },
  { value: 'sent_home', label: 'Sent home' },
  { value: 'referred_to_hospital', label: 'Hospital referral' },
] satisfies Array<{ value: Disposition; label: string }>

interface Errors {
  referredBy?: string
  activity?: string
  injurySummary?: string
  clinicalAssessment?: string
  treatment?: string
}

function ReferralSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[960px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <Skeleton className="h-7 w-72 max-w-full" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </Card>
      <Card className="p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
        <Skeleton className="mt-5 h-10 w-52" />
      </Card>
    </div>
  )
}

function TextareaField({
  label,
  value,
  error,
  onChange,
}: {
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  const id = label.toLowerCase().replaceAll(' ', '-')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-text-primary">
        {label} <span className="text-error">*</span>
      </label>
      <textarea
        id={id}
        rows={4}
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`resize-y rounded-md border bg-background px-3 py-2 text-sm text-text-primary shadow-card transition-colors duration-150 hover:border-brand-green motion-reduce:transition-none ${
          error ? 'border-error' : 'border-border'
        }`}
      />
      {error && (
        <p role="alert" className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  )
}

function validate(values: PeReferralValues): Errors {
  const errors: Errors = {}
  if (!values.referredBy.trim()) errors.referredBy = 'Enter who submitted the referral.'
  if (!values.activity.trim()) errors.activity = 'Enter the activity or setting.'
  if (!values.injurySummary.trim()) errors.injurySummary = 'Enter the injury summary.'
  if (!values.clinicalAssessment.trim()) {
    errors.clinicalAssessment = 'Enter the clinical assessment.'
  }
  if (!values.treatment.trim()) errors.treatment = 'Enter the treatment or action taken.'
  return errors
}

export function PeSportsReferralPage({ viewer = getMockSessionUser() }: { viewer?: SessionUser }) {
  const { data, status, reload } = useAsyncData('pe-referral', fetchPeReferralContext)
  const [values, setValues] = useState<PeReferralValues>({
    referredBy: '',
    activity: '',
    injurySummary: '',
    clinicalAssessment: '',
    treatment: '',
    disposition: 'returned_to_class',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setField<K extends keyof PeReferralValues>(field: K, value: PeReferralValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSaved(false)
  }

  function loadDefaults() {
    if (!data) return
    setValues((current) => ({
      ...current,
      referredBy: current.referredBy || data.referredBy,
      activity: current.activity || data.activity,
    }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data) return
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true)
    try {
      await submitPeReferral(values, data.student)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (viewer.role !== 'staff') {
    return (
      <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-8">
        <ErrorState title="Staff access required." />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[960px] px-4 py-6 sm:px-8">
        <ErrorState title="Unable to load PE/Sports referral." onRetry={reload} />
      </div>
    )
  }

  if (!data) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading PE/Sports referral...
        </p>
        <ReferralSkeleton />
      </>
    )
  }

  const needsEmergency = values.disposition === 'referred_to_hospital'

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              PE/Sports Injury Referral Form
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {data.student.fullName} · {data.student.studentNumber} · {data.student.gradeLevel}
            </p>
          </div>
          <Button variant="secondary" icon="refresh" onClick={loadDefaults}>
            Use PE Defaults
          </Button>
        </div>
      </Card>

      {saved && (
        <div
          role="status"
          className="rounded-md border border-success bg-success/10 px-4 py-3 text-sm font-semibold text-text-primary"
        >
          PE/Sports referral saved.
          {needsEmergency ? ' Emergency Response escalation was queued.' : ''}
        </div>
      )}

      <form noValidate onSubmit={onSubmit}>
        <Card aria-labelledby="pe-referral-title">
          <CardHeader
            titleId="pe-referral-title"
            title="Referral details"
            description="Log the referral source, clinical assessment, and disposition."
            icon={<Icon name="activity" />}
          />
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Referred by"
                required
                value={values.referredBy}
                error={errors.referredBy}
                onChange={(event) => setField('referredBy', event.target.value)}
              />
              <Input
                label="Activity or setting"
                required
                value={values.activity}
                error={errors.activity}
                onChange={(event) => setField('activity', event.target.value)}
              />
            </div>
            <TextareaField
              label="Injury summary"
              value={values.injurySummary}
              error={errors.injurySummary}
              onChange={(value) => setField('injurySummary', value)}
            />
            <TextareaField
              label="Clinical assessment"
              value={values.clinicalAssessment}
              error={errors.clinicalAssessment}
              onChange={(value) => setField('clinicalAssessment', value)}
            />
            <TextareaField
              label="Treatment or action taken"
              value={values.treatment}
              error={errors.treatment}
              onChange={(value) => setField('treatment', value)}
            />
            <div>
              <p className="mb-1 text-xs font-semibold text-text-primary">Disposition</p>
              <SegmentedControl
                label="Disposition"
                value={values.disposition}
                onChange={(value) => setField('disposition', value)}
                options={dispositionOptions}
                size="md"
              />
            </div>

            {needsEmergency ? (
              <div className="rounded-md border border-error bg-error/10 px-3 py-3 text-sm text-text-primary">
                Hospital referral selected. Continue in Emergency Response to complete referral
                destination, transport, departure time, and parent-notification details.
              </div>
            ) : (
              <EmptyState
                icon="activity"
                title="Emergency escalation not selected"
                description="Choose Hospital referral only when the case needs Emergency Response completion."
                className="rounded-md border border-border bg-surface"
              />
            )}

            <div className="flex justify-end border-t border-border pt-4">
              <Button type="submit" variant="primary" icon="checkCircle" loading={saving}>
                Save Referral
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  )
}
