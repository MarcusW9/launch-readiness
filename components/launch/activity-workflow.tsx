"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStageIndex, type ResolvedActivity } from "@/lib/launch/activities";
import { INFORMATION_DEFINITIONS } from "@/lib/launch/information";
import { useLaunch } from "@/lib/launch/store";
import type { Product } from "@/lib/launch/types";
import { LabelledSelect } from "./labelled-select";
import { StatusAlert } from "./status-alert";
import { Steps, type StepStatus } from "./steps";

const BLOCK_REASONS = [
  { value: "", label: "Choose a reason" },
  { value: "Waiting on supplier", label: "Waiting on supplier" },
  { value: "Waiting on samples", label: "Waiting on samples" },
  { value: "Waiting on another team", label: "Waiting on another team" },
  { value: "Information missing", label: "Information missing" },
];

interface ActivityWorkflowProps {
  product: Product;
  activity: ResolvedActivity;
}

export function ActivityWorkflow({ product, activity }: ActivityWorkflowProps) {
  const { setStage, setBlocked } = useLaunch();
  const [blockReason, setBlockReason] = useState("");

  const { def, state } = activity;
  if (!state) return null;

  const stages = def.workflow;
  const index = getStageIndex(def, state);
  const current = stages[index];
  const next = stages[index + 1];
  const previous = stages[index - 1];
  const isComplete = current.status === "Complete";

  const steps = stages.map((stage, i) => ({
    label: stage.label,
    status: (isComplete || i < index ? "complete" : i === index ? "active" : "incomplete") as StepStatus,
  }));

  const advanceLabel = next ? (next.status === "Complete" ? "Mark complete" : `Mark as ${next.label}`) : undefined;

  const missingStartInfo = index === 0 ? activity.information.blockingStart : [];
  const cannotAdvance = missingStartInfo.length > 0;
  const missingStartLabels = missingStartInfo.map((key) => INFORMATION_DEFINITIONS[key].label.toLowerCase());

  return (
    <Card role="region" aria-labelledby="workflow-heading">
      <CardHeader>
        <CardTitle id="workflow-heading" className="text-lg">
          Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Steps steps={steps} />

        {state.blocked && state.blockedReason ? (
          <StatusAlert tone="error" title="Blocked">
            {state.blockedReason}
          </StatusAlert>
        ) : null}

        {cannotAdvance ? (
          <StatusAlert tone="warning" title={`Cannot ${def.startVerb} yet`}>
            Missing {missingStartLabels.join(", ")}. Provide it on the product page before moving this forward.{" "}
            <Link href={`/products/${product.id}#information-heading`} className="underline underline-offset-4">
              Provide information
            </Link>
          </StatusAlert>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {advanceLabel && next ? (
            <Button disabled={cannotAdvance} onClick={() => setStage(product.id, def.key, next.id)}>
              {advanceLabel}
            </Button>
          ) : null}
          {previous ? (
            <Button variant="outline" onClick={() => setStage(product.id, def.key, previous.id)}>
              {isComplete ? `Reopen (back to ${previous.label})` : `Move back to ${previous.label}`}
            </Button>
          ) : null}
        </div>

        {!isComplete ? (
          <div className="flex flex-col gap-2">
            {state.blocked ? (
              <div>
                <Button variant="outline" onClick={() => setBlocked(product.id, def.key, null)}>
                  Clear blocker
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-full sm:w-64">
                  <LabelledSelect
                    label="Flag as blocked"
                    options={BLOCK_REASONS}
                    value={blockReason}
                    onChange={setBlockReason}
                  />
                </div>
                <Button
                  variant="outline"
                  disabled={!blockReason}
                  onClick={() => {
                    setBlocked(product.id, def.key, blockReason);
                    setBlockReason("");
                  }}
                >
                  Flag as blocked
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Status is a controlled list. Use notes for anything that needs free text.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
