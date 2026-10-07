/** Longest complaint a visit stores. The field stops typing here, and saving trims to it. */
export const COMPLAINT_MAX_LENGTH = 60

/** Trims, collapses repeated whitespace, and caps the length. Whitespace-only becomes ''. */
export function cleanComplaint(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, COMPLAINT_MAX_LENGTH).trim()
}

/**
 * The complaint as it should be stored: cleaned, and spelled like an existing suggestion when it
 * matches one case-insensitively, so "headache" and "Headache" are never counted apart.
 */
export function normalizeComplaint(text: string, known: ReadonlyArray<string>): string {
  const cleaned = cleanComplaint(text)
  const lower = cleaned.toLowerCase()
  return known.find((label) => label.toLowerCase() === lower) ?? cleaned
}
