import { filterProducts, NOT_ASSIGNED, type ProductFilters } from "./filters";
import { assessProduct, type ModelStatus } from "./readiness-model";
import type { Product } from "./types";

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
  counts: Record<ModelStatus, number>;
  flagged: { dateChanged: number; stockAfterLaunch: number };
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
  const counts: Record<ModelStatus, number> = { "Expectation At Risk": 0, "Information Incomplete": 0, "On Track": 0 };
  let dateChanged = 0;
  let stockAfterLaunch = 0;

  for (const product of active) {
    const assessment = assessProduct(product);
    counts[assessment.status] += 1;
    if (assessment.flags.dateChanged) dateChanged += 1;
    if (assessment.flags.stockAfterLaunch) stockAfterLaunch += 1;
  }

  return {
    name,
    activeLines: active.length,
    mainDate: main?.date,
    otherDates: others,
    counts,
    flagged: { dateChanged, stockAfterLaunch },
  };
}
