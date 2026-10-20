import type { AuthProvider, Session } from "./types";

export const DEMO_SESSION: Session = {
  user: {
    id: "demo-user",
    name: "Demo user",
    email: "demo.user@example.com",
    role: "editor",
  },
};

/** Always returns the same fictional user. There is no sign-in and no credentials. */
export function createMockAuthProvider(session: Session | null = DEMO_SESSION): AuthProvider {
  return { getSession: async () => session };
}
