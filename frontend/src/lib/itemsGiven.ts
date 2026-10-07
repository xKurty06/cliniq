import type { ItemLineDraft } from '../components/forms/ItemsGivenField'
import type { ItemGivenLine, Visit } from '../types/entities'

/** "Paracetamol 500mg × 2 tablets (1 tablet every 6 hours)", from the line's own snapshot. */
export function formatItemGiven(line: Pick<ItemGivenLine, 'itemName' | 'quantity' | 'unit' | 'instructions'>): string {
  return `${line.itemName} × ${line.quantity} ${line.unit}${line.instructions ? ` (${line.instructions})` : ''}`
}

/** One line of care for a visit in a history list: the treatment notes, then what was given. */
export function visitCareSummary(visit: Pick<Visit, 'treatment' | 'itemsGiven'>): string {
  const given = visit.itemsGiven.map(formatItemGiven).join('; ')
  return [visit.treatment.trim(), given && `Given: ${given}`].filter(Boolean).join(' · ')
}

/** Editable drafts from a saved record's lines, for an edit form. */
export function draftsFrom(lines: ReadonlyArray<ItemGivenLine>): ItemLineDraft[] {
  return lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity, instructions: line.instructions ?? '' }))
}
