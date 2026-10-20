import type { Role } from "@/lib/auth/types";
import type { NoteRole } from "./types";

export const MAX_NOTE_LENGTH = 500;

export const NOTE_ROLE_LABELS: Record<NoteRole, string> = {
  commercial: "Commercial / Range Planning",
  downstream: "Downstream team",
};

/** Simulated people, one per role. The prototype has no real user directory. */
export const NOTE_AUTHORS: Record<NoteRole, string> = {
  commercial: "Priya Shah",
  downstream: "Daniel Okafor",
};

/** Editors are the commercial team; viewers are the downstream teams who can read product fields only. */
export function noteRoleFor(role: Role): NoteRole {
  return role === "editor" ? "commercial" : "downstream";
}

export type NoteValidation = { ok: true; text: string } | { ok: false; reason: "empty" | "too-long" };

export function validateNote(raw: string): NoteValidation {
  const text = raw.trim();
  if (text.length === 0) return { ok: false, reason: "empty" };
  if (text.length > MAX_NOTE_LENGTH) return { ok: false, reason: "too-long" };
  return { ok: true, text };
}
