/**
 * Formats a Date object into a MySQL compatible datetime string in local time.
 * Example output: "2026-04-08 11:20:32"
 */
export function formatLocalDateTime(dateInput: Date | string | number | null | undefined = new Date()): string {
  let date: Date;
  
  if (!dateInput) {
    date = new Date();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    // Safely parse MySQL-style datetime strings (YYYY-MM-DD HH:mm:ss) as LOCAL time.
    // Browsers (Firefox, Safari) treat "YYYY-MM-DD HH:mm:ss" as UTC unless we use slashes.
    date = parseMySqlDateAsLocal(dateInput);
  } else {
    date = new Date(dateInput);
  }

  // If date is still invalid, use current date
  if (isNaN(date.getTime())) {
    date = new Date();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Safely parses a MySQL datetime string ("YYYY-MM-DD HH:mm:ss") as LOCAL time.
 * Prevents UTC misinterpretation in Firefox/Safari by replacing dashes with slashes.
 * Also handles ISO strings with Z suffix by stripping timezone info.
 */
export function parseMySqlDateAsLocal(dateString: string): Date {
  if (!dateString) return new Date(NaN);
  // Strip ISO 8601 timezone suffix (Z or ±HH:MM) and milliseconds
  const cleaned = dateString
    .replace('T', ' ')
    .replace(/\.\d+/, '')   // remove milliseconds
    .replace(/Z$/, '')       // remove trailing Z
    .replace(/[+-]\d{2}:\d{2}$/, ''); // remove ±HH:MM offset
  // Replace hyphens in date part with slashes so all browsers parse as local
  const localString = cleaned.replace(/-/g, '/');
  return new Date(localString);
}

/**
 * Formats a MySQL datetime string for display in the UI (local time).
 * Returns "Jan 5, 2026, 9:47 AM" or "Jan 5, 2026" depending on includeTime.
 */
export function formatDisplayDate(dateString: string | null | undefined, includeTime: boolean = true): string {
  if (!dateString) return 'N/A';
  const date = parseMySqlDateAsLocal(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const options: Intl.DateTimeFormatOptions = includeTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  
  return date.toLocaleString('en-US', options);
}
