import { assessCompleteness, type Completeness } from "./completeness";
import { DATE_CHANGED_WITHIN_DAYS } from "./readiness-config";
import { DEMO_TODAY, daysUntil, formatLongDate } from "./readiness";
import { infoCompleteAt, slaProjectionDate, slaWorkingDays } from "./sla";
import type { Product, ProductLifecycle } from "./types";
import { addWorkingDays, pluralise, workingDaysBetween } from "./working-days";

/** Calculated from the information and the dates. Never set by hand. */
export type ModelStatus = "Information Incomplete" | "Expectation At Risk" | "On Track";

export interface ModelFlags {
  /** The launch date changed within the last 7 days. */
  dateChanged: boolean;
  /** Stock Ready Date is after the Proposed Launch Date. Separate from the SLA. */
  stockAfterLaunch: boolean;
  /** Any field, mandatory or optional, holds #N/A or #REF!. */
  dataErrors: boolean;
}

export interface ModelAssessment {
  product: Product;
  /** False once the product is Live, Dropped or Offsale. Such products are listed after everything else. */
  isPreparing: boolean;
  completeness: Completeness;
  status: ModelStatus;
  slaWorkingDays: number;
  infoCompleteAt?: string;
  slaProjectionDate?: string;
  /** Working days the projection falls after the Proposed Launch Date. Zero unless Expectation At Risk. */
  gapWorkingDays: number;
  /** Proposed Launch minus the SLA working days. Incomplete products only. */
  infoNeededBy?: string;
  /** True when infoNeededBy falls before the demo date. */
  infoNeededByPassed: boolean;
  /** Working days from the demo date to the Proposed Launch Date. Negative once the date has passed. */
  launchInWorkingDays: number;
  flags: ModelFlags;
}

export function assessProduct(product: Product, today: string = DEMO_TODAY): ModelAssessment {
  const completeness = assessCompleteness(product);
  const sla = slaWorkingDays(product);
  const projection = slaProjectionDate(product);
  const isPreparing = !product.lifecycle;

  let status: ModelStatus = "On Track";
  let gapWorkingDays = 0;
  if (!completeness.isComplete) {
    status = "Information Incomplete";
  } else if (projection && projection > product.launchDate) {
    status = "Expectation At Risk";
    gapWorkingDays = workingDaysBetween(product.launchDate, projection);
  }

  const infoNeededBy =
    isPreparing && status === "Information Incomplete" ? addWorkingDays(product.launchDate, -sla) : undefined;

  const changedAgo = product.launchDateChangedOn ? daysUntil(product.launchDateChangedOn, today) : undefined;

  return {
    product,
    isPreparing,
    completeness,
    status,
    slaWorkingDays: sla,
    infoCompleteAt: infoCompleteAt(product),
    slaProjectionDate: projection,
    gapWorkingDays,
    infoNeededBy,
    infoNeededByPassed: infoNeededBy !== undefined && infoNeededBy < today,
    launchInWorkingDays: workingDaysBetween(today, product.launchDate),
    flags: {
      dateChanged: changedAgo !== undefined && changedAgo <= 0 && changedAgo >= -DATE_CHANGED_WITHIN_DAYS,
      stockAfterLaunch: Boolean(product.stockLandsDate && product.stockLandsDate > product.launchDate),
      dataErrors: completeness.dataErrorsInMandatory.length + completeness.dataErrorsInOptional.length > 0,
    },
  };
}

/** What the status badge shows: the lifecycle once a product has one, otherwise the calculated status. */
export type DisplayStatus = ModelStatus | ProductLifecycle;

/** The status-card label for each calculated status. "Expectation At Risk" is shown as "At Risk" on cards and filters. */
export const STATUS_CARD_LABEL: Record<ModelStatus, string> = {
  "Expectation At Risk": "At Risk",
  "Information Incomplete": "Information Incomplete",
  "On Track": "On Track",
};

export function displayStatus(assessment: ModelAssessment): DisplayStatus {
  return assessment.product.lifecycle ?? assessment.status;
}

/** "Launch in 10 working days", shown under the launch date. */
export function describeLaunchIn(workingDays: number): string {
  if (workingDays === 0) return "Launches today";
  if (workingDays < 0) return `Launched ${pluralise(Math.abs(workingDays), "working day")} ago`;
  return `Launch in ${pluralise(workingDays, "working day")}`;
}

/** "Expectation At Risk: 5 working days late". Other statuses are shown as they are. */
export function describeStatus(assessment: ModelAssessment): string {
  if (assessment.status === "Expectation At Risk") {
    return `${assessment.status}: ${pluralise(assessment.gapWorkingDays, "working day")} late`;
  }
  return assessment.status;
}

const GROUP_RANK = {
  "Expectation At Risk": 0,
  "Information Incomplete": 1,
  "On Track": 2,
} satisfies Record<ModelStatus, number>;

/**
 * Default order: Expectation At Risk, then Information Incomplete (passed deadline first), then On Track;
 * within each, the soonest launch, then the largest gap. Products no longer being prepared go last.
 */
export function compareAssessments(a: ModelAssessment, b: ModelAssessment): number {
  if (a.isPreparing !== b.isPreparing) return a.isPreparing ? -1 : 1;
  return (
    GROUP_RANK[a.status] - GROUP_RANK[b.status] ||
    Number(b.infoNeededByPassed) - Number(a.infoNeededByPassed) ||
    a.product.launchDate.localeCompare(b.product.launchDate) ||
    b.gapWorkingDays - a.gapWorkingDays ||
    a.product.id.localeCompare(b.product.id)
  );
}

export function assessAndSort(products: Product[], today: string = DEMO_TODAY): ModelAssessment[] {
  return products.map((product) => assessProduct(product, today)).sort(compareAssessments);
}

/**
 * One plain sentence saying why a product has the status it has. Shown at the top of the product page.
 */
export function explainStatus(assessment: ModelAssessment): string {
  const { product, completeness } = assessment;
  const launch = formatLongDate(product.launchDate);
  if (product.lifecycle) {
    return `This product is ${product.lifecycle}, so no launch preparation is being tracked.`;
  }
  if (assessment.status === "Information Incomplete") {
    const missing = completeness.missingMandatory.map((field) => field.definition.label);
    const list = missing.length > 3 ? `${missing.slice(0, 3).join(", ")} and ${missing.length - 3} more` : missing.join(", ");
    const needed = assessment.infoNeededBy
      ? assessment.infoNeededByPassed
        ? ` It was needed by ${formatLongDate(assessment.infoNeededBy)} to launch on ${launch}, so that date has passed.`
        : ` It is needed by ${formatLongDate(assessment.infoNeededBy)} to launch on ${launch}.`
      : "";
    return `${pluralise(missing.length, "mandatory field")} still missing (${list}), so the SLA has not started.${needed}`;
  }
  const projection = assessment.slaProjectionDate ? formatLongDate(assessment.slaProjectionDate) : "";
  if (assessment.status === "Expectation At Risk") {
    return `All mandatory information is in, but the SLA projection of ${projection} is ${pluralise(assessment.gapWorkingDays, "working day")} after the proposed launch of ${launch}.`;
  }
  return `All mandatory information is in and the SLA projection of ${projection} is on or before the proposed launch of ${launch}.`;
}

export type TimelineTone = "done" | "pending" | "late" | "neutral";

export interface TimelineEvent {
  key: "pim" | "info-complete" | "sla-projection" | "launch" | "stock";
  label: string;
  /** ISO date, or undefined when the event has not happened or is not known. */
  date?: string;
  /** Shown instead of a date when there is none, e.g. "Not started". */
  placeholder: string;
  tone: TimelineTone;
}

/** The product journey in order: PIM, information complete (SLA starts), SLA projection, launch, stock ready. */
export function buildTimeline(assessment: ModelAssessment): TimelineEvent[] {
  const { product } = assessment;
  const complete = assessment.completeness.isComplete;
  const atRisk = assessment.status === "Expectation At Risk";
  return [
    {
      key: "pim",
      label: "Entered in PIM",
      date: product.pimDate,
      placeholder: "Not entered",
      tone: product.pimDate ? "done" : "pending",
    },
    {
      key: "info-complete",
      label: "Information complete (SLA starts)",
      date: assessment.infoCompleteAt,
      placeholder: complete ? "Date not recorded" : "Not started",
      tone: assessment.infoCompleteAt ? "done" : "pending",
    },
    {
      key: "sla-projection",
      label: "SLA projection",
      date: assessment.slaProjectionDate,
      placeholder: "Not started",
      tone: assessment.slaProjectionDate ? (atRisk ? "late" : "done") : "pending",
    },
    { key: "launch", label: "Proposed launch", date: product.launchDate, placeholder: "Not set", tone: "neutral" },
    {
      key: "stock",
      label: "Stock ready",
      date: product.stockLandsDate,
      placeholder: "Not known",
      tone: product.stockLandsDate ? (assessment.flags.stockAfterLaunch ? "late" : "done") : "pending",
    },
  ];
}
