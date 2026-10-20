import type { Permission, Role, Session } from "./types";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  downstream: ["product:view", "note:add", "reminder:send", "demo:reset"],
  commercial: ["product:view", "note:add", "product:edit", "demo:reset"],
};

export const ROLE_LABELS: Record<Role, string> = {
  downstream: "Downstream team",
  commercial: "Commercial / Range Planning",
};

/** Fictional people for the simulated roles. The prototype has no user directory. */
export const ROLE_PEOPLE: Record<Role, { id: string; name: string; email: string }> = {
  downstream: { id: "demo-downstream", name: "Daniel Okafor", email: "daniel.okafor@example.com" },
  commercial: { id: "demo-commercial", name: "Priya Shah", email: "priya.shah@example.com" },
};

export function sessionForRole(role: Role): Session {
  return { user: { ...ROLE_PEOPLE[role], role } };
}

export function can(session: Session | null, permission: Permission): boolean {
  if (!session) return false;
  return ROLE_PERMISSIONS[session.user.role].includes(permission);
}
