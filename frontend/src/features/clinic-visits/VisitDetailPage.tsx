import { useId, useState, type FormEvent } from 'react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  Icon,
  Input,
  ItemsGivenField,
  SegmentedControl,
  Skeleton,
  type ItemLineDraft,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/dates'
import { draftsFrom, formatItemGiven } from '../../lib/itemsGiven'
import { getMockSessionUser, StockRuleError, type SessionUser } from '../../lib/mock-db'
import type { Disposition } from '../../types/entities'
import {
  fetchVisitDetail,
  updateVisitDetail,
  valuesFromVisit,
  type VisitDetail,
  type VisitDetailValues,
} from './api/visitDetailApi'

const dispositionOptions = [
  { value: 'returned_to_class', label: 'Returned to class' },
  { value: 'sent_home', label: 'Sent home' },
  { value: 'referred_to_hospital', label: 'Hospital referral' },
] satisfies Array<{ value: Disposition; label: string }>

const dispositionLabel: Record<Disposition, string> = {
  returned_to_class: 'Returned to class',
  sent_home: 'Sent home',
  referred_to_hospital: 'Referred to hospital',
}

interface Errors {
  complaint?: string
  treatment?: string
  itemsGiven?: string
}

function VisitDetailSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-page-narrow flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5">
        <Skeleton className="h-7 w-64 max-w-full" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </Card>
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  error,
  required = true,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  hint?: string
}) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-text-primary">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <textarea
        id={id}
        rows={4}
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

function VisitDetailEditor({ initialVisit }: { initialVisit: VisitDetail }) {
  const [visit, setVisit] = useState(initialVisit)
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<VisitDetailValues>(() => valuesFromVisit(initialVisit))
  const [lines, setLines] = useState<ItemLineDraft[]>(() => draftsFrom(initialVisit.itemsGiven))
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  /** Set after a successful save; lists any items the edit took below zero. */
  const [saved, setSaved] = useState<null | { belowZero: string[] }>(null)

  function setField<K extends keyof VisitDetailValues>(field: K, value: VisitDetailValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSaved(null)
  }

  function validate(): Errors {
    const next: Errors = {}
    if (!values.complaint.trim()) next.complaint = 'Enter the visit complaint.'
    if (!values.treatment.trim() && !lines.length) next.treatment = 'Enter treatment notes or add a medicine or supply.'
    if (lines.some((line) => line.quantity < 1)) next.itemsGiven = 'Each quantity must be at least 1.'
    return next
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true)
    setSaveError('')
    try {
      const { visit: updated, belowZero } = await updateVisitDetail(
        visit,
        values,
        lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity, instructions: line.instructions })),
      )
      setVisit(updated)
      setValues(valuesFromVisit(updated))
      setLines(draftsFrom(updated.itemsGiven))
      setEditing(false)
      setSaved({ belowZero })
    } catch (caught) {
      // The data layer rejected a line; nothing was saved and stock is unchanged.
      if (!(caught instanceof StockRuleError)) throw caught
      setSaveError(`${caught.message} Nothing was saved.`)
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setValues(valuesFromVisit(visit))
    setLines(draftsFrom(visit.itemsGiven))
    setErrors({})
    setSaveError('')
    setEditing(false)
  }

  return (
    <div className="mx-auto flex max-w-page-narrow flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Visit Details
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {visit.student.fullName} · {visit.student.studentNumber} · {visit.student.gradeLevel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info" variant="soft" icon="calendarClock">
              {formatDateTime(visit.dateTime)}
            </Badge>
            {!editing && (
              <Button variant="secondary" icon="fileText" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </Card>

      {saved && (
        <div
          role="status"
          className="rounded-md border border-success bg-success/10 px-4 py-3 text-sm font-semibold text-text-primary"
        >
          Visit updated.
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

      <div className="grid grid-cols-1 gap-4">
        <Card aria-labelledby="visit-context-title">
          <CardHeader
            titleId="visit-context-title"
            title="Visit context"
            icon={<Icon name="stethoscope" />}
          />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-text-secondary">Student</p>
              <p className="text-sm font-semibold text-text-primary">{visit.student.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary">Student Number</p>
              <p className="text-sm font-semibold text-text-primary">{visit.student.studentNumber}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary">Logged by</p>
              <p className="text-sm font-semibold text-text-primary">{visit.loggedBy}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary">Event tag</p>
              <p className="text-sm font-semibold text-text-primary">
                {visit.eventTag || 'No event tag'}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card aria-labelledby="visit-detail-title">
          <CardHeader
            titleId="visit-detail-title"
            title={editing ? 'Edit visit details' : 'Visit details'}
            description={
              editing
                ? 'Updating this record writes an audit entry.'
                : 'Clinical details are visible because this is one deliberately opened visit.'
            }
            icon={<Icon name="clipboardList" />}
            actions={
              <Badge tone={editing ? 'warning' : 'success'} variant="soft">
                {editing ? 'Editing' : dispositionLabel[visit.disposition]}
              </Badge>
            }
          />
          <CardBody>
            {editing ? (
              <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
                <TextareaField
                  label="Complaint"
                  value={values.complaint}
                  error={errors.complaint}
                  onChange={(value) => setField('complaint', value)}
                />
                <TextareaField
                  label="Treatment notes"
                  required={false}
                  hint="Care that isn't stock: rest, cold compress, wound cleaning, advice. Needed unless a medicine or supply is listed below."
                  value={values.treatment}
                  error={errors.treatment}
                  onChange={(value) => setField('treatment', value)}
                />
                <ItemsGivenField
                  items={visit.items}
                  lines={lines}
                  saved={visit.itemsGiven}
                  allergies={visit.student.allergies}
                  error={errors.itemsGiven}
                  onChange={(next) => {
                    setLines(next)
                    setSaved(null)
                    setErrors((current) => ({ ...current, treatment: undefined, itemsGiven: undefined }))
                  }}
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
                <Input
                  label="Event tag"
                  value={values.eventTag}
                  placeholder="Optional school event"
                  onChange={(event) => setField('eventTag', event.target.value)}
                />
                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                  <Button variant="neutral" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" icon="checkCircle" loading={saving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <section>
                  <h2 className="text-sm font-bold text-text-primary">Complaint</h2>
                  <p className="mt-1 text-sm text-text-primary">{visit.complaint}</p>
                </section>
                <section>
                  <h2 className="text-sm font-bold text-text-primary">Treatment notes</h2>
                  <p className="mt-1 text-sm text-text-primary">{visit.treatment || 'No treatment notes.'}</p>
                </section>
                <section>
                  <h2 className="text-sm font-bold text-text-primary">Medicines &amp; supplies given</h2>
                  {visit.itemsGiven.length ? (
                    <ul className="mt-1 flex flex-col gap-1 text-sm text-text-primary">
                      {visit.itemsGiven.map((line) => (
                        <li key={line.itemId}>{formatItemGiven(line)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-text-secondary">None recorded.</p>
                  )}
                </section>
                <section>
                  <h2 className="text-sm font-bold text-text-primary">Disposition</h2>
                  <Badge tone="info" variant="soft">
                    {dispositionLabel[visit.disposition]}
                  </Badge>
                </section>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function VisitDetailPage({
  viewer = getMockSessionUser(),
  visitId,
}: {
  viewer?: SessionUser
  visitId?: string
}) {
  const { data, status, reload } = useAsyncData(`visit-detail|${visitId ?? 'default'}`, () =>
    fetchVisitDetail(visitId),
  )

  if (viewer.role !== 'staff') {
    return (
      <div className="mx-auto max-w-page-narrow px-4 pt-10 pb-8 sm:px-8">
        <ErrorState title="Staff access required." />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-page-narrow px-4 pt-10 pb-8 sm:px-8">
        <ErrorState title="Unable to load visit detail." onRetry={reload} />
      </div>
    )
  }

  if (!data) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading visit detail...
        </p>
        <VisitDetailSkeleton />
      </>
    )
  }

  return <VisitDetailEditor initialVisit={data} />
}
