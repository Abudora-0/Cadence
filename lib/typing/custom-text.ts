export const CUSTOM_TEXT_MAX_CHARS = 8000;
const MIN_TOKENS = 1;
const MAX_TOKENS = 600;

/**
 * Turns a pasted passage into the engine's word list. Mirrors how `code` mode
 * handles newlines: they become a visible return token.
 */
export function tokenizeCustomText(raw: string): string[] {
  const norm = raw.replace(/\r\n?/g, "\n").replace(/\t/g, " ").trim();
  if (!norm) return [];
  return norm
    .replace(/\n{2,}/g, "\n")
    .replace(/\n/g, " ↵ ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_TOKENS);
}

export function customTokenCount(raw: string): number {
  return tokenizeCustomText(raw).length;
}

/** Whether a passage is long enough (and short enough) to run. */
export function isUsableCustomText(raw: string): boolean {
  const n = tokenizeCustomText(raw).length;
  return n >= MIN_TOKENS && raw.trim().length > 0 && n <= MAX_TOKENS;
}
