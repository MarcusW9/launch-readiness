"use client";

import Link from "next/link";
import { ChevronRight, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate } from "@/lib/launch/readiness";
import {
  assessAndSort,
  describeLaunchIn,
  explainStatus,
  type ModelAssessment,
  type ModelStatus,
} from "@/lib/launch/readiness-model";
import { useLaunch } from "@/lib/launch/store";
import { LinkButton } from "./link-button";
import { Page, PageHeading } from "./page-frame";
import { StatusBadge } from "./status";
import { StatusAlert } from "./status-alert";

function AttentionCard({ assessment }: { assessment: ModelAssessment }) {
  const { product, completeness } = assessment;
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              Launch: {formatShortDate(product.launchDate)} ({describeLaunchIn(assessment.launchInWorkingDays).toLowerCase()})
              {" · "}ID {product.id}
            </p>
          </div>
          <StatusBadge assessment={assessment} />
        </div>

        <p className="m-0 text-sm">{explainStatus(assessment)}</p>

        {completeness.missingMandatory.length > 0 ? (
          <section aria-label={`Missing information for ${product.name}`} className="flex flex-col gap-2">
            <h4 className="text-sm font-medium text-muted-foreground">Mandatory information missing</h4>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {completeness.missingMandatory.map((field) => (
                <li key={field.definition.key}>
                  <Link
                    href={`/products/${product.id}#information`}
                    className="inline-flex items-center gap-1 rounded-lg bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <TriangleAlert className="size-3.5" aria-hidden />
                    {field.definition.label}
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

function Group({ title, status, items }: { title: string; status: ModelStatus; items: ModelAssessment[] }) {
  const group = items.filter((assessment) => assessment.status === status);
  if (group.length === 0) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">
        {title} <span className="text-sm font-normal text-muted-foreground">({group.length})</span>
      </h2>
      <div className="flex flex-col gap-4">
        {group.map((assessment) => (
          <AttentionCard key={assessment.product.id} assessment={assessment} />
        ))}
      </div>
    </section>
  );
}

export function ActionRequiredView() {
  const { products } = useLaunch();
  const needing = assessAndSort(products).filter(
    (assessment) => assessment.isPreparing && assessment.status !== "On Track",
  );

  return (
    <Page>
      <PageHeading
        title="Action Required"
        description="What do you need to worry about? Products are ordered by urgency, with what is holding each one back."
      />
      {needing.length === 0 ? (
        <StatusAlert tone="success" title="Nothing needs attention">
          Every product is on track.
        </StatusAlert>
      ) : (
        <>
          <Group title="Expectation At Risk" status="Expectation At Risk" items={needing} />
          <Group title="Information Incomplete" status="Information Incomplete" items={needing} />
        </>
      )}
    </Page>
  );
}
