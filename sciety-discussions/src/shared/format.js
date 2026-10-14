const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parts(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return { d: d.getUTCDate(), m: MONTHS[d.getUTCMonth()], y: d.getUTCFullYear() };
}

/** "March 11, 2024" (Sciety meta style) */
export function formatDate(value) {
  const p = parts(value);
  return p ? `${p.m} ${p.d}, ${p.y}` : '';
}

/** "4 December, 2025" (discussion header style) */
export function formatDayMonthYear(value) {
  const p = parts(value);
  return p ? `${p.d} ${p.m}, ${p.y}` : '';
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const STEPS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "2 weeks ago", "yesterday", or "today" for anything less than a day old */
export function timeAgo(value, now = Date.now()) {
  const seconds = (new Date(value).getTime() - now) / 1000;
  if (Math.abs(seconds) < 24 * 3600) return 'today';
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'today';
}

/** "5 January 2026" (discussions style) */
export function formatLongDate(value) {
  const p = parts(value);
  return p ? `${p.d} ${p.m} ${p.y}` : '';
}
