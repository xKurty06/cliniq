import type { IconName } from '../icons/Icon'
import { Badge, type BadgeTone, type BadgeVariant } from './Badge'

/**
 * One definition per status value (label + tone + icon), so the same status looks the same on
 * every screen that shows it. Domain maps live in `components/status/`.
 */
export interface StatusDefinition {
  label: string
  tone: BadgeTone
  icon?: IconName
  variant?: BadgeVariant
}

export type StatusMap<S extends string> = Record<S, StatusDefinition>

export interface StatusBadgeProps<S extends string> {
  status: S
  map: StatusMap<S>
  /** Replaces the map's label when the status needs detail, e.g. "Expires in 12 days". */
  label?: string
  className?: string
}

export function StatusBadge<S extends string>({
  status,
  map,
  label,
  className,
}: StatusBadgeProps<S>) {
  const def = map[status]
  return (
    <Badge tone={def.tone} variant={def.variant} icon={def.icon} className={className}>
      {label ?? def.label}
    </Badge>
  )
}
