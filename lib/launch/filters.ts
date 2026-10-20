import { assessProduct, STATUS_CARD_LABEL, type ModelStatus } from "./readiness-model";
import { daysUntil } from "./readiness";
import type { Product } from "./types";

export type LaunchWindow = "all" | "7" | "14" | "30" | "later";

/** Extra flags shown beside the status. A product can carry both. */
export type FlagFilter = "all" | "dateChanged" | "stockAfterLaunch";

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
  status: "all" | ModelStatus;
  flag: FlagFilter;
  window: LaunchWindow;
}

export const EMPTY_FILTERS: ProductFilters = {
  query: "",
  category: "all",
  range: "all",
  brand: "all",
  criticalPath: "all",
  tab: "all",
  status: "all",
  flag: "all",
  window: "all",
};

export function getProductTab(product: Product): ProductTab {
  if (product.lifecycle === "Dropped") return "dropped";
  if (product.lifecycle === "Live" || product.lifecycle === "Offsale") return "launched";
  return "active";
}

export const LAUNCH_WINDOW_OPTIONS: Array<{ value: LaunchWindow; label: string }> = [
  { value: "all", label: "Any launch date" },
  { value: "7", label: "Next 7 days" },
  { value: "14", label: "Next 14 days" },
  { value: "30", label: "Next 30 days" },
  { value: "later", label: "More than 30 days away" },
];

export const STATUS_OPTIONS: Array<{ value: ProductFilters["status"]; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "Expectation At Risk", label: STATUS_CARD_LABEL["Expectation At Risk"] },
  { value: "Information Incomplete", label: STATUS_CARD_LABEL["Information Incomplete"] },
  { value: "On Track", label: STATUS_CARD_LABEL["On Track"] },
];

export const FLAG_OPTIONS: Array<{ value: FlagFilter; label: string }> = [
  { value: "all", label: "Any flag" },
  { value: "dateChanged", label: "Date Changed" },
  { value: "stockAfterLaunch", label: "Stock lands after launch" },
];

export function isStatusFilter(value: string | undefined): value is ModelStatus {
  return value === "Expectation At Risk" || value === "Information Incomplete" || value === "On Track";
}

export function isFlagFilter(value: string | undefined): value is Exclude<FlagFilter, "all"> {
  return value === "dateChanged" || value === "stockAfterLaunch";
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

    const assessment = assessProduct(product);
    if (filters.status !== "all" && (!assessment.isPreparing || assessment.status !== filters.status)) {
      return false;
    }
    if (filters.flag !== "all" && !(assessment.isPreparing && assessment.flags[filters.flag])) return false;

    if (filters.window !== "all") {
      const days = daysUntil(product.launchDate);
      if (filters.window === "later") {
        if (days <= 30) return false;
      } else if (days < 0 || days > Number(filters.window)) {
        return false;
      }
    }

    return true;
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
