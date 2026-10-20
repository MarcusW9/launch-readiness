import { getApplicableActivities, type ResolvedActivity } from "./activities";
import { INFORMATION_DEFINITIONS } from "./information";
import type { LaunchStatus, Product, Readiness } from "./types";

/**
 * The prototype runs on a fixed demo date so the data never goes stale.
 */
export const DEMO_TODAY = "2026-11-10";

/**
 * Prototype assumption: the real definition of "at risk" is not agreed.
 * A product is At Risk when work is outstanding and launch is this close.
 */
export const AT_RISK_WITHIN_DAYS = 10;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysUntil(isoDate: string, from: string = DEMO_TODAY): number {
  const target = Date.parse(`${isoDate}T00:00:00Z`);
  const origin = Date.parse(`${from}T00:00:00Z`);
  return Math.round((target - origin) / MS_PER_DAY);
}

export interface ReadinessSummary {
  /** Readiness while the product is being prepared. Meaningless once it has a lifecycle status. */
  readiness: Readiness;
  /** What the status pill shows: readiness while preparing, lifecycle once it is not. */
  launchStatus: LaunchStatus;
  /** False once the product is Live, Dropped or Offsale. Such products have no outstanding work. */
  isPreparing: boolean;
  applicable: ResolvedActivity[];
  complete: ResolvedActivity[];
  outstanding: ResolvedActivity[];
  daysToLaunch: number;
}

export function summariseReadiness(product: Product): ReadinessSummary {
  const applicable = getApplicableActivities(product);
  const complete = applicable.filter((activity) => activity.status === "Complete");
  const isPreparing = !product.lifecycle;
  const outstanding = isPreparing ? applicable.filter((activity) => activity.status !== "Complete") : [];
  const daysToLaunch = daysUntil(product.launchDate);

  let readiness: Readiness = "Ready";
  if (outstanding.length > 0) {
    readiness = daysToLaunch <= AT_RISK_WITHIN_DAYS ? "At Risk" : "Action Required";
  }

  return {
    readiness,
    launchStatus: product.lifecycle ?? readiness,
    isPreparing,
    applicable,
    complete,
    outstanding,
    daysToLaunch,
  };
}

/** True while the product is still being prepared for launch and could need action. */
export function needsAttention(product: Product): boolean {
  const summary = summariseReadiness(product);
  return summary.isPreparing && summary.readiness !== "Ready";
}

/** Plain-language description of why an activity is holding a product back. */
export function describeIssue(activity: ResolvedActivity): string {
  const name = activity.def.name;
  if (activity.workState === "Awaiting information" && activity.information.blockingStart.length > 0) {
    const first = INFORMATION_DEFINITIONS[activity.information.blockingStart[0]].label.toLowerCase();
    const more = activity.information.blockingStart.length - 1;
    return `${name} cannot ${activity.def.startVerb}: ${first}${more > 0 ? ` and ${more} more` : ""} missing`;
  }
  if (activity.workState === "Ready to start") return `${name} ready to start`;
  switch (activity.status) {
    case "Not Started":
      return `${name} not started`;
    case "In Progress":
      return `${name} incomplete`;
    case "Blocked":
      return `${name} blocked${activity.state?.blockedReason ? `: ${activity.state.blockedReason}` : ""}`;
    default:
      return name;
  }
}

const STATUS_RANK: Record<LaunchStatus, number> = {
  "At Risk": 0,
  "Action Required": 1,
  Ready: 2,
  Live: 3,
  Offsale: 4,
  Dropped: 5,
};

export function compareByUrgency(a: Product, b: Product): number {
  const ra = STATUS_RANK[summariseReadiness(a).launchStatus];
  const rb = STATUS_RANK[summariseReadiness(b).launchStatus];
  if (ra !== rb) return ra - rb;
  return a.launchDate.localeCompare(b.launchDate);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "24 Nov". Done by hand so server and client render identically. */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]}`;
}

export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function formatTimestamp(iso: string): string {
  const [datePart, timePart = "00:00"] = iso.split("T");
  const time = timePart.slice(0, 5);
  return `${formatShortDate(datePart)}, ${time}`;
}

export function describeDaysToLaunch(days: number): string {
  if (days === -1) return "1 day ago";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}
