import { Button } from '../../../components'
import { formatLongDate } from '../../../lib/dates'
import type { ISODate } from '../../../types/entities'

export function DashboardHeader({ today, onPrint }: { today: ISODate; onPrint: () => void }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Clinic Overview</h1>
        <p className="text-sm text-text-secondary">
          <time dateTime={today}>{formatLongDate(today)}</time>
          <span aria-hidden="true"> · </span>
          Clinic activity, alerts, and trends. View only.
        </p>
      </div>
      <Button variant="secondary" icon="printer" onClick={onPrint} className="print:hidden">
        Print / Save as PDF
      </Button>
    </header>
  )
}
