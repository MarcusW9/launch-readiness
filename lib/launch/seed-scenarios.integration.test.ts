import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { EMPTY_FILTERS, countByTab, filterProducts } from "./filters";
import { assessProduct, type ModelStatus } from "./readiness-model";

interface Scenario {
  id: string;
  status: ModelStatus;
  missing: number;
  dateChanged?: true;
  stockAfterLaunch?: true;
}

const SCENARIOS: Scenario[] = [
  { id: "1234567", status: "Expectation At Risk", missing: 0, dateChanged: true },
  { id: "2345678", status: "On Track", missing: 0 },
  { id: "3456789", status: "On Track", missing: 0 },
  { id: "4567890", status: "Expectation At Risk", missing: 0, dateChanged: true },
  { id: "5678901", status: "Information Incomplete", missing: 2, stockAfterLaunch: true },
  { id: "6789012", status: "On Track", missing: 0 },
  { id: "7890123", status: "On Track", missing: 0 },
  { id: "8901234", status: "On Track", missing: 0 },
  { id: "9012345", status: "On Track", missing: 0 },
  { id: "1023456", status: "On Track", missing: 0 },
  { id: "1134567", status: "Information Incomplete", missing: 3, dateChanged: true, stockAfterLaunch: true },
  { id: "1245678", status: "On Track", missing: 0 },
  { id: "1356789", status: "On Track", missing: 0, stockAfterLaunch: true },
  { id: "1467890", status: "Information Incomplete", missing: 2 },
  { id: "1578901", status: "On Track", missing: 0 },
  { id: "1912345", status: "Expectation At Risk", missing: 0 },
  { id: "1689012", status: "On Track", missing: 0 },
  { id: "1790123", status: "On Track", missing: 0 },
  { id: "1801234", status: "Information Incomplete", missing: 2 },
];

describe("seed dataset scenarios", () => {
  it("covers every seeded product exactly once", () => {
    expect(SEED_PRODUCTS.map((product) => product.id).sort()).toEqual(SCENARIOS.map((scenario) => scenario.id).sort());
  });

  it.each(SCENARIOS)("$id is $status with $missing missing fields", (scenario) => {
    const product = SEED_PRODUCTS.find((candidate) => candidate.id === scenario.id)!;
    const assessment = assessProduct(product);

    expect(assessment.status).toBe(scenario.status);
    expect(assessment.completeness.missingMandatory).toHaveLength(scenario.missing);
    expect(assessment.flags.dateChanged).toBe(Boolean(scenario.dateChanged));
    expect(assessment.flags.stockAfterLaunch).toBe(Boolean(scenario.stockAfterLaunch));
  });

  it("shows every status, both flags and every tab", () => {
    const statuses = new Set(SEED_PRODUCTS.map((product) => assessProduct(product).status));
    expect(statuses).toEqual(new Set<ModelStatus>(["Expectation At Risk", "Information Incomplete", "On Track"]));
    expect(countByTab(SEED_PRODUCTS, EMPTY_FILTERS)).toEqual({ active: 16, launched: 2, dropped: 1 });
  });
});

describe("seed dataset integrity", () => {
  it("has unique seven-digit IDs", () => {
    const ids = SEED_PRODUCTS.map((product) => product.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^\d{7}$/);
  });

  it("has valid ISO launch dates", () => {
    for (const product of SEED_PRODUCTS) {
      expect(product.launchDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(product.launchDate))).toBe(false);
    }
  });

  it("starts the SLA exactly when the product has no missing mandatory field", () => {
    for (const product of SEED_PRODUCTS.filter((candidate) => !candidate.lifecycle)) {
      const complete = assessProduct(product).completeness.missingMandatory.length === 0;
      expect(Boolean(product.infoCompleteAt), product.id).toBe(complete);
    }
  });

  it("only records a date change with both the previous date and when it changed", () => {
    for (const product of SEED_PRODUCTS) {
      expect(Boolean(product.previousLaunchDate), product.id).toBe(Boolean(product.launchDateChangedOn));
    }
  });
});

describe("views agree with each other", () => {
  it("filters by status to exactly the products with that status", () => {
    for (const status of ["Expectation At Risk", "Information Incomplete", "On Track"] as const) {
      const listed = filterProducts(SEED_PRODUCTS, { ...EMPTY_FILTERS, status }).map((product) => product.id);
      const expected = SEED_PRODUCTS.filter(
        (product) => !product.lifecycle && assessProduct(product).status === status,
      ).map((product) => product.id);

      expect(listed).toEqual(expected);
    }
  });

  it("never shows a launched or dropped product on the active tab", () => {
    const active = filterProducts(SEED_PRODUCTS, { ...EMPTY_FILTERS, tab: "active" });
    expect(active.some((product) => product.lifecycle)).toBe(false);
  });
});
