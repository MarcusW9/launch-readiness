"use client";

import { useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { describeIssue, formatTimestamp, summariseReadiness } from "@/lib/launch/readiness";
import { useLaunch } from "@/lib/launch/store";
import type { ActivityKey, ActivityState, Product } from "@/lib/launch/types";
import { LinkButton } from "./link-button";
import { LaunchStatusPill } from "./status";

export function ReadinessImpactCard({ product, activityKey }: { product: Product; activityKey: ActivityKey }) {
  const summary = summariseReadiness(product);
  const others = summary.outstanding.filter((activity) => activity.def.key !== activityKey);

  return (
    <Card role="region" aria-labelledby="impact-heading">
      <CardHeader>
        <CardTitle id="impact-heading">Product readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <LaunchStatusPill status={summary.launchStatus} />
        </div>
        {!summary.isPreparing ? (
          <p>This product is {summary.launchStatus}. No preparation work is outstanding.</p>
        ) : summary.outstanding.length === 0 ? (
          <p>All required activities are complete.</p>
        ) : others.length === 0 ? (
          <p>This is the only activity left. Completing it makes the product Ready.</p>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground">Also outstanding:</p>
            <ul className="m-0 list-none p-0">
              {others.map((activity) => (
                <li key={activity.def.key}>{describeIssue(activity)}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <LinkButton href={`/products/${product.id}`} variant="outline">
            Return to product
            <ChevronRight aria-hidden />
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotesCard({
  product,
  activityKey,
  state,
}: {
  product: Product;
  activityKey: ActivityKey;
  state: ActivityState;
}) {
  const { addNote } = useLaunch();
  const [text, setText] = useState("");
  const fieldId = useId();

  return (
    <Card role="region" aria-labelledby="notes-heading">
      <CardHeader>
        <CardTitle id="notes-heading" className="text-lg">
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId} className="text-sm font-medium">
            Add a note
          </label>
          <Textarea id={fieldId} value={text} onChange={(event) => setText(event.target.value)} />
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            disabled={text.trim().length === 0}
            onClick={() => {
              addNote(product.id, activityKey, text.trim());
              setText("");
            }}
          >
            Add note
          </Button>
        </div>
        {state.notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {state.notes.map((note) => (
              <li key={note.id} className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  {note.author} · {formatTimestamp(note.at)}
                </span>
                <p>{note.text}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function HistoryCard({ state }: { state: ActivityState }) {
  return (
    <Card role="region" aria-labelledby="history-heading">
      <CardHeader>
        <CardTitle id="history-heading" className="text-lg">
          Activity history
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {state.history.map((entry) => (
            <li key={entry.id}>
              <span className="text-xs text-muted-foreground">{formatTimestamp(entry.at)}</span>
              <p>{entry.text}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
