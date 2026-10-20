/**
 * The single source of truth for the readiness model: which information fields exist,
 * which are mandatory, how values are judged missing, and the SLA settings.
 * Every calculation in completeness.ts, sla.ts and readiness-model.ts reads from here.
 *
 * SYNTHETIC DEMO DATA ONLY. Field names are generic and the SLA values are placeholders.
 */

export const FIELD_GROUPS = [
  { key: "identity", label: "Product identity" },
  { key: "supplier", label: "Supplier" },
  { key: "variants", label: "Variants and setup" },
  { key: "photography", label: "Photography and digital" },
] as const;

export type FieldGroup = (typeof FIELD_GROUPS)[number]["key"];

export interface FieldDefinition {
  key: string;
  label: string;
  group: FieldGroup;
  mandatory: boolean;
}

/** 31 fields: 16 product identity, 2 supplier, 7 variants and setup, 6 photography and digital. 13 are mandatory. */
export const FIELD_DEFINITIONS = [
  { key: "catNo", label: "Cat No.", group: "identity", mandatory: true },
  { key: "title", label: "Title", group: "identity", mandatory: true },
  { key: "productType", label: "Product Type", group: "identity", mandatory: true },
  { key: "range", label: "Range", group: "identity", mandatory: true },
  { key: "brand", label: "Brand", group: "identity", mandatory: true },
  { key: "ownBrand", label: "Own Brand/Branded", group: "identity", mandatory: true },
  { key: "channelA", label: "Channel A Y/N", group: "identity", mandatory: true },
  { key: "channelB", label: "Channel B Y/N", group: "identity", mandatory: true },
  { key: "criticalPath", label: "Critical Path", group: "identity", mandatory: true },
  { key: "productFeatures", label: "Product Features", group: "identity", mandatory: true },
  { key: "department", label: "Department", group: "identity", mandatory: false },
  { key: "subRange", label: "Sub-range", group: "identity", mandatory: false },
  { key: "season", label: "Season", group: "identity", mandatory: false },
  { key: "barcode", label: "Barcode (EAN)", group: "identity", mandatory: false },
  { key: "dimensions", label: "Dimensions", group: "identity", mandatory: false },
  { key: "careAndUse", label: "Care and use", group: "identity", mandatory: false },

  { key: "supplierName", label: "Supplier Name", group: "supplier", mandatory: true },
  { key: "supplierContact", label: "Supplier Contact", group: "supplier", mandatory: true },

  { key: "integration", label: "Integration Y/N", group: "variants", mandatory: true },
  { key: "variantType", label: "Variant Type", group: "variants", mandatory: false },
  { key: "variantCount", label: "Variant Count", group: "variants", mandatory: false },
  { key: "variantOptions", label: "Variant Options", group: "variants", mandatory: false },
  { key: "parentCatNo", label: "Parent Cat No.", group: "variants", mandatory: false },
  { key: "pricingSetup", label: "Pricing Set-up", group: "variants", mandatory: false },
  { key: "webHierarchy", label: "Web Hierarchy", group: "variants", mandatory: false },

  { key: "customerStylePreference", label: "Customer Style Preference", group: "photography", mandatory: false },
  { key: "imageSource", label: "Image Source", group: "photography", mandatory: false },
  { key: "cutOutSource", label: "Cut-out Source", group: "photography", mandatory: false },
  { key: "lifestyleSource", label: "Lifestyle Source", group: "photography", mandatory: false },
  { key: "videoSource", label: "Video Source", group: "photography", mandatory: false },
  { key: "components", label: "Components", group: "photography", mandatory: false },
] as const satisfies readonly FieldDefinition[];

export type FieldKey = (typeof FIELD_DEFINITIONS)[number]["key"];

export const MANDATORY_FIELDS: readonly FieldDefinition[] = FIELD_DEFINITIONS.filter((field) => field.mandatory);

/** Spreadsheet errors carried over from the source data. Always missing, and always reported as data errors. */
export const DATA_ERROR_VALUES: readonly string[] = ["#N/A", "#REF!"];

/** "N/A" is missing only in a mandatory field. In an optional field it is a valid answer. */
export const NOT_APPLICABLE_VALUE = "N/A";

/**
 * SLA settings. Both numbers are placeholders until the real SLA is agreed, so every screen that
 * shows them must carry the `label`.
 */
export const SLA_CONFIG = {
  label: "Placeholder",
  defaultWorkingDays: 20,
  workingDaysByProductType: { "Guest bed": 25 } as Readonly<Record<string, number>>,
} as const;

/** A launch date change counts as recent when it happened within this many days of the demo date. */
export const DATE_CHANGED_WITHIN_DAYS = 7;

/** Shown wherever working days are used. */
export const WORKING_DAYS_LIMITATION =
  "Working days are Monday to Friday. Bank holidays are ignored, so a projection can be a day or more optimistic than real life.";
