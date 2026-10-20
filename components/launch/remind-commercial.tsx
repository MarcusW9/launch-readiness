"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@/lib/auth/session-context";
import { useNotifications } from "@/lib/launch/notifications";
import { assessProduct } from "@/lib/launch/readiness-model";
import { useLaunch } from "@/lib/launch/store";
import { pluralise } from "@/lib/launch/working-days";

/** Downstream can chase Commercial about every product still missing mandatory information. */
export function RemindCommercial() {
  const { can } = useSession();
  const { products } = useLaunch();
  const { notify } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!can("reminder:send")) return null;

  const incomplete = products
    .map((product) => assessProduct(product))
    .filter((assessment) => assessment.isPreparing && assessment.status === "Information Incomplete");
  const count = incomplete.length;

  const send = () => {
    notify({
      title: "Reminder sent to Commercial",
      body: `Asked Commercial / Range Planning to complete mandatory information on ${pluralise(count, "product")}. Simulated email, nothing was sent.`,
      toast: `Reminder sent about ${pluralise(count, "product")}.`,
    });
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" disabled={count === 0} onClick={() => setOpen(true)}>
        <BellRing aria-hidden />
        {`Remind Commercial (${count})`}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Remind Commercial?</DialogTitle>
          <DialogDescription>
            This sends one simulated email to Commercial / Range Planning listing {pluralise(count, "product")} with
            mandatory information missing.
          </DialogDescription>
          <ul className="m-0 max-h-60 list-disc overflow-auto pl-5 text-sm">
            {incomplete.map((assessment) => (
              <li key={assessment.product.id}>
                {assessment.product.name}: {assessment.completeness.summary}
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button onClick={send}>Send reminder</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
