import { describe, expect, it } from "vitest";
import {
  ACTIVITY_DEFINITIONS,
  ACTIVITY_ORDER,
  getApplicableActivities,
  getStage,
  getStageIndex,
  resolveActivity,
  resolveAllActivities,
  resolveImagery,
  workStateLabel,
} from "./activities";
import { INFORMATION_DEFINITIONS, INFORMATION_ORDER } from "./information";
import { makeProduct, stateAt, withoutInformation } from "./testing/fixtures";
import type { ActivityKey, WorkState } from "./types";

describe("definition integrity", () => {
  const keys = Object.keys(ACTIVITY_DEFINITIONS) as ActivityKey[];

  it("orders every defined activity exactly once", () => {
    expect([...ACTIVITY_ORDER].sort()).toEqual([...keys].sort());
  });

  it.each(keys)("%s is internally consistent", (key) => {
    const def = ACTIVITY_DEFINITIONS[key];
    expect(def.key).toBe(key);
    expect(def.workflow[0].status).toBe("Not Started");
    expect(def.workflow[def.workflow.length - 1].status).toBe("Complete");
    expect(new Set(def.workflow.map((stage) => stage.id)).size).toBe(def.workflow.length);
    for (const info of def.startInfo) expect(def.requiredInfo).toContain(info);
    for (const info of def.requiredInfo) expect(INFORMATION_DEFINITIONS[info]).toBeDefined();
  });

  it("lists every information definition once in the display order", () => {
    expect(new Set(INFORMATION_ORDER).size).toBe(INFORMATION_ORDER.length);
    expect([...INFORMATION_ORDER].sort()).toEqual(Object.keys(INFORMATION_DEFINITIONS).sort());
  });
});

describe("workStateLabel", () => {
  const cases: Array<[WorkState, string]> = [
    ["Awaiting information", "Unable to start"],
    ["Ready to start", "Ready to start"],
    ["In Progress", "In Progress"],
    ["Blocked", "Blocked"],
    ["Complete", "Complete"],
    ["Not Required", "Not Required"],
  ];
  it.each(cases)("labels %s as %s", (state, label) => {
    expect(workStateLabel(state)).toBe(label);
  });
});

describe("stage lookup", () => {
  const def = ACTIVITY_DEFINITIONS["studio-imagery"];

  it("finds the stage and its position", () => {
    expect(getStage(def, stateAt("briefed")).label).toBe("Briefed");
    expect(getStageIndex(def, stateAt("briefed"))).toBe(1);
  });

  it("falls back to the first stage for an unknown id", () => {
    expect(getStage(def, stateAt("nonsense")).id).toBe("required");
    expect(getStageIndex(def, stateAt("nonsense"))).toBe(0);
  });
});

describe("applicability", () => {
  it("excludes variants when the product has a single option", () => {
    const result = resolveActivity(makeProduct(), "variants");
    expect(result.applies).toBe(false);
    expect(result.status).toBe("Not Required");
    expect(result.workState).toBe("Not Required");
    expect(result.nextAction).toBe("");
    expect(result.reason).toContain("single sellable option");
  });

  it("includes variants when the product has them", () => {
    const product = makeProduct({ characteristics: { hasVariants: true }, activities: { variants: stateAt("not-started") } });
    expect(resolveActivity(product, "variants").applies).toBe(true);
  });

  it("treats an applicable activity with no recorded state as not applicable", () => {
    const product = makeProduct({ characteristics: { hasVariants: true } });
    expect(resolveActivity(product, "variants").applies).toBe(false);
  });

  it("chooses studio or supplier imagery from the imagery source", () => {
    const supplier = makeProduct();
    const studio = makeProduct({ characteristics: { imagerySource: "studio" }, activities: { "studio-imagery": stateAt("required") } });
    expect(resolveImagery(supplier).def.key).toBe("supplier-imagery");
    expect(resolveImagery(studio).def.key).toBe("studio-imagery");
    expect(resolveActivity(studio, "supplier-imagery").applies).toBe(false);
  });

  it("explains own-brand studio work and compliance reasons", () => {
    const studio = makeProduct({
      characteristics: { imagerySource: "studio", ownBrand: true },
      activities: { "studio-imagery": stateAt("required") },
    });
    expect(resolveActivity(studio, "studio-imagery").reason).toContain("own-brand");

    const regulated = makeProduct({
      characteristics: { complianceReason: "it is an electrical product." },
      activities: { compliance: stateAt("not-started") },
    });
    expect(resolveActivity(regulated, "compliance").reason).toBe("Required because it is an electrical product.");
  });

  it("returns all six activities in order, and only applicable ones from getApplicableActivities", () => {
    const product = makeProduct();
    expect(resolveAllActivities(product).map((a) => a.def.key)).toEqual(ACTIVITY_ORDER);
    expect(getApplicableActivities(product).map((a) => a.def.key)).toEqual([
      "product-setup",
      "supplier-imagery",
      "product-content",
    ]);
  });
});

describe("work state", () => {
  it("is Awaiting information when start information is missing", () => {
    const product = withoutInformation(
      makeProduct({ characteristics: { hasVariants: true }, activities: { variants: stateAt("not-started") } }),
      "variant-options",
    );
    const result = resolveActivity(product, "variants");
    expect(result.workState).toBe("Awaiting information");
    expect(result.workStateLabel).toBe("Unable to start");
    expect(result.status).toBe("Not Started");
    expect(result.information.blockingStart).toEqual(["variant-options"]);
    expect(result.nextAction).toBe("Provide size and colour options");
  });

  it("is Ready to start when the first step is unblocked", () => {
    const product = makeProduct({ characteristics: { hasVariants: true }, activities: { variants: stateAt("not-started") } });
    const result = resolveActivity(product, "variants");
    expect(result.workState).toBe("Ready to start");
    expect(result.nextAction).toBe("Create the variants");
  });

  it("is In Progress after the first stage and no longer blocked by start information", () => {
    const product = withoutInformation(
      makeProduct({ activities: { "product-content": stateAt("in-progress") } }),
      "spec-sheet",
    );
    const result = resolveActivity(product, "product-content");
    expect(result.workState).toBe("In Progress");
    expect(result.information.blockingStart).toEqual([]);
    expect(result.information.missing).toEqual(["spec-sheet"]);
    expect(result.information.blockingFinish).toEqual(["spec-sheet"]);
    expect(result.nextAction).toBe("Provide supplier specification sheet");
  });

  it("is Blocked, with the reason in the next action", () => {
    const product = makeProduct({
      activities: { "product-setup": stateAt("in-progress", { blocked: true, blockedReason: "Waiting on supplier sample" }) },
    });
    const result = resolveActivity(product, "product-setup");
    expect(result.status).toBe("Blocked");
    expect(result.workState).toBe("Blocked");
    expect(result.nextAction).toBe("Resolve the blocker: waiting on supplier sample");
  });

  it("points at the notes when a blocker has no reason", () => {
    const product = makeProduct({ activities: { "product-setup": stateAt("in-progress", { blocked: true }) } });
    expect(resolveActivity(product, "product-setup").nextAction).toBe("Resolve the blocker: see notes");
  });

  it("is Complete, and a stale blocked flag is ignored", () => {
    const product = makeProduct({ activities: { "product-setup": stateAt("complete", { blocked: true }) } });
    const result = resolveActivity(product, "product-setup");
    expect(result.status).toBe("Complete");
    expect(result.workState).toBe("Complete");
    expect(result.information.blockingFinish).toEqual([]);
    expect(result.nextAction).toBe("Nothing further. This is complete.");
  });

  it("suggests the final step once nothing is missing", () => {
    const product = makeProduct({ activities: { "product-content": stateAt("in-progress") } });
    expect(resolveActivity(product, "product-content").nextAction).toBe("Complete product content");
  });

  it("suggests the next workflow stage when more than one remains", () => {
    const product = makeProduct({
      characteristics: { imagerySource: "studio" },
      activities: { "studio-imagery": stateAt("briefed") },
    });
    const result = resolveActivity(product, "studio-imagery");
    expect(result.status).toBe("In Progress");
    expect(result.nextAction).toBe("Move to In Progress");
  });

  it("maps the studio workflow stages to the controlled statuses", () => {
    const studio = (stage: string) =>
      resolveActivity(
        makeProduct({ characteristics: { imagerySource: "studio" }, activities: { "studio-imagery": stateAt(stage) } }),
        "studio-imagery",
      ).status;
    expect(studio("required")).toBe("Not Started");
    expect(studio("briefed")).toBe("In Progress");
    expect(studio("in-progress")).toBe("In Progress");
    expect(studio("complete")).toBe("Complete");
  });
});
