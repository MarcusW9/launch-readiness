"use client";

import { useId, useState, type ReactNode } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  getInformationOverview,
  type InformationItem,
} from "@/lib/launch/information-overview";
import { useLaunch } from "@/lib/launch/store";
import type { Product } from "@/lib/launch/types";
import { InfoTip } from "./info-tip";
import { SectionHeading } from "./page-frame";

function AvailableItem({ item }: { item: InformationItem }) {
  return (
    <li className="flex list-none flex-col gap-1 border-b py-3 last:border-b-0">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
        <CircleCheck className="size-3.5" aria-hidden />
        {item.label}
      </span>
      <span>{item.value}</span>
      <span className="text-xs text-muted-foreground">
        {item.source === "existing" ? "Existing product data" : "Provided by the team"}
      </span>
    </li>
  );
}

function MissingItem({ productId, item }: { productId: string; item: InformationItem }) {
  const { provideInformation } = useLaunch();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const fieldId = useId();
  const canSubmit = text.trim().length > 0;

  return (
    <li className="list-none">
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-medium">{item.label}</h4>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
              <TriangleAlert className="size-3.5" aria-hidden />
              Missing
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Impact</p>
            {item.impacts.length === 0 ? (
              <p>Needed to complete the work already under way.</p>
            ) : (
              <ul className="m-0 list-none p-0">
                {item.impacts.map((impact) => (
                  <li key={impact.activityKey}>{impact.text}</li>
                ))}
              </ul>
            )}
          </div>
          {isOpen ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={fieldId} className="text-sm font-medium">
                  {item.prompt}
                </label>
                <Textarea id={fieldId} value={text} onChange={(event) => setText(event.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={!canSubmit}
                  onClick={() => {
                    provideInformation(productId, item.key, text.trim());
                    setText("");
                    setIsOpen(false);
                  }}
                >
                  Save information
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
                Provide {item.label.toLowerCase()}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </li>
  );
}

function NotRequiredItem({ item }: { item: InformationItem }) {
  return (
    <li className="flex list-none flex-col gap-0.5 py-2">
      <span className="text-muted-foreground">{item.label}</span>
      <span className="text-xs text-muted-foreground">
        Only used by {item.neededBy.join(", ")}, which does not apply to this product.
      </span>
    </li>
  );
}

function Group({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-medium">
        {title} ({count})
      </h3>
      {children}
    </div>
  );
}

export function InformationSection({ product }: { product: Product }) {
  const overview = getInformationOverview(product);
  const total = overview.available.length + overview.missing.length;

  return (
    <section id="information" aria-labelledby="information-heading" className="flex scroll-mt-4 flex-col gap-4">
      <div className="flex items-center gap-2">
        <SectionHeading id="information-heading">Information</SectionHeading>
        <InfoTip
          label="About this information"
          message="Only the information this product needs is shown. Existing product data is never asked for again. Team input is requested only where it is genuinely missing. All values are fictional."
        />
      </div>
      <p className="text-muted-foreground">
        {overview.missing.length === 0
          ? `All ${total} pieces of required information are available.`
          : `${overview.available.length} of ${total} pieces of required information are available. ${overview.missing.length} still need${overview.missing.length === 1 ? "s" : ""} someone to provide ${overview.missing.length === 1 ? "it" : "them"}.`}
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Group title="Available" count={overview.available.length}>
          {overview.available.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing is known yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {overview.available.map((item) => (
                <AvailableItem key={item.key} item={item} />
              ))}
            </ul>
          )}
        </Group>
        <Group title="Missing" count={overview.missing.length}>
          {overview.missing.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing is missing. No one needs to provide anything.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {overview.missing.map((item) => (
                <MissingItem key={item.key} productId={product.id} item={item} />
              ))}
            </ul>
          )}
        </Group>
      </div>

      {overview.notRequired.length > 0 ? (
        <Group title="Not required for this product" count={overview.notRequired.length}>
          <ul className="m-0 flex list-none flex-col p-0">
            {overview.notRequired.map((item) => (
              <NotRequiredItem key={item.key} item={item} />
            ))}
          </ul>
        </Group>
      ) : null}
    </section>
  );
}
