import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Page, PageHeading, SectionHeading } from "@/components/launch/page-frame";
import { SLA_CONFIG } from "@/lib/launch/readiness-config";

export const metadata: Metadata = { title: "About this prototype | Launch Readiness" };

const RESEARCH_QUESTIONS = [
  "Does this accurately represent how you think about launch readiness?",
  "Is mandatory information the right thing to gate on, and is the list of mandatory fields right?",
  "Is it clear what is missing, and who needs to provide it?",
  "Does the SLA Projection Date match how long downstream teams really need?",
  "Is Action Required useful, and is the order of products right?",
  "Should Commercial / Range Planning be the only team that can edit product information?",
  "Is the reminder to Commercial the right way to chase missing information?",
  "Would this replace part of your current process, or would you still need the spreadsheet?",
];

export default function AboutPage() {
  return (
    <Page>
      <PageHeading
        title="About this prototype"
        description="A concept prototype exploring whether launch readiness is easier to manage as mandatory information plus a simple SLA than as a large Excel tracker."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card role="region" aria-labelledby="rules-heading" className="h-full">
          <CardHeader>
            <CardTitle id="rules-heading">Prototype rules</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p>
              Information Incomplete means a mandatory field is missing, so the SLA has not started. Once information
              is complete the SLA runs for {SLA_CONFIG.defaultWorkingDays} working days by default (
              {SLA_CONFIG.label.toLowerCase()}). If the SLA Projection Date is after the launch date, the status is
              Expectation At Risk. Otherwise it is On Track.
            </p>
            <p>
              Downstream teams can view everything. Commercial / Range Planning can edit fields and the Proposed Launch
              Date. Neither the SLA durations nor the mandatory field list has been agreed.
            </p>
          </CardContent>
        </Card>
        <Card role="region" aria-labelledby="simulated-heading" className="h-full">
          <CardHeader>
            <CardTitle id="simulated-heading">What is simulated</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              All data is synthetic and the demo date is fixed. Changes are held in memory for your session and reset
              on refresh, or with Reset demo data. Roles are switched with a control in the header rather than a real
              login, reminders are not sent, and nothing is connected to any product, stock or asset system.
            </p>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="questions-heading" className="flex flex-col gap-4">
        <SectionHeading id="questions-heading">Questions to explore in testing</SectionHeading>
        <ol className="m-0 list-decimal space-y-1 pl-6 marker:text-muted-foreground">
          {RESEARCH_QUESTIONS.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </section>
    </Page>
  );
}
