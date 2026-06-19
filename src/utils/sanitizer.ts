const MAX_HABIT_LENGTH = 300;
const ALLOWED_PATTERN = /^[\w\s.,\-'"/()]+$/;

/**
 * Sanitizes a raw habit string from user input.
 * Trims whitespace, enforces length, and strips disallowed characters.
 * @param raw - The raw input string from the request body.
 * @returns A sanitized string, or empty string if invalid.
 */
export function sanitizeHabitInput(raw: string): string {
  const trimmed = raw.trim().slice(0, MAX_HABIT_LENGTH);
  if (!trimmed) return "";
  if (!ALLOWED_PATTERN.test(trimmed)) return "";
  return trimmed;
}
