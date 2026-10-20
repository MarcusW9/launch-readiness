"use client";

import { useSession } from "@/lib/auth/session-context";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const ROLES: Role[] = ["downstream", "commercial"];

/** Prototype-only control to act as either simulated role. */
export function RoleSwitcher() {
  const { role, switchRole } = useSession();
  return (
    <div role="group" aria-label="Viewing as" className="flex items-center gap-1 rounded-lg border bg-muted p-0.5">
      {ROLES.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={role === item}
          onClick={() => switchRole(item)}
          className={cn(
            "rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap transition-colors",
            role === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {ROLE_LABELS[item]}
        </button>
      ))}
    </div>
  );
}
