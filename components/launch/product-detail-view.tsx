"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLongDate } from "@/lib/launch/readiness";
import { assessProduct, describeLaunchIn, explainStatus } from "@/lib/launch/readiness-model";
import { describeSla } from "@/lib/launch/sla";
import { useLaunch } from "@/lib/launch/store";
import { LaunchDateEditor } from "./launch-date-editor";
import { LaunchTimeline } from "./launch-timeline";
import { LinkButton } from "./link-button";
import { Crumbs, Page, PageHeading } from "./page-frame";
import { ProductInformation } from "./product-information";
import { ProductNotes } from "./product-notes";
import { DateChangedFlag, StatusBadge, StockAfterLaunchFlag } from "./status";
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

  const assessment = assessProduct(product);
  const tone = !assessment.isPreparing
    ? "info"
    : assessment.status === "Expectation At Risk"
      ? "error"
      : assessment.status === "Information Incomplete"
        ? "warning"
        : "success";

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

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge assessment={assessment} />
          {assessment.isPreparing && assessment.flags.dateChanged ? <DateChangedFlag /> : null}
          {assessment.isPreparing && assessment.flags.stockAfterLaunch ? <StockAfterLaunchFlag /> : null}
          {assessment.isPreparing ? (
            <span className="text-sm text-muted-foreground">{describeLaunchIn(assessment.launchInWorkingDays)}</span>
          ) : null}
        </div>
        <LaunchDateEditor key={product.launchDate} product={product} />
      </div>

      <StatusAlert tone={tone} title={assessment.isPreparing ? "Why this status" : `This product is ${product.lifecycle}`}>
        {explainStatus(assessment)}
      </StatusAlert>

      <Card role="region" aria-labelledby="timeline-heading">
        <CardHeader>
          <CardTitle id="timeline-heading" className="text-xl">
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LaunchTimeline assessment={assessment} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <ProductInformation assessment={assessment} />
        </div>
        <div className="flex flex-col gap-8 lg:col-span-4">
          <ProductNotes product={product} />
          <Card role="region" aria-labelledby="summary-heading">
            <CardHeader>
              <CardTitle id="summary-heading">Product summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="m-0">
                <SummaryRow label="Cat No." value={product.id} />
                <SummaryRow label="Brand" value={product.brand} />
                <SummaryRow label="Category" value={product.category} />
                <SummaryRow label="Launch date" value={formatLongDate(product.launchDate)} />
                <SummaryRow label="SLA" value={describeSla(assessment.slaWorkingDays)} />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}
