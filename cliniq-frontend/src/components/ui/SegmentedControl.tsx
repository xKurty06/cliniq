import { useRef, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../icons/Icon'

export interface SegmentOption<V extends string> {
  value: V
  label: string
  icon?: IconName
}

export interface SegmentedControlProps<V extends string> {
  /** Accessible name, e.g. "Calendar view". */
  label: string
  options: ReadonlyArray<SegmentOption<V>>
  value: V
  onChange: (value: V) => void
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Segmented toggle, built as an ARIA radiogroup: Tab lands on the selected option, and Arrow keys,
 * Home, and End move the selection. The selected state uses fill, border, and weight together,
 * never color alone.
 */
export function SegmentedControl<V extends string>({
  label,
  options,
  value,
  onChange,
  size = 'sm',
  className,
}: SegmentedControlProps<V>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  function select(index: number) {
    const next = options[(index + options.length) % options.length]
    onChange(next.value)
    refs.current[(index + options.length) % options.length]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keyMap: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: options.length - 1,
    }
    if (event.key in keyMap) {
      event.preventDefault()
      select(keyMap[event.key])
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex rounded-md border border-border bg-surface p-0.5', className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm border px-2.5 transition-colors duration-150 motion-reduce:transition-none',
              size === 'sm' ? 'h-7 text-xs' : 'h-8 text-sm',
              selected
                ? 'border-brand-green-dark bg-brand-green-dark font-semibold text-white'
                : 'border-transparent font-medium text-text-secondary hover:text-text-primary',
            )}
          >
            {option.icon && <Icon name={option.icon} size={14} />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
