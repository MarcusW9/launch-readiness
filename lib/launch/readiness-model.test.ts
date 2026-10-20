import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { DEMO_TODAY } from "./readiness";
import {
  assessAndSort,
  assessProduct,
  compareAssessments,
  describeLaunchIn,
  describeStatus,
  type ModelAssessment,
} from "./readiness-model";
import type { Product } from "./types";
import { isWeekend } from "./working-days";

const find = (id: string) => SEED_PRODUCTS.find((p) => p.id === id)!;
const assess = (id: string) => assessProduct(find(id));

function variant(id: string, overrides: Partial<Product>): Product {
  return { ...find(id), ...overrides };
}

describe("status", () => {
  it("is Information Incomplete when any mandatory field is missing", () => {
    const result = assess("5678901");
    expect(result.status).toBe("Information Incomplete");
    expect(result.completeness.summary).toBe("2 missing");
    expect(result.slaProjectionDate).toBeUndefined();
  });

  it("is Expectation At Risk when the projection is later than the launch date, with the gap in working days", () => {
    const result = assess("1234567");
    expect(result.status).toBe("Expectation At Risk");
    expect(result.slaProjectionDate).toBe("2026-12-01");
    expect(result.gapWorkingDays).toBe(5);
    expect(describeStatus(result)).toBe("Expectation At Risk: 5 working days late");
  });

  it("shows a one day gap in the singular", () => {
    const result = assess("1912345");
    expect(result.status).toBe("Expectation At Risk");
    expect(describeStatus(result)).toBe("Expectation At Risk: 1 working day late");
  });

  it("is On Track when the projection is on or before the launch date", () => {
    const result = assess("2345678");
    expect(result.status).toBe("On Track");
    expect(result.gapWorkingDays).toBe(0);
    expect(describeStatus(result)).toBe("On Track");
  });

  it("is On Track when the projection falls exactly on the launch date", () => {
    const onTheDay = variant("2345678", { launchDate: "2026-11-10" });
    expect(assessProduct(onTheDay).status).toBe("On Track");
  });

  it("checks completeness before the projection, so an incomplete late product is Incomplete", () => {
    const lateAndIncomplete = variant("1234567", { fields: { ...find("1234567").fields, integration: "" } });
    expect(assessProduct(lateAndIncomplete).status).toBe("Information Incomplete");
  });

  it("cannot be set by hand: it is recalculated from the information and dates", () => {
    const fixed = variant("1234567", { launchDate: "2026-12-04" });
    expect(assessProduct(fixed).status).toBe("On Track");
  });
});

describe("info needed by", () => {
  it("is the launch date minus the SLA working days, for incomplete products", () => {
    expect(assess("5678901").infoNeededBy).toBe("2026-10-19");
  });

  it("is passed when it falls before the demo date", () => {
    expect(assess("5678901").infoNeededByPassed).toBe(true);
    expect(assess("1134567").infoNeededByPassed).toBe(true);
  });

  it("is not passed when it falls on or after the demo date", () => {
    const result = assess("1467890");
    expect(result.infoNeededBy).toBe("2026-11-13");
    expect(result.infoNeededByPassed).toBe(false);
  });

  it("does not exist for complete products", () => {
    expect(assess("4567890").infoNeededBy).toBeUndefined();
    expect(assess("1234567").infoNeededBy).toBeUndefined();
  });

  it("does not exist for products that are no longer being prepared", () => {
    expect(assess("1801234").status).toBe("Information Incomplete");
    expect(assess("1801234").infoNeededBy).toBeUndefined();
  });

  it("uses the 25 day SLA for a Guest bed", () => {
    const incompleteBed = variant("1912345", { fields: { ...find("1912345").fields, supplierContact: "" } });
    expect(assessProduct(incompleteBed).infoNeededBy).toBe("2026-10-30");
  });
});

describe("launch in working days", () => {
  it("counts working days from the demo date to the launch date", () => {
    expect(assess("4567890").launchInWorkingDays).toBe(4);
    expect(describeLaunchIn(4)).toBe("Launch in 4 working days");
  });

  it("uses the singular, today and past forms", () => {
    expect(describeLaunchIn(1)).toBe("Launch in 1 working day");
    expect(describeLaunchIn(0)).toBe("Launches today");
    expect(describeLaunchIn(-2)).toBe("Launched 2 working days ago");
    expect(describeLaunchIn(-1)).toBe("Launched 1 working day ago");
  });

  it("is negative once the launch date has passed", () => {
    expect(assess("1689012").launchInWorkingDays).toBeLessThan(0);
  });
});

describe("flags", () => {
  it("flags a launch date changed within 7 days of the demo date", () => {
    expect(assess("1234567").flags.dateChanged).toBe(true);
    expect(assess("4567890").flags.dateChanged).toBe(true);
    expect(assess("2345678").flags.dateChanged).toBe(false);
  });

  it("does not flag a change older than 7 days", () => {
    const old = variant("2345678", { launchDateChangedOn: "2026-11-02" });
    expect(assessProduct(old).flags.dateChanged).toBe(false);
    const edge = variant("2345678", { launchDateChangedOn: "2026-11-03" });
    expect(assessProduct(edge).flags.dateChanged).toBe(true);
  });

  it("flags stock landing after launch, separately from the SLA", () => {
    const result = assess("1356789");
    expect(result.flags.stockAfterLaunch).toBe(true);
    expect(result.status).toBe("On Track");
  });

  it("does not flag stock landing on or before the launch date", () => {
    const onTheDay = variant("1356789", { stockLandsDate: find("1356789").launchDate });
    expect(assessProduct(onTheDay).flags.stockAfterLaunch).toBe(false);
  });

  it("flags data errors in mandatory and optional fields", () => {
    expect(assess("1134567").flags.dataErrors).toBe(true);
    expect(assess("1245678").flags.dataErrors).toBe(true);
    expect(assess("1245678").status).toBe("On Track");
    expect(assess("4567890").flags.dataErrors).toBe(false);
  });

  it("overlaps with status rather than replacing it", () => {
    const result = assess("1134567");
    expect(result.status).toBe("Information Incomplete");
    expect(result.flags).toEqual({ dateChanged: true, stockAfterLaunch: true, dataErrors: true });
  });
});

describe("default sort", () => {
  const order = (items: ModelAssessment[]) => items.map((a) => a.product.id);

  it("puts At Risk first, then Incomplete with passed deadlines first, then On Track", () => {
    const sorted = assessAndSort(SEED_PRODUCTS.filter((p) => !p.lifecycle));
    const statuses = sorted.map((a) => a.status);
    expect(statuses).toEqual([...statuses].sort((a, b) => rank(a) - rank(b)));

    const incomplete = sorted.filter((a) => a.status === "Information Incomplete");
    expect(incomplete.map((a) => a.infoNeededByPassed)).toEqual(
      [...incomplete.map((a) => a.infoNeededByPassed)].sort((a, b) => Number(b) - Number(a)),
    );
    expect(incomplete[0].infoNeededByPassed).toBe(true);
    expect(incomplete[incomplete.length - 1].infoNeededByPassed).toBe(false);
  });

  it("orders by soonest launch within a group, then by largest gap", () => {
    const sorted = assessAndSort(SEED_PRODUCTS.filter((p) => !p.lifecycle));
    const atRisk = sorted.filter((a) => a.status === "Expectation At Risk");
    expect(order(atRisk)).toEqual(["4567890", "1234567", "1912345"]);

    const smaller = assessProduct(variant("1234567", { launchDate: "2026-11-24" }));
    const larger = assessProduct(variant("1912345", { launchDate: "2026-11-24" }));
    expect(smaller.gapWorkingDays).toBe(5);
    expect(larger.gapWorkingDays).toBe(9);
    expect(compareAssessments(larger, smaller)).toBeLessThan(0);
    expect(compareAssessments(smaller, larger)).toBeGreaterThan(0);
  });

  it("lists products that are no longer being prepared after everything else", () => {
    const sorted = assessAndSort(SEED_PRODUCTS);
    const firstInactive = sorted.findIndex((a) => !a.isPreparing);
    expect(firstInactive).toBeGreaterThan(0);
    expect(sorted.slice(firstInactive).every((a) => !a.isPreparing)).toBe(true);
    expect(sorted.slice(0, firstInactive).every((a) => a.isPreparing)).toBe(true);
  });

  it("is stable: the same input always sorts the same way", () => {
    expect(order(assessAndSort(SEED_PRODUCTS))).toEqual(order(assessAndSort([...SEED_PRODUCTS].reverse())));
  });
});

function rank(status: ModelAssessment["status"]): number {
  return { "Expectation At Risk": 0, "Information Incomplete": 1, "On Track": 2 }[status];
}

describe("seed data covers the model", () => {
  const assessments = SEED_PRODUCTS.map((p) => assessProduct(p));
  const preparing = assessments.filter((a) => a.isPreparing);

  it("shows every status at least once", () => {
    for (const status of ["Information Incomplete", "Expectation At Risk", "On Track"] as const) {
      expect(preparing.some((a) => a.status === status), status).toBe(true);
    }
  });

  it("shows every flag at least once", () => {
    expect(assessments.some((a) => a.flags.dateChanged)).toBe(true);
    expect(assessments.some((a) => a.flags.stockAfterLaunch)).toBe(true);
    expect(assessments.some((a) => a.flags.dataErrors)).toBe(true);
  });

  it("has an incomplete product with a passed deadline, and one without", () => {
    const incomplete = preparing.filter((a) => a.status === "Information Incomplete");
    expect(incomplete.some((a) => a.infoNeededByPassed)).toBe(true);
    expect(incomplete.some((a) => !a.infoNeededByPassed)).toBe(true);
  });

  it("has a mandatory data error shown once within the missing count", () => {
    expect(assessments.some((a) => a.completeness.summary === "3 missing (incl. 1 data error)")).toBe(true);
  });

  it("has an optional field holding N/A that does not count as missing", () => {
    const result = assess("2345678");
    expect(result.product.fields?.subRange).toBe("N/A");
    expect(result.completeness.isComplete).toBe(true);
  });

  it("has a guest bed on the 25 day SLA", () => {
    const bed = assess("1912345");
    expect(bed.product.fields?.productType).toBe("Guest bed");
    expect(bed.slaWorkingDays).toBe(25);
    expect(SEED_PRODUCTS.filter((p) => p.fields?.productType !== "Guest bed").every((p) => assessProduct(p).slaWorkingDays === 20)).toBe(true);
  });

  it("has no launch dates on a weekend", () => {
    for (const product of SEED_PRODUCTS) {
      expect(isWeekend(product.launchDate), `${product.id} ${product.launchDate}`).toBe(false);
    }
  });

  it("has no PIM date after the demo date", () => {
    expect(DEMO_TODAY).toBe("2026-11-10");
    for (const product of SEED_PRODUCTS) {
      for (const [label, date] of [
        ["infoCompleteAt", product.infoCompleteAt],
        ["launchDateChangedOn", product.launchDateChangedOn],
      ] as const) {
        if (date) expect(date <= DEMO_TODAY, `${product.id} ${label} ${date}`).toBe(true);
      }
    }
  });

  it("only gives a completion date to products whose mandatory fields are all present", () => {
    for (const product of SEED_PRODUCTS) {
      const result = assessProduct(product);
      if (result.completeness.isComplete) {
        expect(product.infoCompleteAt, product.id).toBeDefined();
      } else {
        expect(result.infoCompleteAt, product.id).toBeUndefined();
      }
    }
  });
});
