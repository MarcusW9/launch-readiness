"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resolveActivity, resolveImagery } from "@/lib/launch/activities";
import { getMissingInformation } from "@/lib/launch/information-overview";
import {
  describeDaysToLaunch,
  formatShortDate,
  summariseReadiness,
} from "@/lib/launch/readiness";
import type { Product } from "@/lib/launch/types";
import { ActivityStatusText, LaunchStatusPill } from "./status";

// Some embedded previews drop client-side (RSC) navigations. If the soft navigation has not
// landed shortly after a click, fall back to a normal page load, which always works.
function scheduleHardNavigationFallback(href: string) {
  window.setTimeout(() => {
    if (window.location.pathname !== href) window.location.assign(href);
  }, 1200);
}

function missingCount(product: Product): number {
  return getMissingInformation(product).length;
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
            <TableHead>Category</TableHead>
            <TableHead className="whitespace-nowrap">Launch date</TableHead>
            <TableHead>Imagery</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead>Compliance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const summary = summariseReadiness(product);
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
                <TableCell className="max-w-48 align-middle whitespace-normal">
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
                  <p className="text-xs text-muted-foreground">ID {product.id}</p>
                </TableCell>
                <TableCell className="max-w-24 align-middle whitespace-normal">{product.category}</TableCell>
                <TableCell className="align-middle">
                  <span className="whitespace-nowrap">{formatShortDate(product.launchDate)}</span>
                  <p className="text-xs text-muted-foreground">{describeDaysToLaunch(summary.daysToLaunch)}</p>
                </TableCell>
                {[
                  resolveImagery(product),
                  resolveActivity(product, "product-content"),
                  resolveActivity(product, "variants"),
                  resolveActivity(product, "compliance"),
                ].map((activity) => (
                  <TableCell key={activity.def.key} className="align-middle whitespace-nowrap">
                    {summary.isPreparing ? (
                      <ActivityStatusText status={activity.status} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Not applicable</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="align-middle whitespace-nowrap">
                  <div className="flex flex-col items-start gap-1">
                    <LaunchStatusPill status={summary.launchStatus} />
                    {missingCount(product) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <TriangleAlert className="size-3.5" aria-hidden />
                        {missingCount(product)} information missing
                      </span>
                    ) : null}
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
