"use client";

import Link from "next/link";
import { ChevronRight, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getInformationActions } from "@/lib/launch/information-overview";
import {
  compareByUrgency,
  describeDaysToLaunch,
  describeIssue,
  formatShortDate,
  needsAttention,
  summariseReadiness,
} from "@/lib/launch/readiness";
import { INFORMATION_NEEDED_HEADING } from "@/lib/launch/copy";
import { useLaunch } from "@/lib/launch/store";
import type { Product, Readiness } from "@/lib/launch/types";
import { LinkButton } from "./link-button";
import { Page, PageHeading } from "./page-frame";
import { ActivityStatusText, ReadinessPill } from "./status";
import { StatusAlert } from "./status-alert";

const ROW_LINK =
  "flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 transition-colors hover:bg-muted";

function AttentionCard({ product }: { product: Product }) {
  const summary = summariseReadiness(product);
  const informationActions = getInformationActions(product);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              Launch: {formatShortDate(product.launchDate)} ({describeDaysToLaunch(summary.daysToLaunch).toLowerCase()})
              {" · "}ID {product.id}
            </p>
          </div>
          <ReadinessPill readiness={summary.readiness} />
        </div>

        <section aria-label={`Work outstanding for ${product.name}`} className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">Work outstanding</h4>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {summary.outstanding.map((activity) => (
              <li key={activity.def.key}>
                <Link href={`/products/${product.id}/activities/${activity.def.key}`} className={ROW_LINK}>
                  <span className="flex flex-col">
                    <span>{describeIssue(activity)}</span>
                    <span className="text-xs text-muted-foreground">Needed from: {activity.def.ownerTeam}</span>
                  </span>
                  <ActivityStatusText status={activity.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {informationActions.length > 0 ? (
          <section
            aria-label={`${INFORMATION_NEEDED_HEADING} for ${product.name}`}
            className="flex flex-col gap-2"
          >
            <h4 className="text-sm font-medium text-muted-foreground">{INFORMATION_NEEDED_HEADING}</h4>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {informationActions.map((action) => (
                <li key={action.key}>
                  <Link href={`/products/${product.id}#information`} className={ROW_LINK}>
                    <span className="flex flex-col">
                      <span>{action.action}</span>
                      <span className="text-xs text-muted-foreground">
                        Needed from: {action.neededFrom}
                        {action.impacts.length > 0
                          ? ` · Impact: ${action.impacts.map((impact) => impact.text).join("; ")}`
                          : ""}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <TriangleAlert className="size-3.5" aria-hidden />
                      Missing
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div>
          <LinkButton href={`/products/${product.id}`} variant="outline" size="sm">
            View product<span className="sr-only">: {product.name}</span>
            <ChevronRight aria-hidden />
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}

function Group({ title, readiness, products }: { title: string; readiness: Readiness; products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ReadinessPill readiness={readiness} />
        <h2 className="text-sm font-medium text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <AttentionCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function ActionRequiredView() {
  const { products } = useLaunch();
  const needing = products.filter(needsAttention).sort(compareByUrgency);

  const atRisk = needing.filter((p) => summariseReadiness(p).readiness === "At Risk");
  const actionRequired = needing.filter((p) => summariseReadiness(p).readiness === "Action Required");

  return (
    <Page>
      <PageHeading
        title="Action Required"
        description="What do you need to worry about? Products are ordered by urgency, with the activities holding each one back."
      />
      {needing.length === 0 ? (
        <StatusAlert tone="success" title="Nothing needs attention">
          Every product is ready to launch.
        </StatusAlert>
      ) : (
        <>
          <Group title="At Risk" readiness="At Risk" products={atRisk} />
          <Group title="Action Required" readiness="Action Required" products={actionRequired} />
        </>
      )}
    </Page>
  );
}
