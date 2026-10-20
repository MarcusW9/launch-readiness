"use client";

import { createContext, useContext, type ReactNode } from "react";
import { can } from "./permissions";
import type { Permission, Session } from "./types";

const SessionContext = createContext<{ session: Session | null } | null>(null);

/** The server resolves the session once per request and hands it to client components here. */
export function SessionProvider({ session, children }: { session: Session | null; children: ReactNode }) {
  return <SessionContext.Provider value={{ session }}>{children}</SessionContext.Provider>;
}

export function useSession(): { session: Session | null; can: (permission: Permission) => boolean } {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  const { session } = context;
  return { session, can: (permission) => can(session, permission) };
}
