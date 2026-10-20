"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { demoNow } from "./store";

export interface AppNotification {
  id: string;
  at: string;
  title: string;
  body: string;
}

export interface Toast {
  id: string;
  message: string;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  toasts: Toast[];
  /** Adds a notification (newest first) and shows a toast. Nothing leaves the browser. */
  notify: (notification: { title: string; body: string; toast?: string }) => void;
  dismissToast: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

let sequence = 0;

/** In-memory prototype notifications. They reset on refresh and with "Reset demo data". */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback<NotificationsContextValue["notify"]>(({ title, body, toast }) => {
    const id = `notification-${++sequence}`;
    setNotifications((current) => [{ id, at: demoNow(), title, body }, ...current]);
    setToasts((current) => [...current, { id, message: toast ?? title }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({ notifications, toasts, notify, dismissToast, clearNotifications }),
    [notifications, toasts, notify, dismissToast, clearNotifications],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationsProvider");
  return context;
}
