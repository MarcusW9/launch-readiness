import { describe, expect, it } from "vitest";
import {
  DEMO_TODAY,
  daysUntil,
  describeDaysToLaunch,
  formatLongDate,
  formatShortDate,
  formatTimestamp,
} from "./readiness";

describe("daysUntil", () => {
  it("counts days from the demo date by default", () => {
    expect(daysUntil(DEMO_TODAY)).toBe(0);
    expect(daysUntil("2026-11-11")).toBe(1);
    expect(daysUntil("2026-11-09")).toBe(-1);
  });

  it("counts from another date when one is given", () => {
    expect(daysUntil("2026-12-01", "2026-11-01")).toBe(30);
  });

  it("is not thrown off by clocks changing", () => {
    expect(daysUntil("2026-11-02", "2026-10-24")).toBe(9);
  });
});

describe("date formatting", () => {
  it("writes short and long dates by hand so server and client agree", () => {
    expect(formatShortDate("2026-11-24")).toBe("24 Nov");
    expect(formatLongDate("2026-01-05")).toBe("5 Jan 2026");
  });

  it("writes a timestamp as the date and the time", () => {
    expect(formatTimestamp("2026-11-10T09:30")).toBe("10 Nov, 09:30");
  });

  it("defaults a missing time to midnight", () => {
    expect(formatTimestamp("2026-11-10")).toBe("10 Nov, 00:00");
  });
});

describe("describeDaysToLaunch", () => {
  it.each([
    [-3, "3 days ago"],
    [-1, "1 day ago"],
    [0, "Today"],
    [1, "Tomorrow"],
    [12, "In 12 days"],
  ])("describes %i days as %s", (days, expected) => {
    expect(describeDaysToLaunch(days)).toBe(expected);
  });
});
