"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMPTY_FILTERS } from "@/lib/launch/filters";
import { summariseCriticalPath } from "@/lib/launch/critical-path";
import {
  buildStudioCsv,
  EMPTY_STUDIO_FILTERS,
  filterStudioProducts,
  getStudioCriticalPath,
  getStudioOptions,
  studioCsvFileName,
  type StudioFilters,
} from "@/lib/launch/studio";
import type { Product } from "@/lib/launch/types";
import { CriticalPathSummaryStrip } from "./critical-path-summary";
import { StatusAlert } from "./status-alert";
import { StudioFiltersBar } from "./studio-filters";
import { StudioTable } from "./studio-table";

function downloadCsv(fileName: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function countLabel(count: number): string {
  return `${count} ${count === 1 ? "product" : "products"}`;
}

interface StudioViewProps {
  products: Product[];
  filters: StudioFilters;
  onFiltersChange: (next: StudioFilters) => void;
  groupByStyle: boolean;
  onGroupByStyleChange: (next: boolean) => void;
}

export function StudioView({
  products,
  filters,
  onFiltersChange,
  groupByStyle,
  onGroupByStyleChange,
}: StudioViewProps) {
  const [exported, setExported] = useState<string>();
  const options = useMemo(() => getStudioOptions(products), [products]);
  const visible = useMemo(() => filterStudioProducts(products, filters), [products, filters]);
  const activeTotal = useMemo(
    () => filterStudioProducts(products, EMPTY_STUDIO_FILTERS).length,
    [products],
  );
  const selectedPath = useMemo(() => getStudioCriticalPath(products, filters), [products, filters]);
  const summary = useMemo(
    () => summariseCriticalPath(products, { ...EMPTY_FILTERS, query: filters.query, criticalPath: filters.criticalPath }),
    [products, filters.query, filters.criticalPath],
  );

  function exportCsv() {
    const fileName = studioCsvFileName(selectedPath);
    downloadCsv(fileName, buildStudioCsv(visible));
    setExported(`Exported ${countLabel(visible.length)} to ${fileName}`);
  }

  return (
    <>
      <StudioFiltersBar
        filters={filters}
        options={options}
        onChange={onFiltersChange}
        onClear={() => onFiltersChange(EMPTY_STUDIO_FILTERS)}
      />
      {summary ? <CriticalPathSummaryStrip summary={summary} showCounts={false} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {visible.length} of {activeTotal} active products
        </p>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={groupByStyle}
                onChange={(event) => onGroupByStyleChange(event.target.checked)}
              />
              Group by style
            </label>
            <Button variant="outline" onClick={exportCsv} disabled={visible.length === 0}>
              <Download aria-hidden />
              Export to CSV ({countLabel(visible.length)})
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Prototype: exports synthetic demo data only</p>
          <p className="sr-only" role="status">
            {exported}
          </p>
        </div>
      </div>
      {visible.length > 0 ? (
        <StudioTable products={visible} grouped={groupByStyle} caption="Active products with studio details" />
      ) : (
        <StatusAlert tone="info" title="No products match these filters">
          Try a different search or clear the filters.
        </StatusAlert>
      )}
    </>
  );
}
