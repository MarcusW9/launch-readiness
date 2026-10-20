import { describe, expect, it } from "vitest";
import { countLaunchDates, getSelectedCriticalPath, summariseCriticalPath } from "./critical-path";
import { EMPTY_FILTERS, NOT_ASSIGNED } from "./filters";
import { makeProduct, stateAt, withActivity, withoutInformation } from "./testing/fixtures";

const atRisk = withActivity(
  makeProduct({ id: "3000001", name: "Cedar Shelf", criticalPath: "AW26 PH1", launchDate: "2026-11-16" }),
  "product-content",
  stateAt("in-progress"),
);
const ready = makeProduct({ id: "3000002", name: "Pine Stool", criticalPath: "AW26 PH1", launchDate: "2026-11-16" });
const blocked = withActivity(
  makeProduct({ id: "3000003", name: "Ash Desk", criticalPath: "AW26 PH1", launchDate: "2026-12-02" }),
  "product-content",
  stateAt("in-progress", { blocked: true, blockedReason: "Waiting on copy" }),
);
const missingInfo = withoutInformation(
  makeProduct({ id: "3000004", name: "Oak Bench", criticalPath: "AW26 PH1", launchDate: "2026-11-16" }),
  "supplier",
);
const launched = makeProduct({
  id: "3000005",
  name: "Live Lamp",
  criticalPath: "AW26 PH1",
  lifecycle: "Live",
  launchDate: "2026-10-20",
});
const otherPath = makeProduct({ id: "3000006", name: "Birch Rack", criticalPath: "AW26 PH2", launchDate: "2026-11-24" });
const unassigned = makeProduct({ id: "3000007", name: "Elm Chair", launchDate: "2026-11-24" });
const catalogue = [atRisk, ready, blocked, missingInfo, launched, otherPath, unassigned];

describe("getSelectedCriticalPath", () => {
  it("uses the Critical Path filter", () => {
    expect(getSelectedCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH2" })).toBe("AW26 PH2");
  });

  it("uses a search that matches products in one critical path only", () => {
    expect(getSelectedCriticalPath(catalogue, { ...EMPTY_FILTERS, query: "aw26 ph1" })).toBe("AW26 PH1");
    expect(getSelectedCriticalPath(catalogue, { ...EMPTY_FILTERS, query: "birch" })).toBe("AW26 PH2");
  });

  it("is undefined when nothing, several or no critical paths are selected", () => {
    expect(getSelectedCriticalPath(catalogue, EMPTY_FILTERS)).toBeUndefined();
    expect(getSelectedCriticalPath(catalogue, { ...EMPTY_FILTERS, query: "aw26" })).toBeUndefined();
    expect(getSelectedCriticalPath(catalogue, { ...EMPTY_FILTERS, query: "elm" })).toBeUndefined();
    expect(getSelectedCriticalPath(catalogue, { ...EMPTY_FILTERS, query: "no such product" })).toBeUndefined();
    expect(getSelectedCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: NOT_ASSIGNED })).toBeUndefined();
  });

  it("does not treat another filter that happens to leave one path as a selection", () => {
    expect(getSelectedCriticalPath([atRisk, ready], { ...EMPTY_FILTERS, brand: "Oakline" })).toBeUndefined();
  });
});

describe("countLaunchDates", () => {
  it("puts the most common date first and breaks ties with the earlier date", () => {
    expect(countLaunchDates([atRisk, ready, blocked])).toEqual([
      { date: "2026-11-16", count: 2 },
      { date: "2026-12-02", count: 1 },
    ]);
    expect(countLaunchDates([blocked, otherPath])).toEqual([
      { date: "2026-11-24", count: 1 },
      { date: "2026-12-02", count: 1 },
    ]);
  });
});

describe("summariseCriticalPath", () => {
  it("is undefined when no single critical path is selected", () => {
    expect(summariseCriticalPath(catalogue, EMPTY_FILTERS)).toBeUndefined();
  });

  it("counts only the active lines in the path", () => {
    const summary = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH1" });

    expect(summary?.name).toBe("AW26 PH1");
    expect(summary?.activeLines).toBe(4);
  });

  it("recalculates the status cards and flagged cards for the path", () => {
    const ph1 = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH1" });
    const ph2 = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH2" });

    expect(ph1?.counts).toEqual({ "At Risk": 1, "Action Required": 1, Ready: 2 });
    expect(ph1?.flagged).toEqual({ blocked: 1, missingInformation: 1 });
    expect(ph2?.counts).toEqual({ "At Risk": 0, "Action Required": 0, Ready: 1 });
    expect(ph2?.flagged).toEqual({ blocked: 0, missingInformation: 0 });
  });

  it("reports the main launch date and every other date", () => {
    const summary = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH1" });

    expect(summary?.mainDate).toBe("2026-11-16");
    expect(summary?.otherDates).toEqual([{ date: "2026-12-02", count: 1 }]);
  });

  it("has no other dates when every line launches together", () => {
    const summary = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, query: "birch" });

    expect(summary?.mainDate).toBe("2026-11-24");
    expect(summary?.otherDates).toEqual([]);
  });

  it("follows the other filters", () => {
    const summary = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH1", readiness: "At Risk" });

    expect(summary?.activeLines).toBe(1);
    expect(summary?.counts).toEqual({ "At Risk": 1, "Action Required": 0, Ready: 0 });
  });
});
