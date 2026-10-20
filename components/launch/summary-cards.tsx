"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { assessProduct, STATUS_CARD_LABEL, type ModelStatus } from "@/lib/launch/readiness-model";
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
  const preparing = products.map((product) => assessProduct(product)).filter((assessment) => assessment.isPreparing);
  const counts: Record<ModelStatus, number> = { "Expectation At Risk": 0, "Information Incomplete": 0, "On Track": 0 };
  for (const assessment of preparing) counts[assessment.status] += 1;

  const items: SummaryItem[] = [
    {
      label: "Total Products",
      value: preparing.length,
      helper: "Being prepared for launch",
      href: "/products",
      dotClass: "bg-muted-foreground",
    },
    {
      label: STATUS_CARD_LABEL["Expectation At Risk"],
      value: counts["Expectation At Risk"],
      helper: "Projected to be ready after the launch date",
      href: "/products?status=Expectation%20At%20Risk",
      dotClass: "bg-danger",
    },
    {
      label: STATUS_CARD_LABEL["Information Incomplete"],
      value: counts["Information Incomplete"],
      helper: "Mandatory information still missing",
      href: "/products?status=Information%20Incomplete",
      dotClass: "bg-warning",
    },
    {
      label: STATUS_CARD_LABEL["On Track"],
      value: counts["On Track"],
      helper: "Projected to be ready in time",
      href: "/products?status=On%20Track",
      dotClass: "bg-success",
    },
  ];

  return (
    <section aria-label="Launch readiness summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
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
