"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { summariseReadiness } from "@/lib/launch/readiness";
import { useLaunch } from "@/lib/launch/store";

interface SummaryItem {
  label: string;
  value: number;
  helper: string;
  href: string;
  dotClass: string;
}

export function SummaryCards() {
  const { products } = useLaunch();
  const preparing = products.filter((product) => summariseReadiness(product).isPreparing);
  const counts = preparing.reduce(
    (acc, product) => {
      acc[summariseReadiness(product).readiness] += 1;
      return acc;
    },
    { Ready: 0, "Action Required": 0, "At Risk": 0 },
  );

  const items: SummaryItem[] = [
    {
      label: "Total Products",
      value: preparing.length,
      helper: "Being prepared for launch",
      href: "/products",
      dotClass: "bg-muted-foreground",
    },
    {
      label: "Ready",
      value: counts.Ready,
      helper: "All required activities complete",
      href: "/products?readiness=Ready",
      dotClass: "bg-success",
    },
    {
      label: "Action Required",
      value: counts["Action Required"],
      helper: "Activities outstanding",
      href: "/products?readiness=Action%20Required",
      dotClass: "bg-warning",
    },
    {
      label: "At Risk",
      value: counts["At Risk"],
      helper: "Outstanding and launching within 10 days",
      href: "/products?readiness=At%20Risk",
      dotClass: "bg-danger",
    },
  ];

  return (
    <section aria-label="Launch readiness summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span aria-hidden className={`size-2 rounded-full ${item.dotClass}`} />
                {item.label}
              </span>
              <p className="text-4xl font-semibold tracking-tight tabular-nums">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.helper}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}
