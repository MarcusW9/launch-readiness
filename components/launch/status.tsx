import type { ReactNode } from "react";
import { Ban, CircleAlert, CircleCheck, CirclePlay, Clock, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ActivityStatus,
  LaunchStatus,
  ProductLifecycle,
  Readiness,
  WorkState,
} from "@/lib/launch/types";

type Tone = "success" | "warning" | "error" | "information" | "neutral";

const PILL_TONE: Record<Tone, string> = {
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  error: "bg-danger-subtle text-danger",
  information: "bg-info-subtle text-info",
  neutral: "bg-muted text-muted-foreground",
};

const TEXT_TONE: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  error: "text-danger",
  information: "text-info",
  neutral: "text-muted-foreground",
};

const icon = {
  check: <CircleCheck className="size-3.5" aria-hidden />,
  warning: <TriangleAlert className="size-3.5" aria-hidden />,
  alert: <CircleAlert className="size-3.5" aria-hidden />,
  play: <CirclePlay className="size-3.5" aria-hidden />,
  clock: <Clock className="size-3.5" aria-hidden />,
  blocked: <Ban className="size-3.5" aria-hidden />,
};

const READINESS: Record<Readiness, { tone: Tone; icon: ReactNode }> = {
  Ready: { tone: "success", icon: icon.check },
  "Action Required": { tone: "warning", icon: icon.warning },
  "At Risk": { tone: "error", icon: icon.alert },
};

const ACTIVITY: Record<Exclude<ActivityStatus, "Not Required">, { tone: Tone; icon: ReactNode }> = {
  Complete: { tone: "success", icon: icon.check },
  "In Progress": { tone: "information", icon: icon.play },
  "Not Started": { tone: "neutral", icon: icon.clock },
  Blocked: { tone: "error", icon: icon.blocked },
};

function Pill({ tone, icon: iconNode, label }: { tone: Tone; icon: ReactNode; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        PILL_TONE[tone],
      )}
    >
      {iconNode}
      {label}
    </span>
  );
}

export function ReadinessPill({ readiness }: { readiness: Readiness }) {
  const config = READINESS[readiness];
  return <Pill tone={config.tone} icon={config.icon} label={readiness} />;
}

const LIFECYCLE: Record<ProductLifecycle, { tone: Tone; icon: ReactNode }> = {
  Live: { tone: "information", icon: icon.check },
  Offsale: { tone: "neutral", icon: icon.clock },
  Dropped: { tone: "neutral", icon: icon.blocked },
};

/** Readiness while a product is being prepared, lifecycle status once it is not. */
export function LaunchStatusPill({ status }: { status: LaunchStatus }) {
  if (status === "Live" || status === "Offsale" || status === "Dropped") {
    const config = LIFECYCLE[status];
    return <Pill tone={config.tone} icon={config.icon} label={status} />;
  }
  return <ReadinessPill readiness={status} />;
}

export function ActivityStatusPill({ status }: { status: ActivityStatus }) {
  if (status === "Not Required") {
    return (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground">
        Not Required
      </span>
    );
  }
  const config = ACTIVITY[status];
  return <Pill tone={config.tone} icon={config.icon} label={status} />;
}

const WORK_STATE: Record<Exclude<WorkState, "Not Required">, { tone: Tone; icon: ReactNode }> = {
  "Awaiting information": { tone: "warning", icon: icon.warning },
  "Ready to start": { tone: "information", icon: icon.play },
  "In Progress": { tone: "information", icon: icon.play },
  Blocked: { tone: "error", icon: icon.blocked },
  Complete: { tone: "success", icon: icon.check },
};

/** Workflow state that is distinct from information completeness. */
export function WorkStatePill({ workState, label }: { workState: WorkState; label: string }) {
  if (workState === "Not Required") return <ActivityStatusPill status="Not Required" />;
  const config = WORK_STATE[workState];
  return <Pill tone={config.tone} icon={config.icon} label={label} />;
}

/** Lightweight status for dense table cells. */
export function ActivityStatusText({ status }: { status: ActivityStatus }) {
  if (status === "Not Required") {
    return <span className="text-xs text-muted-foreground">Not required</span>;
  }
  const config = ACTIVITY[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", TEXT_TONE[config.tone])}>
      {config.icon}
      {status}
    </span>
  );
}
