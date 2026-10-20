import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LaunchStatusPill, ReadinessPill } from "@/components/launch/status";
import { ACTIVITY_DEFINITIONS, ACTIVITY_ORDER } from "@/lib/launch/activities";
import { LATEST_RELEASE } from "@/lib/launch/guide-content";
import { AT_RISK_WITHIN_DAYS } from "@/lib/launch/readiness";
import { DownloadButton } from "./download-button";
import { LinkButton } from "./link-button";
import { SectionHeading } from "./page-frame";
import { Steps } from "./steps";

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
        Every new product needs a number of things to happen before it can go on sale: the product record set up,
        imagery produced, content written, variants created, compliance signed off. Today that progress is tracked in
        large spreadsheets, which makes it hard to see what is finished, what is waiting on someone, and what is about
        to cause a missed launch.
      </p>
      <p>
        This prototype shows a different approach. Each product has its own list of the activities it needs, and each
        activity needs certain information before work can begin. The tool shows what is already known, what is
        genuinely missing and who needs to provide it. Activity statuses then roll up into one overall readiness
        answer: is this product ready to launch, and if not, what is stopping it?
      </p>
    </Section>
  );
}

const MODEL_STEPS = ["Product", "Requirements", "Information", "Work state", "Action", "Ready"].map((label) => ({
  label,
  status: "complete" as const,
}));

export function TheModel() {
  return (
    <Section
      id="the-model"
      title="The idea in six steps"
      intro="Everything in the prototype follows this chain, from a product through to a launch-ready answer."
    >
      <Steps steps={MODEL_STEPS} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="1. Product and requirements">
          <p>
            A product&apos;s characteristics decide what it needs. A product with several sizes needs Variants. An
            own-brand product needs Studio Imagery. A regulated product needs Compliance.
          </p>
        </InfoCard>
        <InfoCard title="2. Information and work state">
          <p>
            Each activity lists the information it needs. Existing product data is never asked for again; only
            genuinely missing items are requested. An activity is then Unable to start, Ready to start, In
            Progress, Blocked or Complete. Activities that do not apply are Not Required.
          </p>
        </InfoCard>
        <InfoCard title="3. Action and ready">
          <p>
            If anything required is outstanding, the product needs action. When every required activity is complete,
            the product is Ready.
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
      title="What the readiness statuses mean"
      intro="Every product shows one overall status, worked out automatically from its required activities."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title={<ReadinessPill readiness="Ready" />}>
          <p>Every required activity is complete. Nothing more is needed to launch.</p>
        </InfoCard>
        <InfoCard title={<ReadinessPill readiness="Action Required" />}>
          <p>At least one required activity is not finished, and there is still time to do it.</p>
        </InfoCard>
        <InfoCard title={<ReadinessPill readiness="At Risk" />}>
          <p>
            Work is outstanding and the launch date is within {AT_RISK_WITHIN_DAYS} days. This is the most urgent
            state.
          </p>
        </InfoCard>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title={<LaunchStatusPill status="Live" />}>
          <p>The product has launched and is on sale. There is no work left to track.</p>
        </InfoCard>
        <InfoCard title={<LaunchStatusPill status="Offsale" />}>
          <p>The product was on sale and has been withdrawn. It is no longer being prepared.</p>
        </InfoCard>
        <InfoCard title={<LaunchStatusPill status="Dropped" />}>
          <p>The product was cancelled before launch. Its activities show Not applicable.</p>
        </InfoCard>
      </div>
      <p className="text-sm text-muted-foreground">
        Live, Offsale and Dropped products stay in the Products table but are left out of the overview counts and the
        Action Required page. The At Risk rule is a placeholder for testing. The real definition has not been agreed.
      </p>
    </Section>
  );
}

const APPLIES_WHEN: Record<(typeof ACTIVITY_ORDER)[number], string> = {
  "product-setup": "Every product",
  variants: "The product is sold in more than one size or colour",
  "studio-imagery": "The product is photographed in the in-house studio, such as own-brand products",
  "supplier-imagery": "The supplier provides the images",
  "product-content": "Every product",
  compliance: "The product has regulated characteristics, such as safety or labelling requirements",
};

export function ActivityGuide() {
  return (
    <Section
      id="activities"
      title="The launch activities"
      intro="Six activities are modelled. Which ones a product needs depends on what the product is."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ACTIVITY_ORDER.map((key) => {
          const def = ACTIVITY_DEFINITIONS[key];
          return (
            <InfoCard key={key} title={def.name}>
              <p>{def.description}</p>
              <p className="text-sm text-muted-foreground">
                <strong>Needed when:</strong> {APPLIES_WHEN[key]}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Owner:</strong> {def.ownerTeam}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Done when:</strong> {def.doneWhen}
              </p>
            </InfoCard>
          );
        })}
      </div>
      <p>
        Studio Imagery has a fuller workflow (Required, Briefed, In Progress, Complete) because it hands work to
        another team. The other activities move through Not Started, In Progress and Complete.
      </p>
    </Section>
  );
}

const WALKTHROUGH = [
  "Open Action Required and find the Little Acorn Wooden Play Kitchen. It lists the work outstanding and the information still needed.",
  "Open the product. Read what is stopping it from being ready, then review the Information section to see what is known and what is missing.",
  "Choose Provide on a missing item, enter the details and save. The item moves to Available and the requirements that were waiting on it update.",
  "Open the Studio Imagery activity. Read the brief and the next action, then use the workflow buttons to move it forward.",
  "Choose Mark complete. The activity, the product page and the readiness status all update.",
  "Go back to Action Required. Once everything is done the product drops off the list and the count in the navigation goes down.",
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

export function Limits() {
  return (
    <Section id="limits" title="What to keep in mind">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCard title="It is a prototype">
          <p>
            All products, IDs and statuses are fictional. Nothing is connected to a real system, and there is no
            real sign-in or notification sending. The demo user in the header is a stand-in.
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
