"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveAllActivities } from "@/lib/launch/activities";
import { getInformationOverview } from "@/lib/launch/information-overview";
import {
  AT_RISK_WITHIN_DAYS,
  describeDaysToLaunch,
  describeIssue,
  formatLongDate,
  summariseReadiness,
} from "@/lib/launch/readiness";
import { useLaunch } from "@/lib/launch/store";
import { InfoTip } from "./info-tip";
import { InformationSection } from "./information-section";
import { LabelledProgress } from "./labelled-progress";
import { LinkButton } from "./link-button";
import { Crumbs, Page, PageHeading } from "./page-frame";
import { ProductNotes } from "./product-notes";
import { RequirementsSection } from "./requirements-section";
import { LaunchStatusPill } from "./status";
import { StatusAlert } from "./status-alert";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 text-right text-sm">{value}</dd>
    </div>
  );
}

export function ProductDetailView({ productId }: { productId: string }) {
  const { getProduct } = useLaunch();
  const product = getProduct(productId);

  if (!product) {
    return (
      <Page>
        <PageHeading title="Product not found" description="This product is not in the demo dataset." />
        <div>
          <LinkButton href="/products">Back to products</LinkButton>
        </div>
      </Page>
    );
  }

  const summary = summariseReadiness(product);
  const overview = getInformationOverview(product);
  const activities = resolveAllActivities(product);
  const { characteristics } = product;
  const startBlocked = activities.filter((activity) => activity.workState === "Awaiting information").length;
  const requiredInputs = overview.available.length + overview.missing.length;

  return (
    <Page>
      <PageHeading title={product.name}>
        <Crumbs
          items={[
            { label: "Overview", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name, href: `/products/${product.id}` },
          ]}
        />
      </PageHeading>

      <div className="flex flex-wrap items-center gap-4">
        <LaunchStatusPill status={summary.launchStatus} />
        <p className="text-muted-foreground">
          Launch date: {formatLongDate(product.launchDate)} ({describeDaysToLaunch(summary.daysToLaunch).toLowerCase()})
        </p>
      </div>

      {!summary.isPreparing ? (
        <StatusAlert tone="info" title={`This product is ${summary.launchStatus}`}>
          No preparation work is outstanding, so it is not counted as needing action.
        </StatusAlert>
      ) : summary.outstanding.length === 0 ? (
        <StatusAlert tone="success" title="Ready to launch">
          All applicable required activities are complete.
        </StatusAlert>
      ) : (
        <StatusAlert
          tone={summary.readiness === "At Risk" ? "error" : "warning"}
          title="What is stopping this product from being ready?"
        >
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {summary.outstanding.map((activity) => (
              <li key={activity.def.key}>
                <Link href={`/products/${product.id}/activities/${activity.def.key}`} className="underline underline-offset-4">
                  {describeIssue(activity)}
                </Link>
              </li>
            ))}
          </ul>
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <ProductNotes product={product} />
          <InformationSection product={product} />
          <RequirementsSection product={product} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <Card role="region" aria-labelledby="summary-heading">
            <CardHeader>
              <CardTitle id="summary-heading">Product summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="m-0">
                <SummaryRow label="Product ID" value={product.id} />
                <SummaryRow label="Brand" value={product.brand} />
                <SummaryRow label="Category" value={product.category} />
                <SummaryRow label="Launch date" value={formatLongDate(product.launchDate)} />
                <SummaryRow label="Own brand" value={characteristics.ownBrand ? "Yes" : "No"} />
                <SummaryRow
                  label="Imagery"
                  value={characteristics.imagerySource === "studio" ? "Studio photography" : "Supplier provided"}
                />
                <SummaryRow
                  label="Variants"
                  value={
                    characteristics.hasVariants
                      ? `Parent product${product.variantCount ? `, ${product.variantCount} variants` : ""}`
                      : "Single option"
                  }
                />
                <SummaryRow
                  label="Compliance"
                  value={characteristics.complianceReason ? "Sign-off required" : "Not required"}
                />
              </dl>
            </CardContent>
          </Card>

          <Card role="region" aria-labelledby="progress-heading">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle id="progress-heading">Progress</CardTitle>
                <InfoTip
                  label="How readiness is decided"
                  message={`Ready: every required activity is complete. Action Required: something is outstanding. At Risk: something is outstanding and launch is within ${AT_RISK_WITHIN_DAYS} days. This At Risk rule is a prototype assumption.`}
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <LabelledProgress
                label={`${summary.complete.length} of ${summary.applicable.length} required activities complete`}
                value={summary.complete.length}
                max={summary.applicable.length}
              />
              <LabelledProgress
                label={`${overview.available.length} of ${requiredInputs} required inputs available`}
                value={overview.available.length}
                max={requiredInputs}
              />
              {startBlocked > 0 ? (
                <p className="text-sm text-warning">
                  {startBlocked} {startBlocked === 1 ? "requirement is" : "requirements are"} waiting on missing
                  information before work can begin.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}
