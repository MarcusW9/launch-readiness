import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CriticalPathSummary } from "@/lib/launch/critical-path";
import { formatLongDate } from "@/lib/launch/readiness";

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function OtherDates({ dates }: { dates: CriticalPathSummary["otherDates"] }) {
  if (dates.length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger className="rounded-md px-1.5 py-0.5 text-sm font-medium text-primary underline underline-offset-4 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
        +{plural(dates.length, "other date")}
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="mb-2 text-sm font-medium">Other proposed launch dates</p>
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
          {dates.map(({ date, count }) => (
            <li key={date} className="flex items-center justify-between gap-4">
              <span>{formatLongDate(date)}</span>
              <span className="text-muted-foreground">{plural(count, "line")}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function CountCard({ label, value, dotClass }: { label: string; value: number; dotClass: string }) {
  return (
    <Card size="sm" role="group" aria-label={`${label}: ${value}`} className="h-full">
      <CardContent className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span aria-hidden className={`size-2 rounded-full ${dotClass}`} />
          {label}
        </span>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

interface CriticalPathSummaryStripProps {
  summary: CriticalPathSummary;
  /** Set to false to show only the strip, without the status and "Also flagged" cards. */
  showCounts?: boolean;
}

export function CriticalPathSummaryStrip({ summary, showCounts = true }: CriticalPathSummaryStripProps) {
  const { name, activeLines, mainDate, otherDates, counts, flagged } = summary;

  return (
    <section aria-label={`Critical path summary for ${name}`} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-xl bg-muted/50 px-4 py-3 ring-1 ring-foreground/10">
        <p className="text-base font-semibold">
          {name} · {plural(activeLines, "active line")}
        </p>
        <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <span>Main launch date:</span>
          <span className="font-medium text-foreground">{mainDate ? formatLongDate(mainDate) : "None"}</span>
          <OtherDates dates={otherDates} />
        </p>
      </div>

      {showCounts ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CountCard label="At Risk" value={counts["Expectation At Risk"]} dotClass="bg-danger" />
            <CountCard label="Information Incomplete" value={counts["Information Incomplete"]} dotClass="bg-warning" />
            <CountCard label="On Track" value={counts["On Track"]} dotClass="bg-success" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Also flagged</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CountCard label="Date Changed" value={flagged.dateChanged} dotClass="bg-info" />
              <CountCard label="Stock lands after launch" value={flagged.stockAfterLaunch} dotClass="bg-stock" />
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
