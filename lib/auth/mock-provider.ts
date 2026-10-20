import { sessionForRole } from "./permissions";
import type { AuthProvider, Session } from "./types";

/** The Downstream team is the default view: read-only. */
export const DEMO_SESSION: Session = sessionForRole("downstream");

/** Always returns the same fictional user. There is no sign-in and no credentials. */
export function createMockAuthProvider(session: Session | null = DEMO_SESSION): AuthProvider {
  return { getSession: async () => session };
}
