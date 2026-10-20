"use client";

import { useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_FILTERS,
  PRODUCT_TABS,
  countByTab,
  filterProducts,
  getBrands,
  getCategories,
  getCriticalPaths,
  getRanges,
  readinessOptionsFor,
  tabForReadiness,
  type ProductFilters,
  type ProductTab,
} from "@/lib/launch/filters";
import { summariseCriticalPath } from "@/lib/launch/critical-path";
import { compareByUrgency } from "@/lib/launch/readiness";
import { useLaunch } from "@/lib/launch/store";
import { CriticalPathSummaryStrip } from "./critical-path-summary";
import { Page, PageHeading } from "./page-frame";
import { ProductFiltersBar } from "./product-filters";
import { ProductTabs } from "./product-tabs";
import { ProductsTable } from "./products-table";
import { StatusAlert } from "./status-alert";
import { EMPTY_STUDIO_FILTERS, type StudioFilters } from "@/lib/launch/studio";
import { StudioView } from "./studio-view";
import { ProductsViewSwitch, type ProductsViewMode } from "./view-switch";
import { WeeklySummaryDialog } from "./weekly-summary-dialog";

function startingFilters(initialFilters?: Partial<ProductFilters>): ProductFilters {
  const filters = { ...EMPTY_FILTERS, ...initialFilters };
  const tab = initialFilters?.tab ?? tabForReadiness(filters.readiness) ?? "active";
  return { ...filters, tab };
}

function hasNarrowingFilters(filters: ProductFilters): boolean {
  return JSON.stringify({ ...filters, tab: "all" }) !== JSON.stringify(EMPTY_FILTERS);
}

export function ProductsView({ initialFilters }: { initialFilters?: Partial<ProductFilters> }) {
  const { products } = useLaunch();
  const [filters, setFilters] = useState<ProductFilters>(() => startingFilters(initialFilters));
  const [view, setView] = useState<ProductsViewMode>("exceptions");
  const [studioFilters, setStudioFilters] = useState<StudioFilters>(EMPTY_STUDIO_FILTERS);
  const [groupByStyle, setGroupByStyle] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const tab = filters.tab === "all" ? "active" : filters.tab;

  const choices = useMemo(
    () => ({
      categories: getCategories(products),
      ranges: getRanges(products),
      brands: getBrands(products),
      criticalPaths: getCriticalPaths(products),
    }),
    [products],
  );
  const visible = useMemo(
    () => filterProducts(products, filters).sort(compareByUrgency),
    [products, filters],
  );
  const criticalPathSummary = useMemo(() => summariseCriticalPath(products, filters), [products, filters]);
  const tabCounts = useMemo(() => countByTab(products, filters), [products, filters]);
  const tabTotal = useMemo(() => countByTab(products, EMPTY_FILTERS)[tab], [products, tab]);
  const tabLabel = PRODUCT_TABS.find((option) => option.value === tab)?.label.toLowerCase();

  function changeTab(next: ProductTab) {
    const statusStillValid = readinessOptionsFor(next).some((option) => option.value === filters.readiness);
    setFilters({ ...filters, tab: next, readiness: statusStillValid ? filters.readiness : "all" });
  }

  return (
    <Page>
      <PageHeading
        title="Products"
        description="Every product approaching launch, most urgent first. Search or filter to find what you need."
      />
      <ProductsViewSwitch value={view} onChange={setView} />
      {view === "studio" ? (
        <StudioView
          products={products}
          filters={studioFilters}
          onFiltersChange={setStudioFilters}
          groupByStyle={groupByStyle}
          onGroupByStyleChange={setGroupByStyle}
        />
      ) : (
        <>
          <ProductFiltersBar
            filters={filters}
            choices={choices}
            onChange={setFilters}
            onClear={() => setFilters({ ...EMPTY_FILTERS, tab })}
            hasActiveFilters={hasNarrowingFilters(filters)}
          />
          {criticalPathSummary ? <CriticalPathSummaryStrip summary={criticalPathSummary} /> : null}
          <ProductTabs value={tab} counts={tabCounts} onChange={changeTab} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Showing {visible.length} of {tabTotal} {tabLabel} products
            </p>
            <Button variant="outline" size="sm" onClick={() => setSummaryOpen(true)}>
              <Mail aria-hidden />
              Preview weekly summary
            </Button>
          </div>
          {summaryOpen ? (
            <WeeklySummaryDialog open onOpenChange={setSummaryOpen} products={products} filters={filters} />
          ) : null}
          {visible.length > 0 ? (
            <ProductsTable products={visible} caption="Products approaching launch" />
          ) : (
            <StatusAlert tone="info" title="No products match these filters">
              Try a different search or clear the filters.
            </StatusAlert>
          )}
        </>
      )}
    </Page>
  );
}
