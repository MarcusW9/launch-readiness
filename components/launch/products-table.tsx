"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatShortDate } from "@/lib/launch/readiness";
import { assessProduct, describeLaunchIn } from "@/lib/launch/readiness-model";
import { NOT_ASSIGNED } from "@/lib/launch/filters";
import { slaProjectionDate } from "@/lib/launch/sla";
import type { Product } from "@/lib/launch/types";
import { DateChangedFlag, StatusBadge, StockAfterLaunchFlag } from "./status";

// Some embedded previews drop client-side (RSC) navigations. If the soft navigation has not
// landed shortly after a click, fall back to a normal page load, which always works.
function scheduleHardNavigationFallback(href: string) {
  window.setTimeout(() => {
    if (window.location.pathname !== href) window.location.assign(href);
  }, 1200);
}

export function ProductsTable({ products, caption }: { products: Product[]; caption: string }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table className="[&_td]:px-1 [&_th]:px-1 [&_td:first-child]:pl-3 [&_th:first-child]:pl-3 [&_td:last-child]:pr-3 [&_th:last-child]:pr-3">
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Range</TableHead>
            <TableHead>Critical path</TableHead>
            <TableHead className="whitespace-nowrap">Proposed launch</TableHead>
            <TableHead className="whitespace-nowrap">SLA projection</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const assessment = assessProduct(product);
            const projection = slaProjectionDate(product);
            const href = `/products/${product.id}`;
            return (
              <TableRow
                key={product.id}
                className="cursor-pointer"
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("a")) return;
                  router.push(href);
                  scheduleHardNavigationFallback(href);
                }}
              >
                <TableCell className="max-w-56 align-middle whitespace-normal">
                  <Link
                    href={href}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      scheduleHardNavigationFallback(href);
                    }}
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {product.id} · {product.brand}
                  </p>
                </TableCell>
                <TableCell className="max-w-32 align-middle whitespace-normal">{product.range ?? NOT_ASSIGNED}</TableCell>
                <TableCell className="align-middle whitespace-nowrap">{product.criticalPath ?? NOT_ASSIGNED}</TableCell>
                <TableCell className="align-middle">
                  <span className="whitespace-nowrap">{formatShortDate(product.launchDate)}</span>
                  {assessment.isPreparing ? (
                    <p className="text-xs text-muted-foreground">{describeLaunchIn(assessment.launchInWorkingDays)}</p>
                  ) : null}
                </TableCell>
                <TableCell className="align-middle whitespace-nowrap">
                  {assessment.isPreparing && projection ? (
                    formatShortDate(projection)
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {assessment.isPreparing ? "Not started" : "Not applicable"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="align-middle whitespace-nowrap">
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge assessment={assessment} />
                    {assessment.isPreparing && assessment.status === "Information Incomplete" ? (
                      <span className="text-xs text-muted-foreground">{assessment.completeness.summary}</span>
                    ) : null}
                    {assessment.isPreparing && assessment.flags.dateChanged ? <DateChangedFlag /> : null}
                    {assessment.isPreparing && assessment.flags.stockAfterLaunch ? <StockAfterLaunchFlag /> : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
