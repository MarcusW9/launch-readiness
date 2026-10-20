"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_FILTERS,
  FLAG_OPTIONS,
  LAUNCH_WINDOW_OPTIONS,
  STATUS_OPTIONS,
  type FlagFilter,
  type LaunchWindow,
  type ProductFilters,
} from "@/lib/launch/filters";
import { LabelledSelect } from "./labelled-select";
import { SearchBox } from "./search-box";

export interface FilterChoices {
  categories: string[];
  ranges: string[];
  brands: string[];
  criticalPaths: string[];
}

interface ProductFiltersBarProps {
  filters: ProductFilters;
  choices: FilterChoices;
  onChange: (next: ProductFilters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function withAll(allLabel: string, values: string[]) {
  return [{ value: "all", label: allLabel }, ...values.map((value) => ({ value, label: value }))];
}

function hasMoreFiltersApplied(filters: ProductFilters): boolean {
  return (
    filters.category !== EMPTY_FILTERS.category ||
    filters.status !== EMPTY_FILTERS.status ||
    filters.window !== EMPTY_FILTERS.window ||
    filters.flag !== EMPTY_FILTERS.flag
  );
}

export function ProductFiltersBar({
  filters,
  choices,
  onChange,
  onClear,
  hasActiveFilters,
}: ProductFiltersBarProps) {
  const moreId = useId();
  const [moreOpen, setMoreOpen] = useState(() => hasMoreFiltersApplied(filters));

  return (
    <section aria-label="Filter products" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="sm:col-span-3 lg:col-span-1">
          <SearchBox value={filters.query} onChange={(query) => onChange({ ...filters, query })} />
        </div>
        <LabelledSelect
          label="Range"
          options={withAll("All ranges", choices.ranges)}
          value={filters.range}
          onChange={(range) => onChange({ ...filters, range })}
        />
        <LabelledSelect
          label="Brand"
          options={withAll("All brands", choices.brands)}
          value={filters.brand}
          onChange={(brand) => onChange({ ...filters, brand })}
        />
        <LabelledSelect
          label="Critical path"
          options={withAll("All critical paths", choices.criticalPaths)}
          value={filters.criticalPath}
          onChange={(criticalPath) => onChange({ ...filters, criticalPath })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={moreOpen}
          aria-controls={moreId}
          onClick={() => setMoreOpen((open) => !open)}
        >
          More filters
          <ChevronDown
            className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </Button>
        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all filters
          </Button>
        ) : null}
      </div>
      <div
        id={moreId}
        hidden={!moreOpen}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <LabelledSelect
          label="Category"
          options={withAll("All categories", choices.categories)}
          value={filters.category}
          onChange={(category) => onChange({ ...filters, category })}
        />
        <LabelledSelect
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(status) => onChange({ ...filters, status: status as ProductFilters["status"] })}
        />
        <LabelledSelect
          label="Launch date"
          options={LAUNCH_WINDOW_OPTIONS}
          value={filters.window}
          onChange={(window) => onChange({ ...filters, window: window as LaunchWindow })}
        />
        <LabelledSelect
          label="Flag"
          options={FLAG_OPTIONS}
          value={filters.flag}
          onChange={(flag) => onChange({ ...filters, flag: flag as FlagFilter })}
        />
      </div>
    </section>
  );
}
