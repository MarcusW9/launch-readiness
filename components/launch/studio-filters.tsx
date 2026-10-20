"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasStudioFilters, type StudioFilters, type StudioOptions } from "@/lib/launch/studio";
import { LabelledSelect } from "./labelled-select";
import { SearchBox } from "./search-box";

interface StudioFiltersBarProps {
  filters: StudioFilters;
  options: StudioOptions;
  onChange: (next: StudioFilters) => void;
  onClear: () => void;
}

function withAll(allLabel: string, values: string[]) {
  return [{ value: "all", label: allLabel }, ...values.map((value) => ({ value, label: value }))];
}

function activeChips(filters: StudioFilters, onChange: (next: StudioFilters) => void) {
  const chips: Array<{ label: string; remove: () => void }> = [];
  if (filters.query.trim()) {
    chips.push({ label: `Search: ${filters.query.trim()}`, remove: () => onChange({ ...filters, query: "" }) });
  }
  if (filters.criticalPath !== "all") {
    chips.push({
      label: `Critical path: ${filters.criticalPath}`,
      remove: () => onChange({ ...filters, criticalPath: "all" }),
    });
  }
  if (filters.style !== "all") {
    chips.push({ label: `Style: ${filters.style}`, remove: () => onChange({ ...filters, style: "all" }) });
  }
  if (filters.imageSource !== "all") {
    chips.push({
      label: `Image source: ${filters.imageSource}`,
      remove: () => onChange({ ...filters, imageSource: "all" }),
    });
  }
  return chips;
}

export function StudioFiltersBar({ filters, options, onChange, onClear }: StudioFiltersBarProps) {
  const chips = activeChips(filters, onChange);

  return (
    <section aria-label="Filter studio products" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="sm:col-span-3 lg:col-span-1">
          <SearchBox value={filters.query} onChange={(query) => onChange({ ...filters, query })} />
        </div>
        <LabelledSelect
          label="Critical path"
          options={withAll("All critical paths", options.criticalPaths)}
          value={filters.criticalPath}
          onChange={(criticalPath) => onChange({ ...filters, criticalPath })}
        />
        <LabelledSelect
          label="Customer style preference"
          options={withAll("All styles", options.styles)}
          value={filters.style}
          onChange={(style) => onChange({ ...filters, style })}
        />
        <LabelledSelect
          label="Image source"
          options={withAll("All image sources", options.imageSources)}
          value={filters.imageSource}
          onChange={(imageSource) => onChange({ ...filters, imageSource })}
        />
      </div>
      {hasStudioFilters(filters) ? (
        <div className="flex flex-wrap items-center gap-2">
          <ul aria-label="Active filters" className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
            {chips.map((chip) => (
              <li
                key={chip.label}
                className="inline-flex items-center gap-1 rounded-full bg-muted py-0.5 pr-1 pl-3 text-sm"
              >
                {chip.label}
                <button
                  type="button"
                  aria-label={`Remove filter ${chip.label}`}
                  onClick={chip.remove}
                  className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all
          </Button>
        </div>
      ) : null}
    </section>
  );
}
