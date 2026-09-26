import type { FollowUpStatus } from '../../types/entities'
import type { StatusMap } from '../ui/StatusBadge'

/** FollowUp.status lifecycle (Module 3): Pending → Completed / Missed / Cancelled. */
export const followUpStatusMap: StatusMap<FollowUpStatus> = {
  pending: { label: 'Pending', tone: 'info', icon: 'clock', variant: 'outline' },
  completed: { label: 'Completed', tone: 'success', icon: 'checkCircle' },
  missed: { label: 'Missed', tone: 'error', icon: 'xCircle' },
  cancelled: { label: 'Cancelled', tone: 'neutral', icon: 'xCircle' },
}

/**
 * How close a *pending* follow-up is to its date. It's computed fresh from today's date on every page
 * load (Module 9), never by a background job. This is a display state, not a new FollowUp.status:
 * an overdue follow-up stays `pending` until Staff marks it Missed or Completed.
 */
export type FollowUpDueState = 'overdue' | 'due_today' | 'upcoming'

export const followUpDueMap: StatusMap<FollowUpDueState> = {
  overdue: { label: 'Overdue', tone: 'error', icon: 'alertOctagon' },
  due_today: { label: 'Due today', tone: 'warning', icon: 'clock' },
  upcoming: { label: 'Upcoming', tone: 'info', icon: 'calendarClock', variant: 'outline' },
}
