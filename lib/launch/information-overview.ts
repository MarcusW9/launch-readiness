import { resolveAllActivities } from "./activities";
import { INFORMATION_DEFINITIONS, INFORMATION_ORDER } from "./information";
import type { ActivityKey, InformationKey, InformationSource, Product } from "./types";

export interface InformationImpact {
  activityKey: ActivityKey;
  activityName: string;
  /** True when this missing item stops the activity from beginning. */
  blocksStart: boolean;
  text: string;
}

export interface InformationItem {
  key: InformationKey;
  label: string;
  prompt: string;
  value?: string;
  source?: InformationSource;
  /** Applicable activities that use this item. */
  neededBy: string[];
  /** What the item is holding back. Only populated when it is missing. */
  impacts: InformationImpact[];
}

export interface InformationOverview {
  available: InformationItem[];
  missing: InformationItem[];
  notRequired: InformationItem[];
}

export interface InformationAction {
  key: InformationKey;
  label: string;
  /** Imperative wording, e.g. "Provide size and colour options". */
  action: string;
  /** Fictional team that would normally supply it. */
  neededFrom: string;
  impacts: InformationImpact[];
}

function impactText(verb: string, activityName: string, blocksStart: boolean): string {
  return blocksStart ? `${activityName}: unable to ${verb}` : `${activityName}: needed before it can finish`;
}

/**
 * Groups only the information that matters for this product: items needed by
 * an applicable activity are either available or missing; items needed only by
 * activities that do not apply are listed as not required.
 */
export function getInformationOverview(product: Product): InformationOverview {
  const activities = resolveAllActivities(product);
  const applicable = activities.filter((activity) => activity.applies);
  const inapplicable = activities.filter((activity) => !activity.applies);

  const overview: InformationOverview = { available: [], missing: [], notRequired: [] };

  for (const key of INFORMATION_ORDER) {
    const definition = INFORMATION_DEFINITIONS[key];
    const users = applicable.filter((activity) => activity.def.requiredInfo.includes(key));
    const provided = product.information[key];

    if (users.length === 0) {
      const wouldUse = inapplicable.filter((activity) => activity.def.requiredInfo.includes(key));
      if (wouldUse.length === 0) continue;
      overview.notRequired.push({
        key,
        label: definition.label,
        prompt: definition.prompt,
        neededBy: wouldUse.map((activity) => activity.def.name),
        impacts: [],
      });
      continue;
    }

    const item: InformationItem = {
      key,
      label: definition.label,
      prompt: definition.prompt,
      value: provided?.value,
      source: provided?.source,
      neededBy: users.map((activity) => activity.def.name),
      impacts: [],
    };

    if (provided) {
      overview.available.push(item);
      continue;
    }

    item.impacts = users
      .filter((activity) => activity.workState !== "Complete")
      .map((activity) => {
        const blocksStart = activity.information.blockingStart.includes(key);
        return {
          activityKey: activity.def.key,
          activityName: activity.def.name,
          blocksStart,
          text: impactText(activity.def.startVerb, activity.def.name, blocksStart),
        };
      });
    overview.missing.push(item);
  }

  overview.missing.sort(
    (a, b) => Number(b.impacts.some((i) => i.blocksStart)) - Number(a.impacts.some((i) => i.blocksStart)),
  );

  return overview;
}

/**
 * Required information still missing for a product being prepared for launch.
 * Products that are Live, Dropped or Offsale have nothing outstanding.
 */
export function getMissingInformation(product: Product): InformationItem[] {
  if (product.lifecycle) return [];
  return getInformationOverview(product).missing;
}

/** Missing information expressed as actions, for the Action Required page. */
export function getInformationActions(product: Product): InformationAction[] {
  return getMissingInformation(product).map((item) => ({
    key: item.key,
    label: item.label,
    action: `Provide ${item.label.toLowerCase()}`,
    neededFrom: INFORMATION_DEFINITIONS[item.key].neededFrom,
    impacts: item.impacts,
  }));
}
