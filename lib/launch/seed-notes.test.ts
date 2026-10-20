import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { MAX_NOTE_LENGTH, NOTE_AUTHORS, NOTE_ROLE_LABELS } from "./product-notes";
import { summariseReadiness } from "./readiness";

const DEMO_DAY_END = "2026-11-10T23:59";

const productsWithNotes = SEED_PRODUCTS.filter((product) => (product.notes ?? []).length > 0);
const allNotes = productsWithNotes.flatMap((product) => product.notes ?? []);

describe("seed notes", () => {
  it("covers about five Active products with one to three notes each", () => {
    expect(productsWithNotes.length).toBeGreaterThanOrEqual(5);
    for (const product of productsWithNotes) {
      expect(product.lifecycle ?? "Active").toBe("Active");
      expect(product.notes?.length).toBeGreaterThanOrEqual(1);
      expect(product.notes?.length).toBeLessThanOrEqual(3);
    }
  });

  it("dates every note on a weekday on or before 10 Nov 2026", () => {
    for (const note of allNotes) {
      const day = new Date(`${note.at}:00Z`).getUTCDay();
      expect(day, `${note.id} falls on a weekend`).not.toBe(0);
      expect(day, `${note.id} falls on a weekend`).not.toBe(6);
      expect(note.at <= DEMO_DAY_END, `${note.id} is after 10 Nov 2026`).toBe(true);
    }
  });

  it("keeps each log newest first", () => {
    for (const product of productsWithNotes) {
      const times = (product.notes ?? []).map((note) => note.at);
      expect(times).toEqual([...times].sort().reverse());
    }
  });

  it("gives every note a unique id, a simulated author matching its role, and a valid length", () => {
    const ids = allNotes.map((note) => note.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const note of allNotes) {
      expect(note.author).toBe(NOTE_AUTHORS[note.role]);
      expect(NOTE_ROLE_LABELS[note.role]).toBeTruthy();
      expect(note.text.length).toBeGreaterThan(0);
      expect(note.text.length).toBeLessThanOrEqual(MAX_NOTE_LENGTH);
    }
  });

  it("includes both roles", () => {
    expect(new Set(allNotes.map((note) => note.role))).toEqual(new Set(["commercial", "downstream"]));
  });

  it("never changes a product's readiness", () => {
    for (const product of productsWithNotes) {
      expect(summariseReadiness(product)).toEqual(summariseReadiness({ ...product, notes: [] }));
    }
  });
});
