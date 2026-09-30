import { cn } from '../../lib/cn'
import { Icon } from '../icons/Icon'
import { Button } from './Button'

/**
 * Failed-to-load message with a retry action. Plain language only; never surface a raw API error
 * (Design-System.md, Feedback & System States).
 */
export function ErrorState({
  title = 'Unable to load this information.',
  description = 'Check that the clinic server is running, then try again.',
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-error bg-background px-4 py-6 text-center',
        className,
      )}
    >
      <Icon name="alertOctagon" size={20} className="text-error" />
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary">{description}</p>
      {onRetry && (
        <Button variant="primary" size="sm" icon="refresh" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
