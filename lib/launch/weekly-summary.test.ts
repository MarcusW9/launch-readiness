import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS as INITIAL_PRODUCTS } from "./data";
import { EMPTY_FILTERS } from "./filters";
import { INFORMATION_ORDER } from "./information";
import { summariseReadiness } from "./readiness";
import { makeProduct, stateAt, withoutInformation } from "./testing/fixtures";
import {
  ALL_ACTIVE_LABEL,
  addWorkingDays,
  buildWeeklySummary,
  deadlineLabel,
  launchGapLabel,
  weeklySummaryText,
  workingDaysBetween,
} from "./weekly-summary";

const outstanding = { characteristics: { hasVariants: true }, activities: { variants: stateAt("not-started") } };

const atRisk = makeProduct({ id: "1", name: "Risky Rug", criticalPath: "AW26 PH1", launchDate: "2026-11-17", ...outstanding });
const incompleteSoon = withoutInformation(
  makeProduct({ id: "2", name: "Soon Sofa", criticalPath: "AW26 PH1", launchDate: "2026-12-04", ...outstanding }),
  INFORMATION_ORDER[0],
);
const incompleteLater = withoutInformation(
  makeProduct({ id: "3", name: "Later Lamp", criticalPath: "AW26 PH1", launchDate: "2027-03-01", ...outstanding }),
  INFORMATION_ORDER[0],
);
const ready = makeProduct({ id: "4", name: "Ready Rack", criticalPath: "SS27 PH1", launchDate: "2027-03-01" });
const dropped = makeProduct({ id: "5", name: "Dropped Desk", criticalPath: "AW26 PH1", launchDate: "2026-11-12", lifecycle: "Dropped" });
const changed = makeProduct({
  id: "6",
  name: "Changed Chair",
  criticalPath: "AW26 PH1",
  launchDate: "2027-03-01",
  previousLaunchDate: "2027-02-01",
  launchDateChangedOn: "2026-11-09",
});
const changedLastWeek = makeProduct({
  id: "7",
  name: "Old Change",
  criticalPath: "AW26 PH1",
  launchDate: "2027-03-01",
  previousLaunchDate: "2027-02-01",
  launchDateChangedOn: "2026-11-06",
});
const lateStock = makeProduct({ id: "8", name: "Late Stool", criticalPath: "SS27 PH1", launchDate: "2027-03-01", stockLandsDate: "2027-03-10" });
const earlyStock = makeProduct({ id: "9", name: "Early Stool", criticalPath: "SS27 PH1", launchDate: "2027-03-01", stockLandsDate: "2027-02-20" });

const fixtures = [atRisk, incompleteSoon, incompleteLater, ready, dropped, changed, changedLastWeek, lateStock, earlyStock];

describe("working days", () => {
  it("counts Monday to Friday only, excluding the start and including the end", () => {
    expect(workingDaysBetween("2026-11-10", "2026-11-13")).toBe(3);
    expect(workingDaysBetween("2026-11-13", "2026-11-16")).toBe(1);
    expect(workingDaysBetween("2026-11-10", "2026-11-10")).toBe(0);
  });

  it("is negative when the date has passed", () => {
    expect(workingDaysBetween("2026-11-10", "2026-11-06")).toBe(-2);
  });

  it("adds and subtracts working days across weekends", () => {
    expect(addWorkingDays("2026-11-13", 1)).toBe("2026-11-16");
    expect(addWorkingDays("2026-11-16", -1)).toBe("2026-11-13");
    expect(addWorkingDays("2026-12-04", -15)).toBe("2026-11-13");
  });
});

describe("buildWeeklySummary scope", () => {
  it("covers every Active product when no critical path is selected", () => {
    const summary = buildWeeklySummary(fixtures, EMPTY_FILTERS);
    expect(summary.scopeLabel).toBe(ALL_ACTIVE_LABEL);
    expect(summary.total).toBe(fixtures.length - 1);
    expect(summary.subject).toBe("Launch Readiness weekly summary \u2013 All active products \u2013 w/c 9 Nov 2026");
  });

  it("uses the selected critical path", () => {
    const summary = buildWeeklySummary(fixtures, { ...EMPTY_FILTERS, criticalPath: "SS27 PH1" });
    expect(summary.scopeLabel).toBe("SS27 PH1");
    expect(summary.total).toBe(3);
    expect(summary.subject).toContain("SS27 PH1");
  });

  it("uses a search that matches exactly one critical path", () => {
    const summary = buildWeeklySummary(fixtures, { ...EMPTY_FILTERS, query: "SS27 PH1" });
    expect(summary.scopeLabel).toBe("SS27 PH1");
  });

  it("ignores the status card filter", () => {
    const all = buildWeeklySummary(fixtures, EMPTY_FILTERS);
    const filtered = buildWeeklySummary(fixtures, { ...EMPTY_FILTERS, readiness: "At Risk" });
    expect(filtered).toEqual(all);
  });
});

describe("buildWeeklySummary sections", () => {
  const summary = buildWeeklySummary(fixtures, EMPTY_FILTERS);

  it("headlines the three counts", () => {
    expect(summary.atRiskCount).toBe(1);
    expect(summary.incompleteCount).toBe(2);
    expect(summary.onTrackCount).toBe(5);
    expect(summary.atRiskCount + summary.incompleteCount + summary.onTrackCount).toBe(summary.total);
  });

  it("lists At Risk products with the working days to launch", () => {
    expect(summary.atRisk.map((item) => item.product.id)).toEqual(["1"]);
    expect(summary.atRisk[0].workingDaysToLaunch).toBe(5);
    expect(launchGapLabel(summary.atRisk[0])).toBe("5 working days to launch");
  });

  it("lists only incomplete products whose information is due within 10 working days", () => {
    expect(summary.infoNeeded.map((item) => item.product.id)).toEqual(["2"]);
    expect(summary.infoNeeded[0].neededBy).toBe("2026-11-13");
    expect(summary.infoNeeded[0].missingCount).toBeGreaterThan(0);
    expect(deadlineLabel(summary.infoNeeded[0])).toBe("in 3 working days");
  });

  it("lists launch date changes made this week with the old and new dates", () => {
    expect(summary.dateChanges.map((item) => item.product.id)).toEqual(["6"]);
    expect(summary.dateChanges[0].previousLaunchDate).toBe("2027-02-01");
  });

  it("lists products whose stock lands after launch only", () => {
    expect(summary.stockAfterLaunch.map((item) => item.product.id)).toEqual(["8"]);
  });

  it("describes a passed deadline", () => {
    const overdue = withoutInformation(
      makeProduct({ id: "10", name: "Overdue", launchDate: "2026-11-24", ...outstanding }),
      INFORMATION_ORDER[0],
    );
    const item = buildWeeklySummary([overdue], EMPTY_FILTERS).infoNeeded[0];
    expect(item.workingDaysToDeadline).toBeLessThan(0);
    expect(deadlineLabel(item)).toMatch(/^passed \d+ working days? ago$/);
  });
});

describe("weeklySummaryText", () => {
  it("is a plain-text version of the preview with the footer", () => {
    const text = weeklySummaryText(buildWeeklySummary(fixtures, EMPTY_FILTERS));
    expect(text).toContain("Subject: Launch Readiness weekly summary");
    expect(text).toContain("8 products: 1 at risk, 2 information incomplete, 5 on track");
    expect(text).toContain("1 Risky Rug");
    expect(text).toContain("Generated from Launch Readiness on 10 Nov 2026. Prototype: no email is sent.");
  });
});

describe("seed data", () => {
  it("builds a summary for every critical path without changing any status", () => {
    const before = INITIAL_PRODUCTS.map((product) => summariseReadiness(product).launchStatus);
    const paths = [...new Set(INITIAL_PRODUCTS.map((product) => product.criticalPath).filter(Boolean))] as string[];
    for (const criticalPath of paths) {
      const summary = buildWeeklySummary(INITIAL_PRODUCTS, { ...EMPTY_FILTERS, criticalPath });
      expect(summary.atRiskCount + summary.incompleteCount + summary.onTrackCount).toBe(summary.total);
    }
    expect(INITIAL_PRODUCTS.map((product) => summariseReadiness(product).launchStatus)).toEqual(before);
  });

  it("has something to show in every section across all Active products", () => {
    const summary = buildWeeklySummary(INITIAL_PRODUCTS, EMPTY_FILTERS);
    expect(summary.dateChanges.length).toBeGreaterThan(0);
    expect(summary.stockAfterLaunch.length).toBeGreaterThan(0);
  });
});
