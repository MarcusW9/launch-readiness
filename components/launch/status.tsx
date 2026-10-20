import type { ReactNode } from "react";
import { Ban, CalendarClock, CircleAlert, CircleCheck, CircleDashed, PackageX, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisplayStatus, ModelAssessment, ModelStatus } from "@/lib/launch/readiness-model";
import { describeStatus } from "@/lib/launch/readiness-model";

export type Tone = "success" | "warning" | "danger" | "info" | "stock" | "neutral";

export const PILL_TONE: Record<Tone, string> = {
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-info",
  stock: "bg-stock-subtle text-stock",
  neutral: "bg-muted text-muted-foreground",
};

const STATUS_STYLE: Record<DisplayStatus, { tone: Tone; icon: ReactNode }> = {
  "Expectation At Risk": { tone: "danger", icon: <CircleAlert className="size-3.5" aria-hidden /> },
  "Information Incomplete": { tone: "warning", icon: <TriangleAlert className="size-3.5" aria-hidden /> },
  "On Track": { tone: "success", icon: <CircleCheck className="size-3.5" aria-hidden /> },
  Live: { tone: "info", icon: <CircleCheck className="size-3.5" aria-hidden /> },
  Offsale: { tone: "neutral", icon: <CircleDashed className="size-3.5" aria-hidden /> },
  Dropped: { tone: "neutral", icon: <Ban className="size-3.5" aria-hidden /> },
};

export function Pill({ tone, icon, children }: { tone: Tone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        PILL_TONE[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** The single status badge on a row or a product page. Late products say by how many working days. */
export function StatusBadge({ assessment }: { assessment: ModelAssessment }) {
  const status: DisplayStatus = assessment.product.lifecycle ?? assessment.status;
  const style = STATUS_STYLE[status];
  const label = assessment.isPreparing ? describeStatus(assessment) : status;
  return (
    <Pill tone={style.tone} icon={style.icon}>
      {label}
    </Pill>
  );
}

export function ModelStatusDot({ status }: { status: ModelStatus }) {
  const tone = STATUS_STYLE[status].tone;
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 shrink-0 rounded-full",
        tone === "danger" && "bg-danger",
        tone === "warning" && "bg-warning",
        tone === "success" && "bg-success",
      )}
    />
  );
}

export function DateChangedFlag({ label = "Date Changed" }: { label?: string }) {
  return (
    <Pill tone="info" icon={<CalendarClock className="size-3.5" aria-hidden />}>
      {label}
    </Pill>
  );
}

export function StockAfterLaunchFlag({ label = "Stock lands after launch" }: { label?: string }) {
  return (
    <Pill tone="stock" icon={<PackageX className="size-3.5" aria-hidden />}>
      {label}
    </Pill>
  );
}
