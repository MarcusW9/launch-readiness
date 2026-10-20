import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Page, PageHeading, SectionHeading } from "@/components/launch/page-frame";
import { Steps } from "@/components/launch/steps";
import { AT_RISK_WITHIN_DAYS } from "@/lib/launch/readiness";

export const metadata: Metadata = { title: "About this prototype | Launch Readiness" };

const RESEARCH_QUESTIONS = [
  "Does this accurately represent how you think about launch readiness?",
  "Would you trust a single overall readiness status?",
  "What information do you need on the dashboard, and what only after opening a product?",
  "Are the activity statuses meaningful? Are important states missing?",
  "Is it clear what information is already known and what is still missing, without asking anyone to re-enter it?",
  "Does the next action on each requirement tell you what to do and who needs to do it?",
  "Is Action Required useful?",
  "What actually determines whether something is at risk?",
  "Which launch activities apply across most categories, and how much does the workflow vary?",
  "Who should update each activity, and which could update automatically from existing systems?",
  "What does a receiving team need when an activity is handed over?",
  "Would this replace part of your current process, or would you still need the spreadsheet?",
];

const MODEL_STEPS = ["Product", "Information", "Requirements", "Work", "Next action", "Ready"].map((label) => ({
  label,
  status: "complete" as const,
}));

export default function AboutPage() {
  return (
    <Page>
      <PageHeading
        title="About this prototype"
        description="A concept prototype exploring whether launch readiness is easier to manage as structured product-level workflows than as a large Excel tracker."
      />

      <section aria-labelledby="model-heading" className="flex flex-col gap-4">
        <SectionHeading id="model-heading">The model being tested</SectionHeading>
        <Steps steps={MODEL_STEPS} />
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card role="region" aria-labelledby="rules-heading" className="h-full">
          <CardHeader>
            <CardTitle id="rules-heading">Prototype rules</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p>
              Ready means every applicable required activity is complete. Action Required means something is
              outstanding. At Risk means something is outstanding and launch is within {AT_RISK_WITHIN_DAYS} days. The
              At Risk definition has not been agreed and is a placeholder for testing.
            </p>
            <p>
              The prototype separates three ideas. Information is what is known about the product, and what is still
              missing. Requirements are the activities that apply, each with a plain reason why. Work is where each
              activity stands: Unable to start, Ready to start, In Progress, Blocked, Complete, or Not Required.
            </p>
            <p>
              Not Required is different from incomplete: it means the activity does not apply to that product. Each
              activity also shows a next action, such as providing missing information or starting the work.
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
              on refresh, or with Reset demo data. There is no login, no notification sending and no connection to
              any product, stock or asset system, or to the spreadsheet it replaces.
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
