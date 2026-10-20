import { getSelectedCriticalPath } from "./critical-path";
import { EMPTY_FILTERS, type ProductFilters } from "./filters";
import { getMissingInformation } from "./information-overview";
import { DEMO_TODAY, formatLongDate, formatShortDate, summariseReadiness } from "./readiness";
import type { Product } from "./types";

/** Monday of the demo week. The "Changed this week" section covers this date up to the demo date. */
export const WEEK_COMMENCING = "2026-11-09";

/** Information is needed this many working days before launch (three working weeks). */
export const INFO_LEAD_WORKING_DAYS = 15;

/** Information items are listed once their deadline has passed or falls within this many working days. */
export const INFO_HORIZON_WORKING_DAYS = 10;

export const SUMMARY_RECIPIENTS = [
  { value: "downstream", label: "Downstream teams" },
  { value: "commercial", label: "Commercial and Range Planning" },
] as const;

const DAY_MS = 86_400_000;

function toUtc(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function isWeekend(ms: number): boolean {
  const day = new Date(ms).getUTCDay();
  return day === 0 || day === 6;
}

/** Monday to Friday between two dates, excluding the start and including the end. Negative when `to` is earlier. */
export function workingDaysBetween(from: string, to: string): number {
  const start = toUtc(from);
  const end = toUtc(to);
  const step = end >= start ? 1 : -1;
  let count = 0;
  for (let ms = start + step * DAY_MS; step > 0 ? ms <= end : ms >= end; ms += step * DAY_MS) {
    if (!isWeekend(ms)) count += step;
  }
  return count;
}

/** Moves a date by whole working days. A weekend start date counts as the nearest earlier working day when stepping back. */
export function addWorkingDays(isoDate: string, days: number): string {
  const step = days >= 0 ? 1 : -1;
  let ms = toUtc(isoDate);
  let remaining = Math.abs(days);
  while (remaining > 0) {
    ms += step * DAY_MS;
    if (!isWeekend(ms)) remaining -= 1;
  }
  return fromUtc(ms);
}

export interface AtRiskItem {
  product: Product;
  workingDaysToLaunch: number;
}

export interface InfoNeededItem {
  product: Product;
  missingCount: number;
  neededBy: string;
  /** Negative once the deadline has passed. */
  workingDaysToDeadline: number;
}

export interface DateChangeItem {
  product: Product;
  previousLaunchDate: string;
  changedOn: string;
}

export interface StockAfterLaunchItem {
  product: Product;
  stockLandsDate: string;
}

export interface WeeklySummary {
  scopeLabel: string;
  subject: string;
  total: number;
  atRiskCount: number;
  incompleteCount: number;
  onTrackCount: number;
  atRisk: AtRiskItem[];
  infoNeeded: InfoNeededItem[];
  dateChanges: DateChangeItem[];
  stockAfterLaunch: StockAfterLaunchItem[];
}

export const ALL_ACTIVE_LABEL = "All active products";

/**
 * Scope: the selected Critical Path (chosen directly or by a search that matches exactly one),
 * otherwise every Active product. Status cards, tabs and every other filter are ignored.
 */
export function buildWeeklySummary(products: Product[], filters: ProductFilters): WeeklySummary {
  const criticalPath = getSelectedCriticalPath(products, {
    ...EMPTY_FILTERS,
    query: filters.query,
    criticalPath: filters.criticalPath,
  });
  const active = products.filter((product) => !product.lifecycle);
  const scoped = criticalPath ? active.filter((product) => product.criticalPath === criticalPath) : active;
  const scopeLabel = criticalPath ?? ALL_ACTIVE_LABEL;

  const readinessOf = (product: Product) => summariseReadiness(product).launchStatus;
  const byLaunch = (a: Product, b: Product) => a.launchDate.localeCompare(b.launchDate) || a.id.localeCompare(b.id);

  const atRisk = scoped
    .filter((product) => readinessOf(product) === "At Risk")
    .sort(byLaunch)
    .map((product) => ({ product, workingDaysToLaunch: workingDaysBetween(DEMO_TODAY, product.launchDate) }));

  const horizon = addWorkingDays(DEMO_TODAY, INFO_HORIZON_WORKING_DAYS);
  const infoNeeded = scoped
    .filter((product) => readinessOf(product) === "Action Required")
    .map((product) => {
      const neededBy = addWorkingDays(product.launchDate, -INFO_LEAD_WORKING_DAYS);
      return {
        product,
        missingCount: getMissingInformation(product).length,
        neededBy,
        workingDaysToDeadline: workingDaysBetween(DEMO_TODAY, neededBy),
      };
    })
    .filter((item) => item.missingCount > 0 && item.neededBy <= horizon)
    .sort((a, b) => a.neededBy.localeCompare(b.neededBy) || a.product.id.localeCompare(b.product.id));

  const dateChanges = scoped
    .filter(
      (product) =>
        product.previousLaunchDate &&
        product.launchDateChangedOn &&
        product.launchDateChangedOn >= WEEK_COMMENCING &&
        product.launchDateChangedOn <= DEMO_TODAY,
    )
    .sort((a, b) => (b.launchDateChangedOn ?? "").localeCompare(a.launchDateChangedOn ?? "") || byLaunch(a, b))
    .map((product) => ({
      product,
      previousLaunchDate: product.previousLaunchDate as string,
      changedOn: product.launchDateChangedOn as string,
    }));

  const stockAfterLaunch = scoped
    .filter((product) => product.stockLandsDate && product.stockLandsDate > product.launchDate)
    .sort(byLaunch)
    .map((product) => ({ product, stockLandsDate: product.stockLandsDate as string }));

  return {
    scopeLabel,
    subject: `Launch Readiness weekly summary \u2013 ${scopeLabel} \u2013 w/c ${formatShortDate(WEEK_COMMENCING)} ${WEEK_COMMENCING.slice(0, 4)}`,
    total: scoped.length,
    atRiskCount: atRisk.length,
    incompleteCount: scoped.filter((product) => readinessOf(product) === "Action Required").length,
    onTrackCount: scoped.filter((product) => readinessOf(product) === "Ready").length,
    atRisk,
    infoNeeded,
    dateChanges,
    stockAfterLaunch,
  };
}

export const WEEKLY_SUMMARY_FOOTER = `Generated from Launch Readiness on ${formatLongDate(DEMO_TODAY)}. Prototype: no email is sent.`;

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

export function headline(summary: WeeklySummary): string {
  return `${plural(summary.total, "product")}: ${summary.atRiskCount} at risk, ${summary.incompleteCount} information incomplete, ${summary.onTrackCount} on track`;
}

export function deadlineLabel(item: InfoNeededItem): string {
  const days = item.workingDaysToDeadline;
  if (days < 0) return `passed ${plural(-days, "working day")} ago`;
  if (days === 0) return "due today";
  return `in ${plural(days, "working day")}`;
}

export function launchGapLabel(item: AtRiskItem): string {
  const days = item.workingDaysToLaunch;
  if (days < 0) return `${plural(-days, "working day")} past launch`;
  return `${plural(days, "working day")} to launch`;
}

/** The same content as the preview, as plain text for copying into an email. */
export function weeklySummaryText(summary: WeeklySummary): string {
  const lines: string[] = [`Subject: ${summary.subject}`, "", headline(summary), ""];
  const section = (title: string, rows: string[]) => {
    lines.push(`${title} (${rows.length})`);
    lines.push(...(rows.length ? rows.map((row) => `- ${row}`) : ["- None"]));
    lines.push("");
  };

  section(
    "Needs attention: At Risk",
    summary.atRisk.map(
      (item) =>
        `${item.product.id} ${item.product.name}: ${launchGapLabel(item)}, launches ${formatShortDate(item.product.launchDate)}`,
    ),
  );
  section(
    "Information needed soon",
    summary.infoNeeded.map(
      (item) =>
        `${item.product.id} ${item.product.name}: ${plural(item.missingCount, "item")} missing, needed by ${formatShortDate(item.neededBy)} (${deadlineLabel(item)})`,
    ),
  );
  section(
    "Changed this week: launch date",
    summary.dateChanges.map(
      (item) =>
        `${item.product.id} ${item.product.name}: ${formatShortDate(item.previousLaunchDate)} to ${formatShortDate(item.product.launchDate)}`,
    ),
  );
  section(
    "Changed this week: stock lands after launch",
    summary.stockAfterLaunch.map(
      (item) =>
        `${item.product.id} ${item.product.name}: stock lands ${formatShortDate(item.stockLandsDate)}, launches ${formatShortDate(item.product.launchDate)}`,
    ),
  );
  lines.push(WEEKLY_SUMMARY_FOOTER);
  return lines.join("\n");
}
