"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assessAndSort } from "@/lib/launch/readiness-model";
import { useLaunch } from "@/lib/launch/store";
import { LabelledProgress } from "./labelled-progress";
import { LinkButton } from "./link-button";
import { Page, PageHeading, SectionHeading } from "./page-frame";
import { ProductsTable } from "./products-table";
import { StatusAlert } from "./status-alert";
import { SummaryCards } from "./summary-cards";

const UPCOMING_LIMIT = 6;

export function OverviewView() {
  const { products } = useLaunch();
  const preparing = assessAndSort(products).filter((assessment) => assessment.isPreparing);
  const upcoming = preparing.slice(0, UPCOMING_LIMIT).map((assessment) => assessment.product);
  const atRisk = preparing.filter((assessment) => assessment.status === "Expectation At Risk").length;
  const incomplete = preparing.filter((assessment) => assessment.status === "Information Incomplete").length;
  const mandatoryTotal = preparing.reduce((sum, assessment) => sum + assessment.completeness.mandatoryCount, 0);
  const mandatoryMissing = preparing.reduce(
    (sum, assessment) => sum + assessment.completeness.missingMandatory.length,
    0,
  );
  const needAttention = atRisk + incomplete;

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
            {atRisk} at risk of missing launch and {incomplete} waiting on mandatory information.{" "}
            <Link href="/action-required">See what is holding each one back</Link>
          </>
        ) : (
          "Every product is on track."
        )}
      </StatusAlert>

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

      <Card role="region" aria-labelledby="information-progress-heading">
        <CardHeader>
          <CardTitle id="information-progress-heading" className="text-xl">
            Mandatory information
          </CardTitle>
          <CardDescription>
            The SLA only starts once every mandatory field is complete, so missing information is what delays launches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LabelledProgress
            label={`Mandatory fields complete: ${mandatoryTotal - mandatoryMissing} of ${mandatoryTotal}`}
            value={mandatoryTotal - mandatoryMissing}
            max={mandatoryTotal}
          />
        </CardContent>
      </Card>
    </Page>
  );
}
