import type { Permission, Role, Session } from "./types";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  viewer: ["product:view", "note:add"],
  editor: ["product:view", "note:add", "activity:update", "demo:reset"],
};

export function can(session: Session | null, permission: Permission): boolean {
  if (!session) return false;
  return ROLE_PERMISSIONS[session.user.role].includes(permission);
}
