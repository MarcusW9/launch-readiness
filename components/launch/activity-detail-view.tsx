"use client";

import Link from "next/link";
import { ChevronRight, CircleCheck, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACTIVITY_DEFINITIONS, resolveActivity, type ResolvedActivity } from "@/lib/launch/activities";
import { INFORMATION_DEFINITIONS } from "@/lib/launch/information";
import { INFORMATION_NEEDED_HEADING } from "@/lib/launch/copy";
import { formatLongDate, summariseReadiness } from "@/lib/launch/readiness";
import { useLaunch } from "@/lib/launch/store";
import type { ActivityKey, Product } from "@/lib/launch/types";
import { ActivityWorkflow } from "./activity-workflow";
import { HistoryCard, NotesCard, ReadinessImpactCard } from "./activity-side-panels";
import { LinkButton } from "./link-button";
import { Crumbs, Page, PageHeading } from "./page-frame";
import { WorkStatePill } from "./status";
import { StatusAlert } from "./status-alert";

function isActivityKey(value: string): value is ActivityKey {
  return value in ACTIVITY_DEFINITIONS;
}

function BriefCard({ product, activityKey }: { product: Product; activityKey: ActivityKey }) {
  const isStudio = activityKey === "studio-imagery";
  const def = ACTIVITY_DEFINITIONS[activityKey];

  const rows: Array<{ label: string; value: string }> = [
    { label: "Product name", value: product.name },
    { label: "Product ID", value: product.id },
    { label: "Target launch date", value: formatLongDate(product.launchDate) },
  ];

  return (
    <Card role="region" aria-labelledby="brief-heading">
      <CardHeader>
        <CardTitle id="brief-heading" className="text-lg">
          Brief
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="m-0">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 border-b py-2">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="m-0 text-right text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>

        {isStudio && product.studioBrief ? (
          <>
            <div>
              <h3 className="font-medium">Required imagery</h3>
              <ul className="m-0 list-disc pl-5">
                {product.studioBrief.requiredImagery.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Styling</h3>
              <p>{product.studioBrief.styling}</p>
            </div>
          </>
        ) : (
          <div>
            <h3 className="font-medium">What is needed</h3>
            <p>{def.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityInformationCard({ product, activity }: { product: Product; activity: ResolvedActivity }) {
  const { information } = activity;

  return (
    <Card role="region" aria-labelledby="activity-info-heading">
      <CardHeader>
        <CardTitle id="activity-info-heading" className="text-lg">
          {INFORMATION_NEEDED_HEADING}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-muted-foreground">
          {information.available.length} of {information.required.length} required inputs available
        </p>
        <ul className="m-0 flex list-none flex-col p-0">
          {information.required.map((key) => {
            const definition = INFORMATION_DEFINITIONS[key];
            const provided = product.information[key];
            const blocksStart = information.blockingStart.includes(key);
            return (
              <li key={key} className="flex flex-col gap-0.5 border-b py-3 last:border-b-0">
                {provided ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                      <CircleCheck className="size-3.5" aria-hidden />
                      {definition.label}
                    </span>
                    <span>{provided.value}</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                      <TriangleAlert className="size-3.5" aria-hidden />
                      {definition.label}: missing
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {blocksStart
                        ? `Needed before this can ${activity.def.startVerb}.`
                        : "Needed before this can finish."}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        {information.missing.length > 0 ? (
          <div>
            <LinkButton href={`/products/${product.id}#information-heading`} variant="outline" size="sm">
              Provide on product page
              <ChevronRight aria-hidden />
            </LinkButton>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ActivityDetailView({ productId, activityKey }: { productId: string; activityKey: string }) {
  const { getProduct } = useLaunch();
  const product = getProduct(productId);

  if (!product || !isActivityKey(activityKey)) {
    return (
      <Page>
        <PageHeading title="Activity not found" description="This activity is not in the demo dataset." />
        <div>
          <LinkButton href="/products">Back to products</LinkButton>
        </div>
      </Page>
    );
  }

  const activity = resolveActivity(product, activityKey);
  const def = activity.def;

  if (!activity.applies || !activity.state) {
    return (
      <Page>
        <PageHeading title={def.name}>
          <Crumbs
            items={[
              { label: "Overview", href: "/" },
              { label: product.name, href: `/products/${product.id}` },
              { label: def.name, href: `/products/${product.id}/activities/${activityKey}` },
            ]}
          />
        </PageHeading>
        <StatusAlert tone="info" title="Not required for this product">
          {activity.reason}
        </StatusAlert>
        <div>
          <LinkButton href={`/products/${product.id}`}>Return to product</LinkButton>
        </div>
      </Page>
    );
  }

  const summary = summariseReadiness(product);
  const isComplete = activity.status === "Complete";

  return (
    <Page>
      <PageHeading title={def.name}>
        <Crumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name, href: `/products/${product.id}` },
            { label: def.name, href: `/products/${product.id}/activities/${activityKey}` },
          ]}
        />
      </PageHeading>

      <div className="flex flex-wrap items-center gap-4">
        <WorkStatePill workState={activity.workState} label={activity.workStateLabel} />
        <p className="text-muted-foreground">
          For{" "}
          <Link href={`/products/${product.id}`} className="underline underline-offset-4">
            {product.name}
          </Link>
          . Owner: {def.ownerTeam}.
        </p>
      </div>
      {isComplete ? null : (
        <p>
          <strong>Next action:</strong> {activity.nextAction}
        </p>
      )}

      {isComplete ? (
        <StatusAlert tone="success" title={`${def.name} complete`}>
          {summary.outstanding.length === 0
            ? `${product.name} is now Ready: every required activity is complete.`
            : `${summary.outstanding.length} required ${summary.outstanding.length === 1 ? "activity is" : "activities are"} still outstanding for ${product.name}.`}{" "}
          <Link href={`/products/${product.id}`} className="underline underline-offset-4">
            Return to product
          </Link>
        </StatusAlert>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <ActivityWorkflow product={product} activity={activity} />
          <Card role="region" aria-labelledby="requirement-heading">
            <CardHeader>
              <CardTitle id="requirement-heading" className="text-lg">
                Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>{activity.reason}</p>
              <p className="text-sm text-muted-foreground">Done when: {def.doneWhen}</p>
            </CardContent>
          </Card>
          <ActivityInformationCard product={product} activity={activity} />
          <BriefCard product={product} activityKey={activityKey} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <ReadinessImpactCard product={product} activityKey={activityKey} />
          <NotesCard product={product} activityKey={activityKey} state={activity.state} />
          <HistoryCard state={activity.state} />
        </div>
      </div>
    </Page>
  );
}
