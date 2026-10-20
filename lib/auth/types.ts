/** Downstream team is read-only. Commercial / Range Planning can edit fields and the Proposed Launch Date. */
export type Role = "downstream" | "commercial";

export type Permission = "product:view" | "note:add" | "product:edit" | "reminder:send" | "demo:reset";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Session {
  user: User;
}

/**
 * What the app needs from an identity system. A real implementation (for
 * example the company SSO) must be agreed with Engineering and InfoSec and
 * then selected in `lib/auth/index.ts`. Nothing else in the app should change.
 */
export interface AuthProvider {
  getSession(): Promise<Session | null>;
}
