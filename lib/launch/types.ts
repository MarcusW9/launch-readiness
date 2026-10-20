export type ActivityKey =
  | "product-setup"
  | "variants"
  | "studio-imagery"
  | "supplier-imagery"
  | "product-content"
  | "compliance";

/** The controlled status model. Free text is never used as a workflow status. */
export type ActivityStatus =
  | "Not Started"
  | "In Progress"
  | "Complete"
  | "Blocked"
  | "Not Required";

export type Readiness = "Ready" | "Action Required" | "At Risk";

/**
 * Products that are no longer being prepared for launch. Their activities are
 * never counted as outstanding work and they never appear in Action Required.
 */
export type ProductLifecycle = "Live" | "Dropped" | "Offsale";

/** What a product's status pill shows: readiness while preparing, lifecycle once it is not. */
export type LaunchStatus = Readiness | ProductLifecycle;

/**
 * Information is separate from work. These are the pieces of information the
 * prototype's requirements depend on. Deliberately a short, focused list.
 */
export type InformationKey =
  | "supplier"
  | "pricing"
  | "hierarchy"
  | "variant-options"
  | "variant-pricing"
  | "photography-instructions"
  | "shot-list"
  | "styling-direction"
  | "sample-availability"
  | "dimensions"
  | "supplier-contact"
  | "image-delivery"
  | "spec-sheet"
  | "key-features"
  | "regulatory-category"
  | "safety-evidence";

/** Where a known piece of information came from (conceptual, not a system). */
export type InformationSource = "existing" | "team";

export interface ProvidedInformation {
  value: string;
  source: InformationSource;
  /** ISO timestamp (demo clock) when a team member supplied it. */
  at?: string;
}

/**
 * Derived workflow state. Combines information readiness with workflow
 * progress so the two are never confused.
 */
export type WorkState =
  | "Not Required"
  | "Awaiting information"
  | "Ready to start"
  | "In Progress"
  | "Blocked"
  | "Complete";

export type ImagerySource = "studio" | "supplier";

/**
 * Product characteristics drive which activities apply. This is the seam where
 * a future rules engine (or a PIM-fed attribute set) would plug in.
 */
export interface ProductCharacteristics {
  imagerySource: ImagerySource;
  hasVariants: boolean;
  /** Present only when compliance sign-off is required. */
  complianceReason?: string;
  ownBrand: boolean;
}

export interface Note {
  id: string;
  /** ISO timestamp (demo clock). */
  at: string;
  author: string;
  text: string;
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

export interface HistoryEntry {
  id: string;
  at: string;
  text: string;
}

/** Mutable, per-product state of one applicable activity. */
export interface ActivityState {
  /** Id of the current stage in the activity's workflow. */
  stage: string;
  blocked: boolean;
  blockedReason?: string;
  notes: Note[];
  history: HistoryEntry[];
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
  /** Information known so far. A missing key means the information is missing. */
  information: Partial<Record<InformationKey, ProvidedInformation>>;
  activities: Partial<Record<ActivityKey, ActivityState>>;
  /** Product-level notes log, newest first. Absent means no notes yet. */
  notes?: ProductNote[];
}

export interface WorkflowStage {
  id: string;
  label: string;
  /** Controlled status this stage maps to. */
  status: Exclude<ActivityStatus, "Blocked" | "Not Required">;
}

export interface Applicability {
  applies: boolean;
  /** Plain-language reason, shown whether the activity is required or not. */
  reason: string;
}

export interface ActivityDefinition {
  key: ActivityKey;
  name: string;
  /** Short label used in the dashboard table. */
  shortName: string;
  description: string;
  /** Team that typically owns the activity (demo assumption). */
  ownerTeam: string;
  /** Generic definition of done shown on the activity page. */
  doneWhen: string;
  workflow: WorkflowStage[];
  /** Information this requirement needs in total, once it applies. */
  requiredInfo: InformationKey[];
  /** Subset of requiredInfo that must exist before the work can begin. */
  startInfo: InformationKey[];
  /** Verb for the first step, used in sentences such as "cannot brief". State labels stay generic. */
  startVerb: string;
  /** Next-action wording once the work can begin, e.g. "Brief the studio". */
  startAction: string;
  appliesTo: (product: Product) => Applicability;
}
