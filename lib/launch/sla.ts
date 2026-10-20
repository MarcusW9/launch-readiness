import { assessCompleteness, readField } from "./completeness";
import { SLA_CONFIG } from "./readiness-config";
import type { Product } from "./types";
import { addWorkingDays, pluralise } from "./working-days";

/** SLA working days for a product type. Default 20, Guest bed 25. Both are placeholders. */
export function slaWorkingDaysFor(productType: string | undefined): number {
  const wanted = (productType ?? "").trim().toLowerCase();
  const match = Object.entries(SLA_CONFIG.workingDaysByProductType).find(([type]) => type.toLowerCase() === wanted);
  return match ? match[1] : SLA_CONFIG.defaultWorkingDays;
}

export function slaWorkingDays(product: Product): number {
  return slaWorkingDaysFor(readField(product, "productType"));
}

/** "20 working days (Placeholder)". The label travels with the number wherever it is shown. */
export function describeSla(days: number): string {
  return `${pluralise(days, "working day")} (${SLA_CONFIG.label})`;
}

/**
 * The SLA starts on the date the last mandatory field was completed. It does not start while
 * any mandatory field is missing, and it needs that date to be recorded.
 */
export function infoCompleteAt(product: Product): string | undefined {
  return assessCompleteness(product).isComplete ? product.infoCompleteAt : undefined;
}

/** SLA Projection Date: when the SLA started plus the SLA working days. */
export function slaProjectionDate(product: Product): string | undefined {
  const start = infoCompleteAt(product);
  return start ? addWorkingDays(start, slaWorkingDays(product)) : undefined;
}
