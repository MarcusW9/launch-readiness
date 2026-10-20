const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toTime = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Saturday or Sunday. Bank holidays are deliberately ignored. */
export function isWeekend(isoDate: string): boolean {
  const day = new Date(toTime(isoDate)).getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Moves an ISO date forward (or back, for a negative count) by whole working days, Monday to Friday.
 * Weekend days are skipped, so a start on a weekend counts from the nearest weekday in that direction.
 */
export function addWorkingDays(isoDate: string, days: number): string {
  const step = days < 0 ? -1 : 1;
  let remaining = Math.abs(days);
  let time = toTime(isoDate);
  while (remaining > 0) {
    time += step * MS_PER_DAY;
    if (!isWeekend(toIso(time))) remaining -= 1;
  }
  return toIso(time);
}

/**
 * Working days from one date to another: weekdays after `from`, up to and including `to`.
 * Negative when `to` is earlier than `from`.
 */
export function workingDaysBetween(from: string, to: string): number {
  const start = toTime(from);
  const end = toTime(to);
  if (start === end) return 0;
  const sign = end > start ? 1 : -1;
  const [first, last] = sign === 1 ? [start, end] : [end, start];
  let count = 0;
  for (let time = first + MS_PER_DAY; time <= last; time += MS_PER_DAY) {
    if (!isWeekend(toIso(time))) count += 1;
  }
  return sign * count;
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
