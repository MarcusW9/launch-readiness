"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth/session-context";
import type { FieldAssessment } from "@/lib/launch/completeness";
import { isFieldEditable } from "@/lib/launch/edit-product";
import { FIELD_GROUPS, type FieldKey } from "@/lib/launch/readiness-config";
import type { ModelAssessment } from "@/lib/launch/readiness-model";
import { useLaunch } from "@/lib/launch/store";
import { Pill } from "./status";

function FieldRow({ productId, field }: { productId: string; field: FieldAssessment }) {
  const { can } = useSession();
  const { editField } = useLaunch();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const { definition, value, missing, dataError } = field;
  const editable = can("product:edit") && isFieldEditable(definition.key as FieldKey);
  const inputId = `field-${definition.key}`;

  const save = () => {
    editField(productId, definition.key as FieldKey, draft);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground sm:w-56 sm:shrink-0">
        <label htmlFor={editing ? inputId : undefined}>{definition.label}</label>
        {definition.mandatory ? <span className="text-xs">(mandatory)</span> : null}
      </dt>
      <dd className="m-0 flex flex-1 flex-wrap items-center justify-between gap-2 text-sm">
        {editing ? (
          <form
            className="flex flex-1 flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Input
              id={inputId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="max-w-xs"
              autoFocus
            />
            <Button type="submit" size="sm">
              Save<span className="sr-only"> {definition.label}</span>
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <span className="flex flex-wrap items-center gap-2">
              {missing ? (
                <Pill tone={dataError ? "danger" : "warning"}>
                  {dataError ? `Data error (${value?.trim()})` : "Missing"}
                </Pill>
              ) : (
                <span>{value}</span>
              )}
              {!missing && dataError ? <Pill tone="danger">Data error</Pill> : null}
            </span>
            {editable ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft(missing ? "" : (value ?? ""));
                  setEditing(true);
                }}
              >
                <Pencil aria-hidden />
                Edit<span className="sr-only"> {definition.label}</span>
              </Button>
            ) : null}
          </>
        )}
      </dd>
    </div>
  );
}

function GroupSection({
  productId,
  label,
  fields,
}: {
  productId: string;
  label: string;
  fields: FieldAssessment[];
}) {
  const missingMandatory = fields.filter((field) => field.definition.mandatory && field.missing).length;
  const [open, setOpen] = useState(missingMandatory > 0);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="rounded-lg border bg-card px-4 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-2 py-3 font-medium">
        <span>
          {label} <span className="font-normal text-muted-foreground">({fields.length} fields)</span>
        </span>
        {missingMandatory > 0 ? (
          <Pill tone="warning">{missingMandatory} mandatory missing</Pill>
        ) : (
          <Pill tone="success">Complete</Pill>
        )}
      </summary>
      <dl className="m-0 border-t">
        {fields.map((field) => (
          <FieldRow key={field.definition.key} productId={productId} field={field} />
        ))}
      </dl>
    </details>
  );
}

export function ProductInformation({ assessment }: { assessment: ModelAssessment }) {
  const { can } = useSession();
  const { completeness, product } = assessment;
  const mandatoryDone = completeness.mandatoryCount - completeness.missingMandatory.length;

  return (
    <Card role="region" aria-labelledby="information-heading" id="information">
      <CardHeader>
        <CardTitle id="information-heading" className="text-xl">
          Product information
        </CardTitle>
        <CardDescription>
          {mandatoryDone} of {completeness.mandatoryCount} mandatory fields complete.{" "}
          {can("product:edit")
            ? "As Commercial you can edit any field except the Cat No."
            : "Only Commercial can edit these fields."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {FIELD_GROUPS.map((group) => (
          <GroupSection
            key={group.key}
            productId={product.id}
            label={group.label}
            fields={completeness.fields.filter((field) => field.definition.group === group.key)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
