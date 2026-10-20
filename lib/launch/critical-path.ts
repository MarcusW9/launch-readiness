import { filterProducts, NOT_ASSIGNED, type ProductFilters } from "./filters";
import { getMissingInformation } from "./information-overview";
import { summariseReadiness } from "./readiness";
import type { Product, Readiness } from "./types";

export interface LaunchDateCount {
  date: string;
  count: number;
}

export interface CriticalPathSummary {
  name: string;
  /** Products in this critical path that are still being prepared for launch. */
  activeLines: number;
  mainDate: string | undefined;
  /** Every other proposed launch date in the path, most common first. */
  otherDates: LaunchDateCount[];
  counts: Record<Readiness, number>;
  flagged: { blocked: number; missingInformation: number };
}

/**
 * The one critical path the list is focused on, or undefined.
 *
 * It is the Critical Path filter when that names a path, or the search when every product
 * it matches sits in the same critical path. Other filters never trigger it on their own.
 */
export function getSelectedCriticalPath(products: Product[], filters: ProductFilters): string | undefined {
  if (filters.criticalPath !== "all") {
    return filters.criticalPath === NOT_ASSIGNED ? undefined : filters.criticalPath;
  }
  if (!filters.query.trim()) return undefined;

  const matches = filterProducts(products, { ...filters, tab: "all" });
  const paths = new Set(matches.map((product) => product.criticalPath));
  const [only] = Array.from(paths);
  return paths.size === 1 ? only : undefined;
}

/** Date counts, most common first. Ties go to the earlier date. */
export function countLaunchDates(products: Product[]): LaunchDateCount[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.launchDate, (counts.get(product.launchDate) ?? 0) + 1);
  }
  return Array.from(counts, ([date, count]) => ({ date, count })).sort(
    (a, b) => b.count - a.count || a.date.localeCompare(b.date),
  );
}

/** Summary of the active products matching the current filters, or undefined when no single path is selected. */
export function summariseCriticalPath(
  products: Product[],
  filters: ProductFilters,
): CriticalPathSummary | undefined {
  const name = getSelectedCriticalPath(products, filters);
  if (!name) return undefined;

  const active = filterProducts(products, { ...filters, tab: "active" }).filter(
    (product) => product.criticalPath === name,
  );
  const [main, ...others] = countLaunchDates(active);
  const counts: Record<Readiness, number> = { Ready: 0, "Action Required": 0, "At Risk": 0 };
  let blocked = 0;
  let missingInformation = 0;

  for (const product of active) {
    const summary = summariseReadiness(product);
    counts[summary.readiness] += 1;
    if (summary.outstanding.some((activity) => activity.status === "Blocked")) blocked += 1;
    if (getMissingInformation(product).length > 0) missingInformation += 1;
  }

  return {
    name,
    activeLines: active.length,
    mainDate: main?.date,
    otherDates: others,
    counts,
    flagged: { blocked, missingInformation },
  };
}
