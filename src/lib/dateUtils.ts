/**
 * Formats a Date object into a MySQL compatible datetime string in Asia/Dhaka time.
 * Example output: "2026-04-08 11:20:32"
 */
export function formatLocalDateTime(date: Date = new Date()): string {
  // Use Intl.DateTimeFormat to get components in Asia/Dhaka timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value;

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');

  // Intl handles 24h as 24:00:00 in some cases or "00" as "24" depending on implementation
  // We want 00-23
  const hourFormatted = hour === '24' ? '00' : hour;

  return `${year}-${month}-${day} ${hourFormatted}:${minute}:${second}`;
}

