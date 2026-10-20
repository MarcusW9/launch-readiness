import { describe, expect, it } from "vitest";
import { addWorkingDays, isWeekend, pluralise, workingDaysBetween } from "./working-days";

describe("isWeekend", () => {
  it("is true for Saturday and Sunday only", () => {
    expect(isWeekend("2026-11-14")).toBe(true);
    expect(isWeekend("2026-11-15")).toBe(true);
    expect(isWeekend("2026-11-13")).toBe(false);
    expect(isWeekend("2026-11-16")).toBe(false);
  });
});

describe("addWorkingDays", () => {
  it("skips weekends going forward", () => {
    expect(addWorkingDays("2026-11-13", 1)).toBe("2026-11-16");
    expect(addWorkingDays("2026-11-09", 5)).toBe("2026-11-16");
  });

  it("adds 20 working days as exactly four weeks", () => {
    expect(addWorkingDays("2026-11-03", 20)).toBe("2026-12-01");
  });

  it("adds 25 working days as exactly five weeks", () => {
    expect(addWorkingDays("2026-11-02", 25)).toBe("2026-12-07");
  });

  it("moves backwards for a negative count", () => {
    expect(addWorkingDays("2026-11-16", -1)).toBe("2026-11-13");
    expect(addWorkingDays("2026-11-16", -20)).toBe("2026-10-19");
  });

  it("returns the same date for zero", () => {
    expect(addWorkingDays("2026-11-10", 0)).toBe("2026-11-10");
  });

  it("starts from the nearest weekday when the start is a weekend", () => {
    expect(addWorkingDays("2026-11-14", 1)).toBe("2026-11-16");
    expect(addWorkingDays("2026-11-15", -1)).toBe("2026-11-13");
  });

  it("ignores bank holidays", () => {
    expect(addWorkingDays("2026-12-23", 3)).toBe("2026-12-28");
  });
});

describe("workingDaysBetween", () => {
  it("counts weekdays after the start up to and including the end", () => {
    expect(workingDaysBetween("2026-11-10", "2026-11-16")).toBe(4);
    expect(workingDaysBetween("2026-11-13", "2026-11-16")).toBe(1);
  });

  it("is zero for the same date", () => {
    expect(workingDaysBetween("2026-11-10", "2026-11-10")).toBe(0);
  });

  it("is negative when the end is earlier", () => {
    expect(workingDaysBetween("2026-11-16", "2026-11-10")).toBe(-4);
  });

  it("round-trips with addWorkingDays", () => {
    expect(workingDaysBetween("2026-11-03", addWorkingDays("2026-11-03", 20))).toBe(20);
    expect(workingDaysBetween("2026-11-02", addWorkingDays("2026-11-02", 25))).toBe(25);
  });
});

describe("pluralise", () => {
  it("uses the singular for one and the plural otherwise", () => {
    expect(pluralise(1, "working day")).toBe("1 working day");
    expect(pluralise(0, "working day")).toBe("0 working days");
    expect(pluralise(5, "working day")).toBe("5 working days");
  });
});
