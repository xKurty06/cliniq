import { Link } from 'react-router'
import { Badge, buttonClassName, Icon, Skeleton, type BadgeTone } from '../../../components'
import { useAsyncData } from '../../../hooks/useAsyncData'
import { formatDateTime } from '../../../lib/dates'
import { paths } from '../../../routes/paths'
import { fetchBackupIndicator, type BackupIndicator } from '../api/dashboardApi'

function backupState(backup: BackupIndicator): { tone: BadgeTone; label: string } {
  if (!backup.latest) return { tone: 'warning', label: 'No backup yet' }
  if (backup.latest.status === 'failed') return { tone: 'error', label: 'Backup failed' }
  return backup.needsVerification
    ? { tone: 'warning', label: 'Needs verification' }
    : { tone: 'success', label: 'Verified' }
}

/**
 * Staff-only strip at the top of the Dashboard (Screen Inventory #4, Reference 1): the quick
 * "New Visit" action and a minimal backup-status indicator that links to the full Backup screen.
 * Both are navigation, not mutations, so the Dashboard stays view-only (ADR-011). Admin/Principal
 * can open neither destination, so this strip isn't rendered for that role.
 */
export function StaffShortcuts() {
  const { data: backup, status } = useAsyncData('dashboard-backup', fetchBackupIndicator)
  const state = backup ? backupState(backup) : null

  return (
    <section aria-label="Staff shortcuts" className="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        to={paths.backup}
        aria-label={state ? `Backup status: ${state.label}. Open Backup.` : 'Backup status. Open Backup.'}
        className="flex min-h-10 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-card transition-colors hover:bg-surface motion-reduce:transition-none"
      >
        <span className="flex items-center gap-2 font-semibold text-text-primary">
          <Icon name="shieldPlus" className="text-brand-green-dark" />
          Backup
        </span>
        {status === 'error' ? (
          <span className="text-text-secondary">Status unavailable</span>
        ) : !backup || !state ? (
          <Skeleton className="h-5 w-56 max-w-full" />
        ) : (
          <>
            <Badge tone={state.tone} variant="soft">
              {state.label}
            </Badge>
            <span className="text-text-secondary">
              {backup.latest ? `Last backup ${formatDateTime(backup.latest.lastRun)}` : 'No backup has run yet'}
            </span>
          </>
        )}
      </Link>
      <Link to={paths.visitNew()} className={buttonClassName({ variant: 'primary' })}>
        <Icon name="stethoscope" />
        New Visit
      </Link>
    </section>
  )
}
