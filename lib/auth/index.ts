import { createMockAuthProvider } from "./mock-provider";
import type { AuthProvider, Session } from "./types";

export { can } from "./permissions";
export type { AuthProvider, Permission, Role, Session, User } from "./types";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "UnauthenticatedError";
  }
}

/** Builds the session helpers around any provider, so tests can supply a signed-out visitor. */
export function createAuth(provider: AuthProvider) {
  async function getSession(): Promise<Session | null> {
    return provider.getSession();
  }

  async function requireSession(): Promise<Session> {
    const session = await getSession();
    if (!session) throw new UnauthenticatedError();
    return session;
  }

  return { getSession, requireSession };
}

/** The identity system the app uses. Swap this one binding to change it. */
export const authProvider: AuthProvider = createMockAuthProvider();

const auth = createAuth(authProvider);

/** Server-side. The current session, or null when nobody is signed in. */
export const getSession = auth.getSession;

/** Server-side. Use in routes and actions that must not run anonymously. */
export const requireSession = auth.requireSession;
