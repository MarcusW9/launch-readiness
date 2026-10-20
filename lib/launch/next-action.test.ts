import { describe, expect, it } from "vitest";
import { ACTIVITY_DEFINITIONS } from "./activity-definitions";
import { INFORMATION_DEFINITIONS } from "./information";
import { deriveNextAction, deriveWorkState } from "./next-action";
import { stateAt } from "./testing/fixtures";
import type { ActivityDefinition } from "./types";

describe("deriveWorkState", () => {
  const idle = { isComplete: false, blocked: false, notStarted: false, blockingStart: [] };

  it("is In Progress once work has begun and nothing is wrong", () => {
    expect(deriveWorkState(idle)).toBe("In Progress");
  });

  it("is Ready to start when the first step can begin", () => {
    expect(deriveWorkState({ ...idle, notStarted: true })).toBe("Ready to start");
  });

  it("is Awaiting information (shown as Unable to start) when start information is missing", () => {
    expect(deriveWorkState({ ...idle, notStarted: true, blockingStart: ["supplier"] })).toBe("Awaiting information");
  });

  it("ignores missing start information once the work is under way", () => {
    expect(deriveWorkState({ ...idle, blockingStart: ["supplier"] })).toBe("In Progress");
  });

  it("is Blocked when somebody has flagged a blocker", () => {
    expect(deriveWorkState({ ...idle, blocked: true })).toBe("Blocked");
  });

  it("lets a blocker win over not being started", () => {
    expect(deriveWorkState({ ...idle, blocked: true, notStarted: true, blockingStart: ["supplier"] })).toBe("Blocked");
  });

  it("is Complete above everything else", () => {
    expect(
      deriveWorkState({ isComplete: true, blocked: true, notStarted: true, blockingStart: ["supplier"] }),
    ).toBe("Complete");
  });
});

describe("deriveNextAction", () => {
  const def = ACTIVITY_DEFINITIONS["studio-imagery"];
  const lastStage = def.workflow.length - 1;
  const supplierLabel = INFORMATION_DEFINITIONS.supplier.label;
  const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

  const base = { def, state: stateAt("required"), stageIndex: 0, missing: [], blockingStart: [] };

  it("says there is nothing to do once the final stage is reached", () => {
    const action = deriveNextAction({ ...base, state: stateAt("complete"), stageIndex: lastStage });
    expect(action).toBe("Nothing further. This is complete.");
  });

  it("puts completion ahead of a stale blocker or missing information", () => {
    const action = deriveNextAction({
      ...base,
      state: stateAt("complete", { blocked: true, blockedReason: "Old problem" }),
      stageIndex: lastStage,
      missing: ["supplier"],
      blockingStart: ["supplier"],
    });
    expect(action).toBe("Nothing further. This is complete.");
  });

  it("asks for the blocker to be resolved, quoting the reason", () => {
    const action = deriveNextAction({
      ...base,
      state: stateAt("briefed", { blocked: true, blockedReason: "Studio fully booked" }),
      stageIndex: 1,
    });
    expect(action).toBe("Resolve the blocker: studio fully booked");
  });

  it("points at the notes when a blocker has no reason", () => {
    const action = deriveNextAction({ ...base, state: stateAt("briefed", { blocked: true }), stageIndex: 1 });
    expect(action).toBe("Resolve the blocker: see notes");
  });

  it("asks for the first piece of start information before anything else", () => {
    const action = deriveNextAction({ ...base, blockingStart: ["supplier"], missing: ["pricing"] });
    expect(action).toBe(`Provide ${lowerFirst(supplierLabel)}`);
  });

  it("uses the activity's own start action when the first step is ready", () => {
    expect(deriveNextAction(base)).toBe(def.startAction);
  });

  it("asks for missing information once past the first stage", () => {
    const action = deriveNextAction({ ...base, state: stateAt("briefed"), stageIndex: 1, missing: ["supplier"] });
    expect(action).toBe(`Provide ${lowerFirst(supplierLabel)}`);
  });

  it("suggests completing the activity when the next stage is the final one", () => {
    const action = deriveNextAction({ ...base, state: stateAt("in-progress"), stageIndex: lastStage - 1 });
    expect(action).toBe(`Complete ${def.name.toLowerCase()}`);
  });

  it("suggests moving to the next stage in between", () => {
    const action = deriveNextAction({ ...base, state: stateAt("briefed"), stageIndex: 1 });
    expect(action).toBe(`Move to ${def.workflow[2].label}`);
  });

  it("returns nothing when the workflow has no stage after an unfinished one", () => {
    const stuck: ActivityDefinition = {
      ...def,
      workflow: [
        { id: "start", label: "Start", status: "Not Started" },
        { id: "working", label: "Working", status: "In Progress" },
      ],
    };
    expect(deriveNextAction({ ...base, def: stuck, state: stateAt("working"), stageIndex: 1 })).toBe("");
  });
});
