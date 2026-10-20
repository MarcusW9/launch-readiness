import { getSelectedCriticalPath } from "./critical-path";
import { EMPTY_FILTERS, type ProductFilters } from "./filters";
import { DEMO_TODAY, formatLongDate, formatShortDate } from "./readiness";
import { assessProduct } from "./readiness-model";
import type { Product } from "./types";
import { addWorkingDays, workingDaysBetween } from "./working-days";

export { addWorkingDays, workingDaysBetween };

/** Monday of the demo week. The "Changed this week" section covers this date up to the demo date. */
export const WEEK_COMMENCING = "2026-11-09";

/** Information items are listed once their deadline has passed or falls within this many working days. */
export const INFO_HORIZON_WORKING_DAYS = 10;

export const SUMMARY_RECIPIENTS = [
  { value: "downstream", label: "Downstream teams" },
  { value: "commercial", label: "Commercial and Range Planning" },
] as const;

export interface AtRiskItem {
  product: Product;
  workingDaysToLaunch: number;
  /** Working days the SLA Projection Date falls after the Proposed Launch Date. */
  gapWorkingDays: number;
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

  const assessed = scoped.map((product) => assessProduct(product));
  const byLaunch = (a: Product, b: Product) => a.launchDate.localeCompare(b.launchDate) || a.id.localeCompare(b.id);

  const atRisk = assessed
    .filter((assessment) => assessment.status === "Expectation At Risk")
    .sort((a, b) => byLaunch(a.product, b.product))
    .map((assessment) => ({
      product: assessment.product,
      workingDaysToLaunch: workingDaysBetween(DEMO_TODAY, assessment.product.launchDate),
      gapWorkingDays: assessment.gapWorkingDays,
    }));

  const horizon = addWorkingDays(DEMO_TODAY, INFO_HORIZON_WORKING_DAYS);
  const infoNeeded = assessed
    .filter((assessment) => assessment.status === "Information Incomplete" && assessment.infoNeededBy)
    .map((assessment) => {
      const neededBy = assessment.infoNeededBy as string;
      return {
        product: assessment.product,
        missingCount: assessment.completeness.missingMandatory.length,
        neededBy,
        workingDaysToDeadline: workingDaysBetween(DEMO_TODAY, neededBy),
      };
    })
    .filter((item) => item.neededBy <= horizon)
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
    incompleteCount: assessed.filter((assessment) => assessment.status === "Information Incomplete").length,
    onTrackCount: assessed.filter((assessment) => assessment.status === "On Track").length,
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
        `${item.product.id} ${item.product.name}: ${launchGapLabel(item)}, ${plural(item.gapWorkingDays, "working day")} late, launches ${formatShortDate(item.product.launchDate)}`,
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
