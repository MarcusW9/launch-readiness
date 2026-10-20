import { assessCompleteness } from "./completeness";
import type { FieldKey } from "./readiness-config";
import type { Product, StudioDetails } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The catalogue number identifies the product, so it is the only field that cannot be edited. */
export function isFieldEditable(key: FieldKey): boolean {
  return key !== "catNo";
}

/** Writes one field to wherever the product keeps it. */
function writeField(product: Product, key: FieldKey, value: string): Product {
  switch (key) {
    case "catNo":
      return product;
    case "title":
      return { ...product, name: value };
    case "brand":
      return { ...product, brand: value };
    case "range":
      return { ...product, range: value || undefined };
    case "criticalPath":
      return { ...product, criticalPath: value || undefined };
    case "ownBrand":
      return {
        ...product,
        characteristics: { ...product.characteristics, ownBrand: value.trim().toLowerCase() === "own brand" },
      };
    case "customerStylePreference":
    case "imageSource":
    case "cutOutSource":
    case "lifestyleSource":
    case "videoSource":
    case "components": {
      const studio: StudioDetails = { ...product.studio, [key]: value };
      return { ...product, studio };
    }
    default:
      return { ...product, fields: { ...product.fields, [key]: value } };
  }
}

/**
 * Edits a field. When the edit completes the last missing mandatory field, the SLA starts on that
 * date; the PIM date is recorded too if the product had none. Edits that leave the product
 * incomplete never start the SLA.
 */
export function editProductField(product: Product, key: FieldKey, value: string, today: string): Product {
  if (!isFieldEditable(key)) return product;
  const wasComplete = assessCompleteness(product).isComplete;
  const edited = writeField(product, key, value.trim());
  const isComplete = assessCompleteness(edited).isComplete;
  if (isComplete && !wasComplete) {
    return { ...edited, pimDate: edited.pimDate ?? today, infoCompleteAt: today };
  }
  return edited;
}

/** Moves the Proposed Launch Date and records the change so the Date Changed flag shows. */
export function changeLaunchDate(product: Product, date: string, today: string): Product {
  if (!ISO_DATE.test(date) || date === product.launchDate) return product;
  return { ...product, previousLaunchDate: product.launchDate, launchDate: date, launchDateChangedOn: today };
}
