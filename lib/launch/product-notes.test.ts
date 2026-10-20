import { describe, expect, it } from "vitest";
import { MAX_NOTE_LENGTH, NOTE_AUTHORS, NOTE_ROLE_LABELS, noteRoleFor, validateNote } from "./product-notes";

describe("validateNote", () => {
  it("rejects empty and whitespace-only notes", () => {
    expect(validateNote("")).toEqual({ ok: false, reason: "empty" });
    expect(validateNote("   \n\t ")).toEqual({ ok: false, reason: "empty" });
  });

  it("trims a valid note", () => {
    expect(validateNote("  Design insert required  ")).toEqual({ ok: true, text: "Design insert required" });
  });

  it("accepts exactly the maximum length and rejects one more", () => {
    expect(validateNote("a".repeat(MAX_NOTE_LENGTH)).ok).toBe(true);
    expect(validateNote("a".repeat(MAX_NOTE_LENGTH + 1))).toEqual({ ok: false, reason: "too-long" });
  });

  it("limits notes to 500 characters", () => {
    expect(MAX_NOTE_LENGTH).toBe(500);
  });
});

describe("note roles", () => {
  it("maps each role to its note role", () => {
    expect(noteRoleFor("commercial")).toBe("commercial");
    expect(noteRoleFor("downstream")).toBe("downstream");
    expect(NOTE_ROLE_LABELS.commercial).toBe("Commercial / Range Planning");
    expect(NOTE_ROLE_LABELS.downstream).toBe("Downstream team");
  });

  it("has a different simulated author for each role", () => {
    expect(NOTE_AUTHORS.commercial).not.toBe(NOTE_AUTHORS.downstream);
  });
});
