import { formatLongDate } from "@/lib/launch/readiness";
import { buildTimeline, type ModelAssessment, type TimelineTone } from "@/lib/launch/readiness-model";
import { cn } from "@/lib/utils";

const DOT: Record<TimelineTone, string> = {
  done: "border-success bg-success",
  late: "border-danger bg-danger",
  neutral: "border-primary bg-primary",
  pending: "border-muted-foreground bg-card",
};

const TONE_HINT: Record<TimelineTone, string> = {
  done: "Done",
  late: "Late",
  neutral: "Planned",
  pending: "Waiting",
};

export function LaunchTimeline({ assessment }: { assessment: ModelAssessment }) {
  const events = buildTimeline(assessment);
  return (
    <ol className="m-0 flex list-none flex-col gap-0 p-0 md:flex-row md:gap-2" aria-label="Product timeline">
      {events.map((event, index) => (
        <li key={event.key} className="relative flex flex-1 gap-3 pb-6 last:pb-0 md:flex-col md:gap-2 md:pb-0">
          <div className="flex flex-col items-center md:flex-row">
            <span aria-hidden className={cn("size-3 shrink-0 rounded-full border-2", DOT[event.tone])} />
            {index < events.length - 1 ? (
              <span aria-hidden className="mt-1 w-px flex-1 bg-border md:mt-0 md:ml-1 md:h-px md:w-auto" />
            ) : null}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{event.label}</span>
            <span className={cn("text-sm", event.date ? "text-foreground" : "text-muted-foreground")}>
              {event.date ? formatLongDate(event.date) : event.placeholder}
            </span>
            <span className="text-xs text-muted-foreground">{TONE_HINT[event.tone]}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
