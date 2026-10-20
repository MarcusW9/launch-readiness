"use client";

import { cn } from "@/lib/utils";

export type ProductsViewMode = "exceptions" | "studio";

const OPTIONS: Array<{ value: ProductsViewMode; label: string }> = [
  { value: "exceptions", label: "Exceptions view" },
  { value: "studio", label: "Studio view" },
];

interface ProductsViewSwitchProps {
  value: ProductsViewMode;
  onChange: (next: ProductsViewMode) => void;
}

/** A view, not a role: it is the same in every role and never changes who can edit. */
export function ProductsViewSwitch({ value, onChange }: ProductsViewSwitchProps) {
  return (
    <div role="group" aria-label="Products view" className="inline-flex w-fit rounded-lg bg-muted p-0.5">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
