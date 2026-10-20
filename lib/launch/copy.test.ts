import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HAS_MISSING_INFORMATION_LABEL, INFORMATION_NEEDED_HEADING, WORK_STATE_LABELS } from "./copy";
import { INFORMATION_OPTIONS } from "./filters";
import { workStateLabel } from "./next-action";
import type { WorkState } from "./types";

const root = resolve(__dirname, "../..");

function readNormalised(relativePath: string): string {
  return readFileSync(resolve(root, relativePath), "utf8").replace(/\s+/g, " ");
}

const states = Object.keys(WORK_STATE_LABELS) as WorkState[];

describe("WORK_STATE_LABELS", () => {
  it("has a non-empty label for every work state", () => {
    for (const state of states) {
      expect(WORK_STATE_LABELS[state].trim()).not.toBe("");
    }
  });

  it("is what workStateLabel returns", () => {
    for (const state of states) {
      expect(workStateLabel(state)).toBe(WORK_STATE_LABELS[state]);
    }
  });

  it("never shows the internal 'Awaiting information' name to users", () => {
    expect(Object.values(WORK_STATE_LABELS)).not.toContain("Awaiting information");
    expect(WORK_STATE_LABELS["Awaiting information"]).toBe("Unable to start");
  });

  it("uses distinct labels so two states are never confused on screen", () => {
    const labels = Object.values(WORK_STATE_LABELS);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("shared wording", () => {
  it("feeds the Products information filter option", () => {
    expect(INFORMATION_OPTIONS.map((option) => option.label)).toContain(HAS_MISSING_INFORMATION_LABEL);
  });

  it("keeps the information heading stable", () => {
    expect(INFORMATION_NEEDED_HEADING).toBe("Information needed");
  });
});

describe("prose stays in step with the state labels", () => {
  const pages = [
    ["About page", "app/about/page.tsx"],
    ["How it works", "components/launch/how-it-works-sections.tsx"],
  ] as const;

  for (const [name, path] of pages) {
    it(`${name} names every state label`, () => {
      const text = readNormalised(path);
      for (const state of states) {
        expect(text, `${name} should mention "${WORK_STATE_LABELS[state]}"`).toContain(WORK_STATE_LABELS[state]);
      }
    });

    it(`${name} does not use the internal 'Awaiting information' name`, () => {
      expect(readNormalised(path)).not.toContain("Awaiting information");
    });
  }
});
