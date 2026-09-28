import { useEffect, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../icons/Icon'

export function Modal({ open, title, children, onClose, className }: { open: boolean; title: string; children: ReactNode; onClose: () => void; className?: string }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])
  if (!open) return null
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-text-primary/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={cn('w-full max-w-lg rounded-lg bg-background shadow-card', className)}><div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4"><h2 id="modal-title" className="text-base font-semibold text-text-primary">{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose} className="cursor-pointer rounded-md p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"><Icon name="xCircle" /></button></div><div className="p-5">{children}</div></section></div>
}
