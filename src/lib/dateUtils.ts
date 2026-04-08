/**
 * Formats a Date object into a MySQL compatible datetime string in local time.
 * Example output: "2026-04-08 11:20:32"
 */
export function formatLocalDateTime(date: Date = new Date()): string {
  // Use ISO format without timezone, then adjust to local components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
