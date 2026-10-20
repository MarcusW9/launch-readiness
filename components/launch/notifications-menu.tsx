"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { formatTimestamp } from "@/lib/launch/readiness";
import { useNotifications } from "@/lib/launch/notifications";

export function NotificationsMenu() {
  const { notifications } = useNotifications();
  const count = notifications.length;
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={count > 0 ? `Notifications (${count})` : "Notifications"}
            className="relative"
          />
        }
      >
        <Bell aria-hidden />
        {count > 0 ? (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-background"
          >
            {count}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverTitle>Notifications</PopoverTitle>
        {count === 0 ? (
          <p className="text-muted-foreground">Nothing yet. Sent summaries and reminders appear here.</p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex flex-col gap-0.5 border-b pb-3 last:border-b-0 last:pb-0">
                <p className="font-medium">{notification.title}</p>
                <p className="leading-relaxed text-muted-foreground">{notification.body}</p>
                <p className="text-xs text-muted-foreground">{formatTimestamp(notification.at)}</p>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
