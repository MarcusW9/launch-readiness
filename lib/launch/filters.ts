import { ACTIVITY_DEFINITIONS, resolveActivity, resolveImagery } from "./activities";
import { HAS_MISSING_INFORMATION_LABEL } from "./copy";
import { getMissingInformation } from "./information-overview";
import { summariseReadiness } from "./readiness";
import type { ActivityKey, LaunchStatus, Product } from "./types";

export type LaunchWindow = "all" | "7" | "14" | "30" | "later";
export type OutstandingFilter =
  | "all"
  | "imagery"
  | Exclude<ActivityKey, "studio-imagery" | "supplier-imagery">;

export type InformationFilter = "all" | "missing";

/** Where a product sits in its life: still being prepared, launched, or dropped. */
export type ProductTab = "active" | "launched" | "dropped";

export const PRODUCT_TABS: Array<{ value: ProductTab; label: string }> = [
  { value: "active", label: "Active" },
  { value: "launched", label: "Launched" },
  { value: "dropped", label: "Dropped" },
];

/** Shown, and matched, for products with no range or critical path assigned. */
export const NOT_ASSIGNED = "#N/A";

export interface ProductFilters {
  query: string;
  category: string;
  range: string;
  brand: string;
  criticalPath: string;
  /** "all" matches every tab, which keeps this module usable without the tab UI. */
  tab: "all" | ProductTab;
  readiness: "all" | LaunchStatus;
  window: LaunchWindow;
  outstanding: OutstandingFilter;
  information: InformationFilter;
}

export const EMPTY_FILTERS: ProductFilters = {
  query: "",
  category: "all",
  range: "all",
  brand: "all",
  criticalPath: "all",
  tab: "all",
  readiness: "all",
  window: "all",
  outstanding: "all",
  information: "all",
};

export function getProductTab(product: Product): ProductTab {
  if (product.lifecycle === "Dropped") return "dropped";
  if (product.lifecycle === "Live" || product.lifecycle === "Offsale") return "launched";
  return "active";
}

export function tabForReadiness(readiness: ProductFilters["readiness"]): ProductTab | undefined {
  if (readiness === "all") return undefined;
  if (readiness === "Dropped") return "dropped";
  if (readiness === "Live" || readiness === "Offsale") return "launched";
  return "active";
}

/** Status options that can match something on the given tab. */
export function readinessOptionsFor(tab: ProductFilters["tab"]): typeof READINESS_OPTIONS {
  if (tab === "all") return READINESS_OPTIONS;
  return READINESS_OPTIONS.filter(
    (option) => option.value === "all" || tabForReadiness(option.value) === tab,
  );
}

export const INFORMATION_OPTIONS: Array<{ value: InformationFilter; label: string }> = [
  { value: "all", label: "Any information" },
  { value: "missing", label: HAS_MISSING_INFORMATION_LABEL },
];

export function isInformationFilter(value: string | undefined): value is InformationFilter {
  return value === "all" || value === "missing";
}

export const LAUNCH_WINDOW_OPTIONS: Array<{ value: LaunchWindow; label: string }> = [
  { value: "all", label: "Any launch date" },
  { value: "7", label: "Next 7 days" },
  { value: "14", label: "Next 14 days" },
  { value: "30", label: "Next 30 days" },
  { value: "later", label: "More than 30 days away" },
];

export const OUTSTANDING_OPTIONS: Array<{ value: OutstandingFilter; label: string }> = [
  { value: "all", label: "Any activity" },
  { value: "imagery", label: "Imagery outstanding" },
  { value: "product-content", label: "Content outstanding" },
  { value: "variants", label: "Variants outstanding" },
  { value: "compliance", label: "Compliance outstanding" },
  { value: "product-setup", label: "Product setup outstanding" },
];

export const READINESS_OPTIONS: Array<{ value: ProductFilters["readiness"]; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "Ready", label: "Ready" },
  { value: "Action Required", label: "Action Required" },
  { value: "At Risk", label: "At Risk" },
  { value: "Live", label: "Live" },
  { value: "Offsale", label: "Offsale" },
  { value: "Dropped", label: "Dropped" },
];

export function isReadinessFilter(value: string | undefined): value is LaunchStatus {
  return (
    value === "Ready" ||
    value === "Action Required" ||
    value === "At Risk" ||
    value === "Live" ||
    value === "Offsale" ||
    value === "Dropped"
  );
}

export function isOutstandingFilter(value: string | undefined): value is OutstandingFilter {
  return OUTSTANDING_OPTIONS.some((option) => option.value === value);
}

function hasOutstanding(product: Product, filter: OutstandingFilter): boolean {
  if (filter === "all") return true;
  if (!summariseReadiness(product).isPreparing) return false;
  const activity = filter === "imagery" ? resolveImagery(product) : resolveActivity(product, filter);
  return activity.applies && activity.status !== "Complete";
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.query.trim().toLowerCase();

  return products.filter((product) => {
    if (query) {
      const haystack =
        `${product.name} ${product.id} ${product.brand} ${product.range ?? ""} ${product.criticalPath ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.tab !== "all" && getProductTab(product) !== filters.tab) return false;
    if (filters.category !== "all" && product.category !== filters.category) return false;
    if (filters.brand !== "all" && product.brand !== filters.brand) return false;
    if (filters.range !== "all" && (product.range ?? NOT_ASSIGNED) !== filters.range) return false;
    if (filters.criticalPath !== "all" && (product.criticalPath ?? NOT_ASSIGNED) !== filters.criticalPath) {
      return false;
    }

    const summary = summariseReadiness(product);
    if (filters.readiness !== "all" && summary.launchStatus !== filters.readiness) return false;

    if (filters.window !== "all") {
      const days = summary.daysToLaunch;
      if (filters.window === "later") {
        if (days <= 30) return false;
      } else if (days < 0 || days > Number(filters.window)) {
        return false;
      }
    }

    if (filters.information === "missing" && getMissingInformation(product).length === 0) return false;

    return hasOutstanding(product, filters.outstanding);
  });
}

export function getCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((product) => product.category))).sort();
}

/** Distinct values, sorted, with the "not assigned" value first when any product lacks one. */
function distinctWithGap(values: Array<string | undefined>): string[] {
  const assigned = Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort();
  return values.some((value) => !value) ? [NOT_ASSIGNED, ...assigned] : assigned;
}

export function getBrands(products: Product[]): string[] {
  return Array.from(new Set(products.map((product) => product.brand))).sort();
}

export function getRanges(products: Product[]): string[] {
  return distinctWithGap(products.map((product) => product.range));
}

export function getCriticalPaths(products: Product[]): string[] {
  return distinctWithGap(products.map((product) => product.criticalPath));
}

/** How many products fall on each tab once every other filter has been applied. */
export function countByTab(products: Product[], filters: ProductFilters): Record<ProductTab, number> {
  const counts: Record<ProductTab, number> = { active: 0, launched: 0, dropped: 0 };
  for (const product of filterProducts(products, { ...filters, tab: "all" })) {
    counts[getProductTab(product)] += 1;
  }
  return counts;
}

export function activityLabel(key: ActivityKey): string {
  return ACTIVITY_DEFINITIONS[key].name;
}
