import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill } from "@/components/launch/status";
import { LATEST_RELEASE } from "@/lib/launch/guide-content";
import {
  DATE_CHANGED_WITHIN_DAYS,
  MANDATORY_FIELDS,
  SLA_CONFIG,
  WORKING_DAYS_LIMITATION,
} from "@/lib/launch/readiness-config";
import { DownloadButton } from "./download-button";
import { LinkButton } from "./link-button";
import { SectionHeading } from "./page-frame";

export function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <SectionHeading id={id}>{title}</SectionHeading>
        {intro ? <p className="text-muted-foreground">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function InfoCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <h3>{title}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
}

export function WhatItIs() {
  return (
    <Section id="what-it-is" title="What Launch Readiness is">
      <p>
        Every new product needs information before downstream teams can start work: the title, brand, channels,
        barcode and more. Today that progress is tracked in large spreadsheets, which makes it hard to see what is
        complete, what is waiting on someone, and what is about to cause a missed launch.
      </p>
      <p>
        This prototype tracks one thing: is the mandatory product information complete, and if it is, will the
        downstream teams have enough time before the launch date? Commercial / Range Planning owns the information and
        the Proposed Launch Date. The downstream team can see everything and chase what is missing.
      </p>
    </Section>
  );
}

export function TheModel() {
  return (
    <Section
      id="the-model"
      title="The idea in three steps"
      intro="Everything in the prototype follows this chain, from a product record through to a launch status."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="1. Mandatory information">
          <p>
            {MANDATORY_FIELDS.length} fields are mandatory. A value of N/A or a spreadsheet error such as #N/A counts
            as missing. Optional fields never block anything.
          </p>
        </InfoCard>
        <InfoCard title="2. The SLA starts">
          <p>
            Once the last mandatory field is completed the SLA starts. It runs for {SLA_CONFIG.defaultWorkingDays}{" "}
            working days by default, and 25 for a Guest bed. Both numbers are placeholders.
          </p>
        </InfoCard>
        <InfoCard title="3. Launch status">
          <p>
            The SLA Projection Date is the start date plus the SLA working days. If that is later than the launch date,
            the launch expectation is at risk.
          </p>
        </InfoCard>
      </div>
    </Section>
  );
}

export function ReadinessStatuses() {
  return (
    <Section
      id="readiness"
      title="What the statuses mean"
      intro="Every product that is still being prepared shows one of three statuses, worked out automatically."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title={<Pill tone="success">On Track</Pill>}>
          <p>Mandatory information is complete and the SLA Projection Date is on or before the launch date.</p>
        </InfoCard>
        <InfoCard title={<Pill tone="warning">Information Incomplete</Pill>}>
          <p>
            At least one mandatory field is missing, so the SLA has not started. The product page lists exactly what is
            missing.
          </p>
        </InfoCard>
        <InfoCard title={<Pill tone="danger">Expectation At Risk</Pill>}>
          <p>
            The information is complete, but the SLA Projection Date falls after the launch date, or the launch date has
            already passed.
          </p>
        </InfoCard>
      </div>
      <p className="text-sm text-muted-foreground">
        Live, Offsale and Dropped products stay in the Products table but are left out of the overview counts and the
        Action Required page. {WORKING_DAYS_LIMITATION}
      </p>
    </Section>
  );
}

export function FlagsAndPlaceholders() {
  return (
    <Section
      id="flags"
      title="Flags and placeholders"
      intro="Flags sit beside the status without changing it. Placeholders are numbers and rules that have not been agreed yet."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCard title="Flags">
          <p>
            <strong>Date Changed</strong> marks a product whose Proposed Launch Date moved in the last{" "}
            {DATE_CHANGED_WITHIN_DAYS} days.
          </p>
          <p>
            <strong>Stock lands after launch</strong> marks a product whose Stock Ready Date is later than its
            Proposed Launch Date.
          </p>
          <p>
            Flags show as smaller cards on the Overview and as Additional Checks on Products. They never change the
            status, the completeness or the SLA.
          </p>
        </InfoCard>
        <InfoCard title="Placeholders">
          <p>
            The SLA length ({SLA_CONFIG.defaultWorkingDays} working days, 25 for a Guest bed) is labelled{" "}
            {SLA_CONFIG.label.toLowerCase()} wherever it appears, because the real figure has not been agreed.
          </p>
          <p>
            Working days are Monday to Friday and bank holidays are ignored, so a projection can be a day or more
            optimistic than real life. The demo date is fixed at 10 Nov 2026, and every product, ID and name is
            fictional.
          </p>
        </InfoCard>
      </div>
    </Section>
  );
}

export function SlaGuide() {
  return (
    <Section
      id="sla"
      title="How the SLA is worked out"
      intro="The SLA is the time downstream teams need once information is complete."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCard title="Start date">
          <p>
            The SLA starts on the date the last mandatory field was completed. If any mandatory field is missing, the
            SLA does not start and there is no projection.
          </p>
        </InfoCard>
        <InfoCard title="Projection date">
          <p>
            SLA Projection Date = start date plus the SLA working days. Changing the Proposed Launch Date changes the
            outcome straight away, and the product page shows the reason.
          </p>
        </InfoCard>
      </div>
    </Section>
  );
}

const WALKTHROUGH = [
  "Open Action Required. Products are grouped by Expectation At Risk and Information Incomplete, with what is holding each one back.",
  "Open a product. The timeline shows when information was completed, when the SLA ends and the launch date.",
  "Use the role switcher in the header to act as Commercial / Range Planning.",
  "As Commercial, edit a missing field in Product information and save. The status and SLA update straight away.",
  "Change the Proposed Launch Date and watch the status change between On Track and Expectation At Risk.",
  "Switch back to Downstream and use Remind Commercial to chase every product with missing information.",
  "Select Reset demo data in the strip at the top whenever you want to start again.",
] as const;

export function Walkthrough() {
  return (
    <Section id="try-it" title="Try it in five minutes" intro="A short route through the prototype that shows the whole idea working.">
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {WALKTHROUGH.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span aria-hidden className="w-5 shrink-0 font-semibold text-primary">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div>
        <LinkButton href="/action-required">
          Start with Action Required
          <ChevronRight aria-hidden />
        </LinkButton>
      </div>
    </Section>
  );
}

export function HowTheThinkingChanged() {
  return (
    <Section id="thinking" title="How the thinking changed">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="Version 1">
          <p>Modelled each team&apos;s workflow as a set of activities that had to be started and finished.</p>
        </InfoCard>
        <InfoCard title="Version 3">
          <p>
            Discovery showed that downstream teams track their work in their own systems. The model moved to
            information completeness and SLA risk.
          </p>
        </InfoCard>
        <InfoCard title="Version 4">
          <p>Added changes from a show-and-tell with the teams who would use it.</p>
        </InfoCard>
      </div>
    </Section>
  );
}

export function Limits() {
  return (
    <Section id="limits" title="What to keep in mind">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCard title="It is a prototype">
          <p>
            All products, IDs and statuses are fictional. Nothing is connected to a real system, and there is no real
            sign-in or notification sending. The role switcher in the header is a stand-in for real sign-in.
          </p>
        </InfoCard>
        <InfoCard title="Changes are temporary">
          <p>
            Any change you make lasts for your session only. Refreshing the page or choosing Reset demo data returns
            everything to its starting point. The demo date is fixed at 10 Nov 2026.
          </p>
        </InfoCard>
      </div>
      <div className="flex flex-wrap gap-3">
        <DownloadButton href={LATEST_RELEASE.href} fileName={LATEST_RELEASE.fileName} variant="outline" size="sm">
          Download the v{LATEST_RELEASE.version} change log (.md)
        </DownloadButton>
        <LinkButton href="/about" variant="ghost" size="sm">
          Read about this prototype
          <ChevronRight aria-hidden />
        </LinkButton>
      </div>
    </Section>
  );
}
