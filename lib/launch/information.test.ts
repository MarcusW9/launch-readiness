import { describe, expect, it } from "vitest";
import { ACTIVITY_DEFINITIONS } from "./activity-definitions";
import { INFORMATION_DEFINITIONS, INFORMATION_ORDER, informationLabel } from "./information";
import { makeProduct } from "./testing/fixtures";
import type { InformationKey } from "./types";

const keys = Object.keys(INFORMATION_DEFINITIONS) as InformationKey[];

describe("INFORMATION_ORDER", () => {
  it("lists every defined item exactly once", () => {
    expect([...INFORMATION_ORDER].sort()).toEqual([...keys].sort());
    expect(new Set(INFORMATION_ORDER).size).toBe(INFORMATION_ORDER.length);
  });
});

describe("INFORMATION_DEFINITIONS", () => {
  it.each(keys)("%s has the wording and source every screen relies on", (key) => {
    const definition = INFORMATION_DEFINITIONS[key];

    expect(definition.label.trim()).not.toBe("");
    expect(definition.prompt.trim()).not.toBe("");
    expect(definition.neededFrom.trim()).not.toBe("");
    expect(definition.defaultSource.trim()).not.toBe("");
  });

  it("gives every item a distinct label so two rows never look the same", () => {
    const labels = keys.map(informationLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it.each(keys)("%s offers a non-empty sample value for the demo form", (key) => {
    const sample = INFORMATION_DEFINITIONS[key].sampleValue(makeProduct());
    expect(sample.trim()).not.toBe("");
  });

  it("is needed by at least one activity, so nothing is asked for in vain", () => {
    const required = new Set(Object.values(ACTIVITY_DEFINITIONS).flatMap((def) => def.requiredInfo));
    for (const key of keys) expect(required, `${key} is never required`).toContain(key);
  });

  it("only lets an activity start on information it also requires", () => {
    for (const def of Object.values(ACTIVITY_DEFINITIONS)) {
      for (const key of def.startInfo) expect(def.requiredInfo, `${def.key} starts on ${key}`).toContain(key);
    }
  });
});

describe("informationLabel", () => {
  it("returns the label from the definition", () => {
    for (const key of keys) expect(informationLabel(key)).toBe(INFORMATION_DEFINITIONS[key].label);
  });
});
