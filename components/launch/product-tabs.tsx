"use client";

import { Tabs } from "@base-ui/react/tabs";
import { PRODUCT_TABS, type ProductTab } from "@/lib/launch/filters";

interface ProductTabsProps {
  value: ProductTab;
  counts: Record<ProductTab, number>;
  onChange: (tab: ProductTab) => void;
}

export function ProductTabs({ value, counts, onChange }: ProductTabsProps) {
  return (
    <Tabs.Root value={value} onValueChange={(next) => onChange(next as ProductTab)}>
      <Tabs.List
        aria-label="Product lifecycle"
        className="relative flex gap-6 border-b"
      >
        {PRODUCT_TABS.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className="-mb-px cursor-pointer border-b-2 border-transparent px-1 pb-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[active]:border-primary data-[active]:text-primary"
          >
            {tab.label} ({counts[tab.value]})
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
