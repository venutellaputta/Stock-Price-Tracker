/**
 * Normalizes input string parameters (symbols, ranges, IDs)
 * Strips all apostrophes ('), quotes ("), leading/trailing whitespace, and converts to uppercase.
 * Prevents bugs like 'TCS'' or '1D''.
 */
export function cleanParam(val: any, defaultVal: string = ''): string {
  if (val === null || val === undefined) return defaultVal;
  return String(val)
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/['"]/g, '')
    .toUpperCase();
}
