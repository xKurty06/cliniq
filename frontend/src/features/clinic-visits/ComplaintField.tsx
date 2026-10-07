import { Combobox } from '../../components'
import { cleanComplaint, COMPLAINT_MAX_LENGTH } from '../../lib/complaints'

/** How many complaint suggestions the list shows at once. */
const COMPLAINT_SUGGESTION_LIMIT = 8

/**
 * The visit Complaint field (cliniq-combobox-patterns): free text with suggestions, filtered by a
 * case-insensitive "contains" match. Used by New Visit and the Visit Detail edit form; both save
 * through `normalizeComplaint`.
 */
export function ComplaintField({
  value,
  onChange,
  suggestions,
  error,
}: {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  error?: string
}) {
  const typed = cleanComplaint(value).toLowerCase()
  const matches = suggestions.filter((label) => label.toLowerCase().includes(typed)).slice(0, COMPLAINT_SUGGESTION_LIMIT)
  return (
    <Combobox
      label="Complaint"
      required
      allowFreeText
      value={value}
      onValueChange={onChange}
      options={matches}
      optionKey={(label) => label}
      optionLabel={(label) => label}
      noMatchesText="No matching suggestion. What you typed is saved as is."
      maxLength={COMPLAINT_MAX_LENGTH}
      placeholder="e.g. Headache"
      hint="The complaint or symptom only. Don't include names."
      error={error}
    />
  )
}
