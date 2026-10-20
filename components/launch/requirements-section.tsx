import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { resolveAllActivities, type ResolvedActivity } from "@/lib/launch/activities";
import { INFORMATION_DEFINITIONS } from "@/lib/launch/information";
import type { Product } from "@/lib/launch/types";
import { InfoTip } from "./info-tip";
import { SectionHeading } from "./page-frame";
import { WorkStatePill } from "./status";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function RequirementCard({ product, activity }: { product: Product; activity: ResolvedActivity }) {
  if (!activity.applies) {
    return (
      <li className="list-none rounded-xl bg-muted/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-medium text-muted-foreground">{activity.def.name}</h3>
          <WorkStatePill workState="Not Required" label="Not Required" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{activity.reason}</p>
      </li>
    );
  }

  const { information } = activity;
  const missingLabels = information.missing.map((key) => INFORMATION_DEFINITIONS[key].label);
  const isComplete = activity.workState === "Complete";

  return (
    <li className="list-none">
      <Link
        href={`/products/${product.id}/activities/${activity.def.key}`}
        className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`${activity.def.name}, ${activity.workStateLabel}. Open requirement`}
      >
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-medium">{activity.def.name}</h3>
              <div className="flex items-center gap-2">
                <WorkStatePill workState={activity.workState} label={activity.workStateLabel} />
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </div>
            </div>

            <Field label="Why it applies">
              <p>{activity.reason}</p>
            </Field>

            <Field label="Information">
              <p>
                {information.available.length} of {information.required.length} required inputs available
              </p>
              {missingLabels.length > 0 ? (
                <p className="text-sm text-warning">Missing: {missingLabels.join(", ")}</p>
              ) : null}
            </Field>

            {activity.state?.blocked && activity.state.blockedReason ? (
              <p className="text-sm font-semibold text-danger">Blocked: {activity.state.blockedReason}</p>
            ) : null}

            <Field label="Next action">
              <p>{activity.nextAction}</p>
            </Field>

            {isComplete ? null : <p className="text-xs text-muted-foreground">Owner: {activity.def.ownerTeam}</p>}
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}

export function RequirementsSection({ product }: { product: Product }) {
  const activities = resolveAllActivities(product);
  const applicable = activities.filter((activity) => activity.applies).length;

  return (
    <section aria-labelledby="requirements-heading" className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SectionHeading id="requirements-heading">Requirements</SectionHeading>
        <InfoTip
          label="About these requirements"
          message="Which requirements apply is decided from this product's characteristics. These rules are prototype assumptions, not confirmed business rules. Information completeness and workflow status are shown separately."
        />
      </div>
      <p className="text-muted-foreground">
        {applicable} of {activities.length} requirements apply to this product.
      </p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {activities.map((activity) => (
          <RequirementCard key={activity.def.key} product={product} activity={activity} />
        ))}
      </ul>
    </section>
  );
}
