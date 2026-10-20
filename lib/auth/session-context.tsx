"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { can, sessionForRole } from "./permissions";
import type { Permission, Role, Session } from "./types";

interface SessionContextValue {
  session: Session | null;
  switchRole: (role: Role) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * The server resolves the session once per request and hands it to client components here.
 * The prototype lets the viewer switch between the two simulated roles; the switch lives in
 * memory only and returns to the server's session on refresh.
 */
export function SessionProvider({ session: initial, children }: { session: Session | null; children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(initial);
  const switchRole = useCallback((role: Role) => setSession(sessionForRole(role)), []);
  const value = useMemo(() => ({ session, switchRole }), [session, switchRole]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): {
  session: Session | null;
  role: Role | undefined;
  switchRole: (role: Role) => void;
  can: (permission: Permission) => boolean;
} {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  const { session, switchRole } = context;
  return { session, role: session?.user.role, switchRole, can: (permission) => can(session, permission) };
}
