"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications, type Toast } from "@/lib/launch/notifications";

const TOAST_DURATION_MS = 6000;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <li className="pointer-events-auto flex items-start gap-2 rounded-lg bg-popover p-3 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10">
      <p className="flex-1 leading-relaxed">{toast.message}</p>
      <Button variant="ghost" size="icon-sm" aria-label="Dismiss notification" onClick={onDismiss}>
        <X aria-hidden />
      </Button>
    </li>
  );
}

export function Toaster() {
  const { toasts, dismissToast } = useNotifications();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] w-[calc(100vw-2rem)] max-w-sm"
    >
      <ul className="flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </ul>
    </div>
  );
}
