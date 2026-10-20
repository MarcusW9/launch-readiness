import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "complete" | "active" | "incomplete";

export function Steps({ steps }: { steps: Array<{ label: string; status: StepStatus }> }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0 md:flex-row md:gap-0">
      {steps.map((step, i) => (
        <li
          key={step.label}
          aria-current={step.status === "active" ? "step" : undefined}
          className="flex flex-1 items-center gap-2"
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
              step.status === "complete" && "border-primary bg-primary text-primary-foreground",
              step.status === "active" && "border-primary text-primary",
              step.status === "incomplete" && "text-muted-foreground",
            )}
          >
            {step.status === "complete" ? <Check className="size-4" aria-hidden /> : i + 1}
          </span>
          <span className={cn("text-sm", step.status === "incomplete" ? "text-muted-foreground" : "font-medium")}>
            {step.label}
            <span className="sr-only">
              {`, ${step.status === "complete" ? "complete" : step.status === "active" ? "current step" : "not started"}`}
            </span>
          </span>
          {i < steps.length - 1 ? <span aria-hidden className="mx-2 hidden h-px flex-1 bg-border md:block" /> : null}
        </li>
      ))}
    </ol>
  );
}
