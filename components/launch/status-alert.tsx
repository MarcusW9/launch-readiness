import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "error";

const TONE_CLASS: Record<AlertTone, string> = {
  info: "border-info/30 bg-info-subtle text-info",
  success: "border-success/30 bg-success-subtle text-success",
  warning: "border-warning/30 bg-warning-subtle text-warning",
  error: "border-danger/30 bg-danger-subtle text-danger",
};

const TONE_ICON: Record<AlertTone, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
};

interface StatusAlertProps {
  tone: AlertTone;
  title: string;
  children?: ReactNode;
}

export function StatusAlert({ tone, title, children }: StatusAlertProps) {
  const Icon = TONE_ICON[tone];
  return (
    <Alert className={cn(TONE_CLASS[tone])}>
      <Icon aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      {children ? (
        <AlertDescription className="text-foreground [&_a]:font-medium">{children}</AlertDescription>
      ) : null}
    </Alert>
  );
}
