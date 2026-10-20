import { EMPTY_FILTERS, filterProducts, getProductTab, NOT_ASSIGNED } from "./filters";
import { getSelectedCriticalPath } from "./critical-path";
import { DEMO_TODAY, summariseReadiness } from "./readiness";
import type { Product } from "./types";

export const NOT_PROVIDED = "Not provided";

const DATA_ERRORS = new Set(["#N/A", "#REF!"]);

/** Spreadsheet errors carried over from the source data, shown as data errors rather than values. */
export function isDataError(value: string | undefined): boolean {
  return value !== undefined && DATA_ERRORS.has(value.trim());
}

export type StudioColumnKey =
  | "id"
  | "name"
  | "criticalPath"
  | "style"
  | "imageSource"
  | "cutOutSource"
  | "lifestyleSource"
  | "videoSource"
  | "components"
  | "launch"
  | "status";

export interface StudioColumn {
  key: StudioColumnKey;
  header: string;
  /** Raw value. Undefined means "Not provided". */
  read: (product: Product) => string | undefined;
}

export const STUDIO_COLUMNS: StudioColumn[] = [
  { key: "id", header: "Cat No.", read: (product) => product.id },
  { key: "name", header: "Product", read: (product) => product.name },
  { key: "criticalPath", header: "Critical Path", read: (product) => product.criticalPath ?? NOT_ASSIGNED },
  { key: "style", header: "Customer Style Preference", read: (product) => product.studio?.customerStylePreference },
  { key: "imageSource", header: "Image Source", read: (product) => product.studio?.imageSource },
  { key: "cutOutSource", header: "Cut Out source", read: (product) => product.studio?.cutOutSource },
  { key: "lifestyleSource", header: "Lifestyle source", read: (product) => product.studio?.lifestyleSource },
  { key: "videoSource", header: "Video source", read: (product) => product.studio?.videoSource },
  { key: "components", header: "Components", read: (product) => product.studio?.components },
  { key: "launch", header: "Proposed Launch", read: (product) => product.launchDate },
  { key: "status", header: "Status", read: (product) => summariseReadiness(product).launchStatus },
];

/** What a cell shows: the value, or "Not provided" when there is none. */
export function displayValue(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : NOT_PROVIDED;
}

export function styleOf(product: Product): string {
  return displayValue(product.studio?.customerStylePreference);
}

export function imageSourceOf(product: Product): string {
  return displayValue(product.studio?.imageSource);
}

export interface StudioFilters {
  query: string;
  criticalPath: string;
  style: string;
  imageSource: string;
}

export const EMPTY_STUDIO_FILTERS: StudioFilters = {
  query: "",
  criticalPath: "all",
  style: "all",
  imageSource: "all",
};

export function hasStudioFilters(filters: StudioFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(EMPTY_STUDIO_FILTERS);
}

/** Soonest launch first, then Cat No. so the order never wobbles between renders. */
export function compareByLaunch(a: Product, b: Product): number {
  return a.launchDate.localeCompare(b.launchDate) || a.id.localeCompare(b.id);
}

/** Active products matching the Studio filters, soonest launch first. The search matches the same fields as the Exceptions view. */
export function filterStudioProducts(products: Product[], filters: StudioFilters): Product[] {
  return filterProducts(products, {
    ...EMPTY_FILTERS,
    tab: "active",
    query: filters.query,
    criticalPath: filters.criticalPath,
  })
    .filter((product) => filters.style === "all" || styleOf(product) === filters.style)
    .filter((product) => filters.imageSource === "all" || imageSourceOf(product) === filters.imageSource)
    .sort(compareByLaunch);
}

/** The one critical path the Studio list is focused on, or undefined. Same rule as the Exceptions view. */
export function getStudioCriticalPath(products: Product[], filters: StudioFilters): string | undefined {
  return getSelectedCriticalPath(products, { ...EMPTY_FILTERS, query: filters.query, criticalPath: filters.criticalPath });
}

export interface StudioOptions {
  criticalPaths: string[];
  styles: string[];
  imageSources: string[];
}

function distinctWithNotProvided(values: string[]): string[] {
  const provided = Array.from(new Set(values.filter((value) => value !== NOT_PROVIDED))).sort();
  return values.includes(NOT_PROVIDED) ? [...provided, NOT_PROVIDED] : provided;
}

/** Filter choices drawn from the Active products only, since that is all the Studio view lists. */
export function getStudioOptions(products: Product[]): StudioOptions {
  const active = products.filter((product) => getProductTab(product) === "active");
  const paths = active.map((product) => product.criticalPath);
  const assigned = Array.from(new Set(paths.filter((path): path is string => Boolean(path)))).sort();
  return {
    criticalPaths: paths.some((path) => !path) ? [NOT_ASSIGNED, ...assigned] : assigned,
    styles: distinctWithNotProvided(active.map(styleOf)),
    imageSources: distinctWithNotProvided(active.map(imageSourceOf)),
  };
}

export interface StyleGroup {
  style: string;
  products: Product[];
}

/** Groups in alphabetical order with "Not provided" last. Each group keeps the order it was given. */
export function groupByStyle(products: Product[]): StyleGroup[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const style = styleOf(product);
    groups.set(style, [...(groups.get(style) ?? []), product]);
  }
  return distinctWithNotProvided(Array.from(groups.keys())).map((style) => ({
    style,
    products: groups.get(style) ?? [],
  }));
}

/** Guards against spreadsheet formula injection, then quotes anything that needs it. */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** The Studio columns for the given rows. Missing values read "Not provided", exactly as on screen. */
export function buildStudioCsv(products: Product[]): string {
  const header = STUDIO_COLUMNS.map((column) => csvCell(column.header)).join(",");
  const rows = products.map((product) =>
    STUDIO_COLUMNS.map((column) => csvCell(displayValue(column.read(product)))).join(","),
  );
  return `\uFEFF${[header, ...rows].join("\r\n")}\r\n`;
}

export function studioCsvFileName(criticalPath: string | undefined): string {
  const slug = criticalPath?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `launch-readiness-studio-${slug || "all"}-${DEMO_TODAY}.csv`;
}
