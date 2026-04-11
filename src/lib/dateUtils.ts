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
 * Formats a Date object into a MySQL compatible datetime string in UTC.
 */
export function formatUtcDateTime(dateInput: Date | string | number | null | undefined = new Date()): string {
  let date: Date;
  
  if (!dateInput) {
    date = new Date();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    date = parseMySqlDateAsUtc(dateInput);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    date = new Date();
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Safely parses a MySQL datetime string ("YYYY-MM-DD HH:mm:ss") as LOCAL time.
 * Prevents UTC misinterpretation in Firefox/Safari by replacing dashes with slashes.
 */
export function parseMySqlDateAsLocal(dateString: string): Date {
  if (!dateString) return new Date(NaN);
  const cleaned = dateString
    .replace('T', ' ')
    .replace(/\.\d+/, '')   
    .replace(/Z$/, '')       
    .replace(/[+-]\d{2}:\d{2}$/, ''); 
  const localString = cleaned.replace(/-/g, '/');
  return new Date(localString);
}

/**
 * Safely parses a MySQL datetime string as UTC time.
 * This is the correct way to handle dates that were stored in UTC.
 */
export function parseMySqlDateAsUtc(dateString: string): Date {
  if (!dateString) return new Date(NaN);
  const normalized = dateString
    .replace('T', ' ')
    .replace(/\.\d+/, '')
    .replace(/Z$/, '')
    .replace(/[+-]\d{2}:\d{2}$/, '');
  const isoString = normalized.replace(' ', 'T') + 'Z';
  return new Date(isoString);
}

/**
 * Formats a MySQL datetime string for display in the UI.
 * Standardizes on interpreting strings as UTC so browsers can apply local offset.
 */
export function formatDisplayDate(dateString: string | null | undefined, includeTime: boolean = true): string {
  if (!dateString) return 'N/A';
  const date = parseMySqlDateAsUtc(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const options: Intl.DateTimeFormatOptions = includeTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  
  return date.toLocaleString('en-US', options);
}
