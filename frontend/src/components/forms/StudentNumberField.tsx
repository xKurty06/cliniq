import { Input } from '../ui/Input'

/**
 * Student Number entry for a form that opened without an identified student (New Visit, Incident
 * Stage 1, PE/Sports Referral). Pair it with `useIdentifiedStudent`, which formats and looks up the
 * number. Only shown when no student was identified beforehand.
 */
export function StudentNumberField({
  value,
  error,
  onChange,
  hint = 'No student was identified before this form opened. Type the Student Number.',
}: {
  value: string
  error?: string
  onChange: (value: string) => void
  hint?: string
}) {
  return (
    <Input
      label="Student Number"
      value={value}
      required
      inputMode="numeric"
      autoComplete="off"
      placeholder="YYYY-NNNNN"
      hint={hint}
      error={error}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
