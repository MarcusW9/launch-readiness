import type { FieldKey } from "./readiness-config";

/** Products that are no longer being prepared for launch. They are listed after everything else. */
export type ProductLifecycle = "Live" | "Dropped" | "Offsale";

export type ImagerySource = "studio" | "supplier";

/** Product characteristics. Own Brand/Branded is read as a mandatory field. */
export interface ProductCharacteristics {
  imagerySource: ImagerySource;
  hasVariants: boolean;
  /** Present only when compliance sign-off is required. */
  complianceReason?: string;
  ownBrand: boolean;
}

/** Who wrote a product note. Both roles can add notes; only Commercial can change product fields. */
export type NoteRole = "commercial" | "downstream";

/**
 * A permanent entry in a product's notes log. Notes are never edited or deleted
 * and never feed into status, completeness, SLA or any other calculation.
 */
export interface ProductNote {
  id: string;
  /** ISO timestamp (demo clock). */
  at: string;
  author: string;
  role: NoteRole;
  text: string;
}

export interface StudioBrief {
  requiredImagery: string[];
  styling: string;
}

/**
 * Production details the Studio view reads. A missing key means "Not provided".
 * The values "#N/A" and "#REF!" stand in for errors carried over from the source data.
 * None of these feed into status, completeness, the SLA or any other calculation.
 */
export interface StudioDetails {
  customerStylePreference?: string;
  imageSource?: string;
  cutOutSource?: string;
  lifestyleSource?: string;
  videoSource?: string;
  components?: string;
}

export interface Product {
  id: string;
  name: string;
  /** Retail brand for display only, e.g. "Oakline". */
  brand: string;
  category: string;
  /** Product range the item belongs to, e.g. "Living room". Absent when not assigned. */
  range?: string;
  /** Planning phase the launch sits on, e.g. "AW26 PH1". Absent when not assigned. */
  criticalPath?: string;
  /** ISO date, e.g. 2026-11-24 */
  launchDate: string;
  /** Absent while the product is still being prepared for launch. */
  lifecycle?: ProductLifecycle;
  characteristics: ProductCharacteristics;
  /** Number of variants linked to this parent product (parent products only). */
  variantCount?: number;
  studioBrief?: StudioBrief;
  /** Production details shown in the Studio view. Absent means none are known yet. */
  studio?: StudioDetails;
  /**
   * Launch date before the latest change, and the date it changed. Shown only in the weekly summary.
   * Never feeds into status, completeness, the SLA or any other calculation.
   */
  previousLaunchDate?: string;
  launchDateChangedOn?: string;
  /** ISO date the first stock lands. Shown only in the weekly summary; never feeds into any calculation. */
  stockLandsDate?: string;
  /**
   * Values for the information fields that do not already live on this product (see readField).
   * A missing key, a blank value, "#N/A" or "#REF!" all mean the field is missing.
   */
  fields?: Partial<Record<FieldKey, string>>;
  /** ISO date the product was entered in the PIM. Never later than infoCompleteAt, and never later than the demo date. */
  pimDate?: string;
  /** ISO date the last mandatory field was completed. Starts the SLA. Never later than the demo date. */
  infoCompleteAt?: string;
  /** Product-level notes log, newest first. Absent means no notes yet. */
  notes?: ProductNote[];
}
