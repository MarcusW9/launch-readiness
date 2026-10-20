import { describe, expect, it } from "vitest";
import { countLaunchDates, getSelectedCriticalPath, summariseCriticalPath } from "./critical-path";
import { EMPTY_FILTERS, NOT_ASSIGNED } from "./filters";
import { makeProduct, withMissingFields } from "./testing/fixtures";

const atRisk = makeProduct({
  id: "3000001",
  name: "Cedar Shelf",
  criticalPath: "AW26 PH1",
  launchDate: "2026-11-20",
  infoCompleteAt: "2026-11-02",
});
const onTrack = makeProduct({ id: "3000002", name: "Pine Stool", criticalPath: "AW26 PH1", launchDate: "2026-12-30" });
const dateChanged = makeProduct({
  id: "3000003",
  name: "Ash Desk",
  criticalPath: "AW26 PH1",
  launchDate: "2026-12-30",
  previousLaunchDate: "2026-12-01",
  launchDateChangedOn: "2026-11-08",
});
const incomplete = withMissingFields(
  makeProduct({ id: "3000004", name: "Oak Bench", criticalPath: "AW26 PH1", launchDate: "2026-12-02" }),
  "supplierName",
);
const launched = makeProduct({
  id: "3000005",
  name: "Live Lamp",
  criticalPath: "AW26 PH1",
  lifecycle: "Live",
  launchDate: "2026-10-20",
});
const otherPath = makeProduct({ id: "3000006", name: "Birch Rack", criticalPath: "AW26 PH2", launchDate: "2026-12-24" });
const unassigned = makeProduct({ id: "3000007", name: "Elm Chair", criticalPath: undefined, launchDate: "2026-12-24" });
const catalogue = [atRisk, onTrack, dateChanged, incomplete, launched, otherPath, unassigned];

describe("getSelectedCriticalPath", () => {
  it("uses the Critical Path filter", () => {
    expect(getSelectedCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH2" })).toBe("AW26 PH2");
  });

  it("uses a search that matches products in one critical path only", () => {
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
    expect(getSelectedCriticalPath([atRisk, onTrack], { ...EMPTY_FILTERS, brand: "Oakline" })).toBeUndefined();
  });
});

describe("countLaunchDates", () => {
  it("puts the most common date first and breaks ties with the earlier date", () => {
    expect(countLaunchDates([atRisk, onTrack, dateChanged])).toEqual([
      { date: "2026-12-30", count: 2 },
      { date: "2026-11-20", count: 1 },
    ]);
    expect(countLaunchDates([incomplete, otherPath])).toEqual([
      { date: "2026-12-02", count: 1 },
      { date: "2026-12-24", count: 1 },
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

  it("counts the lines at each status and the flagged lines for the path", () => {
    const ph1 = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH1" });
    const ph2 = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH2" });

    expect(ph1?.counts).toEqual({ "Expectation At Risk": 1, "Information Incomplete": 1, "On Track": 2 });
    expect(ph1?.flagged).toEqual({ dateChanged: 1, stockAfterLaunch: 0 });
    expect(ph2?.counts).toEqual({ "Expectation At Risk": 0, "Information Incomplete": 0, "On Track": 1 });
    expect(ph2?.flagged).toEqual({ dateChanged: 0, stockAfterLaunch: 0 });
  });

  it("reports the main launch date and every other date", () => {
    const summary = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, criticalPath: "AW26 PH1" });

    expect(summary?.mainDate).toBe("2026-12-30");
    expect(summary?.otherDates).toEqual([
      { date: "2026-11-20", count: 1 },
      { date: "2026-12-02", count: 1 },
    ]);
  });

  it("has no other dates when every line launches together", () => {
    const summary = summariseCriticalPath(catalogue, { ...EMPTY_FILTERS, query: "birch" });

    expect(summary?.mainDate).toBe("2026-12-24");
    expect(summary?.otherDates).toEqual([]);
  });

  it("follows the other filters", () => {
    const summary = summariseCriticalPath(catalogue, {
      ...EMPTY_FILTERS,
      criticalPath: "AW26 PH1",
      status: "Expectation At Risk",
    });

    expect(summary?.activeLines).toBe(1);
    expect(summary?.counts).toEqual({ "Expectation At Risk": 1, "Information Incomplete": 0, "On Track": 0 });
  });
});
