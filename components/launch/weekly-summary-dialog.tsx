"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ProductFilters } from "@/lib/launch/filters";
import { useNotifications } from "@/lib/launch/notifications";
import { formatShortDate } from "@/lib/launch/readiness";
import type { Product } from "@/lib/launch/types";
import {
  SUMMARY_RECIPIENTS,
  WEEKLY_SUMMARY_FOOTER,
  buildWeeklySummary,
  deadlineLabel,
  launchGapLabel,
  weeklySummaryText,
} from "@/lib/launch/weekly-summary";
import { LabelledSelect } from "./labelled-select";

function CatNo({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="font-medium underline underline-offset-4">
      {product.id}
    </Link>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">
        {title} <span className="font-normal text-muted-foreground">({count})</span>
      </h3>
      {count === 0 ? <p className="text-muted-foreground">None.</p> : <ul className="flex flex-col gap-1.5">{children}</ul>}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}

function Count({ value, label, tone }: { value: number; label: string; tone: "danger" | "warning" | "success" }) {
  const toneClass = {
    danger: "bg-danger-subtle text-danger",
    warning: "bg-warning-subtle text-warning",
    success: "bg-success-subtle text-success",
  }[tone];
  return (
    <span className={`inline-flex items-baseline gap-1 rounded-md px-2 py-0.5 font-medium ${toneClass}`}>
      {value} {label}
    </span>
  );
}

interface WeeklySummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  filters: ProductFilters;
}

export function WeeklySummaryDialog({ open, onOpenChange, products, filters }: WeeklySummaryDialogProps) {
  const { notify } = useNotifications();
  const [recipient, setRecipient] = useState<string>(SUMMARY_RECIPIENTS[0].value);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const summary = useMemo(() => buildWeeklySummary(products, filters), [products, filters]);
  const recipientLabel = SUMMARY_RECIPIENTS.find((option) => option.value === recipient)?.label ?? "";

  async function copyText() {
    try {
      await navigator.clipboard.writeText(weeklySummaryText(summary));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  function send() {
    notify({
      title: "Weekly summary sent (simulated)",
      body: `${summary.subject} to ${recipientLabel}. No email was sent.`,
      toast: `Weekly summary sent to ${recipientLabel} (simulated). No email was sent.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setCopyState("idle");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <div className="flex flex-col gap-1">
          <DialogTitle>Weekly summary preview</DialogTitle>
          <DialogDescription>
            This is how the email would look. Choose who it goes to, then copy it or send it. Sending is simulated.
          </DialogDescription>
        </div>

        <LabelledSelect label="Send to" options={SUMMARY_RECIPIENTS} value={recipient} onChange={setRecipient} />

        <article aria-label="Email preview" className="flex flex-col gap-5 rounded-lg border bg-card p-4 text-card-foreground">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-b pb-3">
            <dt className="text-muted-foreground">To</dt>
            <dd>{recipientLabel}</dd>
            <dt className="text-muted-foreground">Subject</dt>
            <dd className="font-medium">{summary.subject}</dd>
          </dl>

          <p className="flex flex-wrap items-center gap-x-2 gap-y-2 leading-relaxed">
            <span className="font-medium">
              {summary.total} {summary.total === 1 ? "product" : "products"}:
            </span>
            <Count value={summary.atRiskCount} label="at risk" tone="danger" />
            <Count value={summary.incompleteCount} label="information incomplete" tone="warning" />
            <Count value={summary.onTrackCount} label="on track" tone="success" />
          </p>

          <Section title="Needs attention: At Risk" count={summary.atRisk.length}>
            {summary.atRisk.map((item) => (
              <Row key={item.product.id}>
                <CatNo product={item.product} /> {item.product.name}. {launchGapLabel(item)}, launches{" "}
                {formatShortDate(item.product.launchDate)}.
              </Row>
            ))}
          </Section>

          <Section title="Information needed soon" count={summary.infoNeeded.length}>
            {summary.infoNeeded.map((item) => (
              <Row key={item.product.id}>
                <CatNo product={item.product} /> {item.product.name}. {item.missingCount} missing, needed by{" "}
                {formatShortDate(item.neededBy)} ({deadlineLabel(item)}).
              </Row>
            ))}
          </Section>

          <Section title="Changed this week: launch date" count={summary.dateChanges.length}>
            {summary.dateChanges.map((item) => (
              <Row key={item.product.id}>
                <CatNo product={item.product} /> {item.product.name}. {formatShortDate(item.previousLaunchDate)} to{" "}
                {formatShortDate(item.product.launchDate)}.
              </Row>
            ))}
          </Section>

          <Section title="Changed this week: stock lands after launch" count={summary.stockAfterLaunch.length}>
            {summary.stockAfterLaunch.map((item) => (
              <Row key={item.product.id}>
                <CatNo product={item.product} /> {item.product.name}. Stock lands {formatShortDate(item.stockLandsDate)},
                launches {formatShortDate(item.product.launchDate)}.
              </Row>
            ))}
          </Section>

          <p className="border-t pt-3 text-sm text-muted-foreground">{WEEKLY_SUMMARY_FOOTER}</p>
        </article>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={send}>Send (simulated)</Button>
          <Button variant="outline" onClick={copyText}>
            Copy text
          </Button>
          <DialogClose render={<Button variant="ghost" />}>Close</DialogClose>
          <p role="status" className="text-sm text-muted-foreground">
            {copyState === "copied" ? "Copied to clipboard." : copyState === "failed" ? "Could not copy. Select the text instead." : ""}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
