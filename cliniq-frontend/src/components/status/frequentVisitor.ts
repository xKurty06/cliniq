import type { StatusMap } from '../ui/StatusBadge'

/**
 * Frequent-visitor flag (Module 9). The label says "warning" on purpose. It's an observation for
 * the nurse to act on at her discretion, never styled or worded as a diagnosis or a suggested action.
 */
export type FrequentVisitorFlag = 'frequent_visits'

export const frequentVisitorMap: StatusMap<FrequentVisitorFlag> = {
  frequent_visits: {
    label: 'Frequent-visit warning',
    tone: 'warning',
    icon: 'alertTriangle',
    variant: 'soft',
  },
}
