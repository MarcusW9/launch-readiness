"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveActivity, resolveImagery, type ResolvedActivity } from "@/lib/launch/activities";
import { getInformationOverview, getMissingInformation } from "@/lib/launch/information-overview";
import { compareByUrgency, needsAttention, summariseReadiness } from "@/lib/launch/readiness";
import { useLaunch } from "@/lib/launch/store";
import type { Product } from "@/lib/launch/types";
import { LabelledProgress } from "./labelled-progress";
import { LinkButton } from "./link-button";
import { Page, PageHeading, SectionHeading } from "./page-frame";
import { ProductsTable } from "./products-table";
import { StatusAlert } from "./status-alert";
import { SummaryCards } from "./summary-cards";

interface ActivityProgress {
  label: string;
  complete: number;
  total: number;
}

function buildActivityProgress(products: Product[]): ActivityProgress[] {
  const rows: Array<{ label: string; pick: (product: Product) => ResolvedActivity }> = [
    { label: "Product setup", pick: (p) => resolveActivity(p, "product-setup") },
    { label: "Imagery", pick: resolveImagery },
    { label: "Product content", pick: (p) => resolveActivity(p, "product-content") },
    { label: "Variants", pick: (p) => resolveActivity(p, "variants") },
    { label: "Compliance", pick: (p) => resolveActivity(p, "compliance") },
  ];

  return rows.map(({ label, pick }) => {
    const applicable = products.map(pick).filter((activity) => activity.applies);
    return {
      label,
      total: applicable.length,
      complete: applicable.filter((activity) => activity.status === "Complete").length,
    };
  });
}

const UPCOMING_LIMIT = 6;

export function OverviewView() {
  const { products } = useLaunch();
  const preparing = products.filter((product) => summariseReadiness(product).isPreparing);
  const upcoming = [...preparing].sort(compareByUrgency).slice(0, UPCOMING_LIMIT);
  const progress = buildActivityProgress(preparing);
  const needAttention = products.filter(needsAttention).length;
  const missingByProduct = preparing.map((product) => getMissingInformation(product).length);
  const missingTotal = missingByProduct.reduce((sum, count) => sum + count, 0);
  const missingProducts = missingByProduct.filter((count) => count > 0).length;
  const requiredTotal = preparing.reduce((sum, product) => {
    const overview = getInformationOverview(product);
    return sum + overview.available.length + overview.missing.length;
  }, 0);

  return (
    <Page>
      <PageHeading
        title="Product Launch Readiness"
        description="Track upcoming products, understand launch readiness and identify where action is required."
      />
      <SummaryCards />

      <StatusAlert
        tone={needAttention > 0 ? "warning" : "success"}
        title={
          needAttention === 0
            ? "Nothing needs attention"
            : needAttention === 1
              ? "1 product needs your attention"
              : `${needAttention} products need your attention`
        }
      >
        {needAttention > 0 ? (
          <>
            These products have required activities outstanding.{" "}
            <Link href="/action-required">See what is holding each one back</Link>
          </>
        ) : (
          "Every product is ready to launch."
        )}
      </StatusAlert>

      {missingTotal > 0 ? (
        <StatusAlert
          tone="info"
          title={`${missingProducts} ${missingProducts === 1 ? "product is" : "products are"} missing required information`}
        >
          {missingTotal} {missingTotal === 1 ? "piece" : "pieces"} of information still need someone to provide them.{" "}
          <Link href="/products?information=missing">See which products</Link>
        </StatusAlert>
      ) : null}

      <section aria-labelledby="urgent-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeading id="urgent-heading">Most urgent launches</SectionHeading>
          <LinkButton href="/products" variant="outline" size="sm">
            View all products
            <ChevronRight aria-hidden />
          </LinkButton>
        </div>
        <ProductsTable products={upcoming} caption="Most urgent upcoming launches" />
      </section>

      <Card role="region" aria-labelledby="outstanding-heading">
        <CardHeader>
          <CardTitle id="outstanding-heading" className="text-xl">
            Where work is outstanding
          </CardTitle>
          <CardDescription>Completed activities out of those required, across all products.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {progress.map((row) => (
              <LabelledProgress
                key={row.label}
                label={`${row.label}: ${row.complete} of ${row.total} complete`}
                value={row.complete}
                max={row.total}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Information is tracked separately from activities. It shows what is known, not what work is done.
          </p>
          <LabelledProgress
            label={`Required information available: ${requiredTotal - missingTotal} of ${requiredTotal}`}
            value={requiredTotal - missingTotal}
            max={requiredTotal}
          />
        </CardContent>
      </Card>
    </Page>
  );
}
