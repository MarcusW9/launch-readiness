"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth/session-context";
import { useNotifications } from "@/lib/launch/notifications";
import { formatLongDate } from "@/lib/launch/readiness";
import { useLaunch } from "@/lib/launch/store";
import type { Product } from "@/lib/launch/types";

/** Commercial can move the Proposed Launch Date. Downstream is told by a simulated email. */
export function LaunchDateEditor({ product }: { product: Product }) {
  const { can } = useSession();
  const { changeLaunchDate } = useLaunch();
  const { notify } = useNotifications();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(product.launchDate);

  const label = `Proposed launch: ${formatLongDate(product.launchDate)}`;
  if (!can("product:edit") || product.lifecycle) return <p className="text-muted-foreground">{label}</p>;

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-muted-foreground">{label}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDraft(product.launchDate);
            setEditing(true);
          }}
        >
          <CalendarClock aria-hidden />
          Change launch date
        </Button>
      </div>
    );
  }

  const save = () => {
    if (draft && draft !== product.launchDate) {
      changeLaunchDate(product.id, draft);
      notify({
        title: `Launch date changed: ${product.name}`,
        body: `Moved from ${formatLongDate(product.launchDate)} to ${formatLongDate(draft)}. Simulated email sent to the Downstream team.`,
        toast: "Launch date updated. The Downstream team has been told.",
      });
    }
    setEditing(false);
  };

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <label htmlFor="launch-date-input" className="text-sm text-muted-foreground">
        Proposed launch date
      </label>
      <Input
        id="launch-date-input"
        type="date"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="w-auto"
      />
      <Button type="submit" size="sm">
        Save date
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </form>
  );
}
