"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth/session-context";
import {
  MAX_NOTE_LENGTH,
  NOTE_AUTHORS,
  NOTE_ROLE_LABELS,
  noteRoleFor,
  validateNote,
} from "@/lib/launch/product-notes";
import { formatTimestamp } from "@/lib/launch/readiness";
import { useLaunch } from "@/lib/launch/store";
import type { Product } from "@/lib/launch/types";

export function ProductNotes({ product }: { product: Product }) {
  const { addProductNote } = useLaunch();
  const { session, can } = useSession();
  const [text, setText] = useState("");
  const fieldId = useId();
  const countId = useId();

  const notes = product.notes ?? [];
  const checked = validateNote(text);

  function submit() {
    if (!session || !checked.ok) return;
    const role = noteRoleFor(session.user.role);
    addProductNote(product.id, { text: checked.text, author: NOTE_AUTHORS[role], role });
    setText("");
  }

  return (
    <Card role="region" aria-labelledby="product-notes-heading">
      <CardHeader>
        <h2 id="product-notes-heading" className="m-0 text-lg font-medium">
          Notes ({notes.length})
        </h2>
        <p className="text-sm text-muted-foreground">Notes are a permanent log and can&apos;t be edited</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {can("note:add") ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={fieldId} className="text-sm font-medium">
              Add a note
            </label>
            <Textarea
              id={fieldId}
              value={text}
              maxLength={MAX_NOTE_LENGTH}
              aria-describedby={countId}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" size="sm" disabled={!checked.ok} onClick={submit}>
                Add note
              </Button>
              <span id={countId} className="text-xs text-muted-foreground">
                {text.length} / {MAX_NOTE_LENGTH}
              </span>
            </div>
          </div>
        ) : null}

        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {notes.map((note) => (
              <li key={note.id} className="flex flex-col gap-1 border-t pt-4 first:border-t-0 first:pt-0">
                <p className="m-0 whitespace-pre-wrap">{note.text}</p>
                <span className="text-xs text-muted-foreground">
                  {note.author} · {NOTE_ROLE_LABELS[note.role]} · {formatTimestamp(note.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
