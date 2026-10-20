/**
 * The prototype runs on a fixed demo date so the data never goes stale.
 */
export const DEMO_TODAY = "2026-11-10";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysUntil(isoDate: string, from: string = DEMO_TODAY): number {
  const target = Date.parse(`${isoDate}T00:00:00Z`);
  const origin = Date.parse(`${from}T00:00:00Z`);
  return Math.round((target - origin) / MS_PER_DAY);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "24 Nov". Done by hand so server and client render identically. */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]}`;
}

export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function formatTimestamp(iso: string): string {
  const [datePart, timePart = "00:00"] = iso.split("T");
  const time = timePart.slice(0, 5);
  return `${formatShortDate(datePart)}, ${time}`;
}

export function describeDaysToLaunch(days: number): string {
  if (days === -1) return "1 day ago";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}
