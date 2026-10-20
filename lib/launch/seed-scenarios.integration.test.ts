import { describe, expect, it } from "vitest";
import { ACTIVITY_DEFINITIONS, getStage, getStageIndex, resolveAllActivities } from "./activities";
import { SEED_PRODUCTS } from "./data";
import { EMPTY_FILTERS, filterProducts } from "./filters";
import { getInformationActions, getMissingInformation } from "./information-overview";
import {
  compareByUrgency,
  daysUntil,
  describeIssue,
  needsAttention,
  summariseReadiness,
} from "./readiness";
import type { InformationKey, LaunchStatus } from "./types";

interface Scenario {
  id: string;
  status: LaunchStatus;
  outstanding: number;
  missing: InformationKey[];
}

const SCENARIOS: Scenario[] = [
  { id: "1234567", status: "Action Required", outstanding: 1, missing: [] },
  { id: "2345678", status: "Action Required", outstanding: 2, missing: ["spec-sheet", "safety-evidence"] },
  { id: "3456789", status: "Action Required", outstanding: 1, missing: [] },
  { id: "4567890", status: "Ready", outstanding: 0, missing: [] },
  { id: "5678901", status: "At Risk", outstanding: 3, missing: ["sample-availability", "safety-evidence"] },
  { id: "6789012", status: "Action Required", outstanding: 1, missing: ["spec-sheet"] },
  { id: "7890123", status: "Action Required", outstanding: 1, missing: [] },
  { id: "8901234", status: "At Risk", outstanding: 1, missing: ["safety-evidence"] },
  { id: "9012345", status: "Ready", outstanding: 0, missing: [] },
  { id: "1023456", status: "Action Required", outstanding: 1, missing: [] },
  {
    id: "1134567",
    status: "Action Required",
    outstanding: 3,
    missing: ["variant-options", "photography-instructions", "sample-availability"],
  },
  { id: "1245678", status: "At Risk", outstanding: 1, missing: [] },
  { id: "1356789", status: "Ready", outstanding: 0, missing: [] },
  {
    id: "1467890",
    status: "Action Required",
    outstanding: 4,
    missing: ["variant-options", "spec-sheet", "styling-direction", "sample-availability", "safety-evidence"],
  },
  { id: "1578901", status: "Ready", outstanding: 0, missing: [] },
  { id: "1912345", status: "Ready", outstanding: 0, missing: [] },
  { id: "1689012", status: "Live", outstanding: 0, missing: [] },
  { id: "1790123", status: "Offsale", outstanding: 0, missing: [] },
  { id: "1801234", status: "Dropped", outstanding: 0, missing: [] },
];

describe("seed dataset scenarios", () => {
  it("covers every seeded product exactly once", () => {
    expect(SEED_PRODUCTS.map((p) => p.id).sort()).toEqual(SCENARIOS.map((s) => s.id).sort());
  });

  it.each(SCENARIOS)("$id resolves to $status with $outstanding outstanding", (scenario) => {
    const product = SEED_PRODUCTS.find((p) => p.id === scenario.id)!;
    const summary = summariseReadiness(product);
    expect(summary.launchStatus).toBe(scenario.status);
    expect(summary.outstanding).toHaveLength(scenario.outstanding);
    expect(getMissingInformation(product).map((item) => item.key)).toEqual(scenario.missing);
  });
});

describe("seed dataset integrity", () => {
  it("has unique seven-digit ids", () => {
    const ids = SEED_PRODUCTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^\d{7}$/);
  });

  it("has valid ISO launch dates", () => {
    for (const product of SEED_PRODUCTS) {
      expect(product.launchDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(daysUntil(product.launchDate))).toBe(false);
    }
  });

  it("only records stages that exist in the activity workflow", () => {
    for (const product of SEED_PRODUCTS) {
      for (const [key, state] of Object.entries(product.activities)) {
        const stages = ACTIVITY_DEFINITIONS[key as keyof typeof ACTIVITY_DEFINITIONS].workflow.map((s) => s.id);
        expect(stages, `${product.id} ${key}`).toContain(state!.stage);
      }
    }
  });

  it("only gives a product the imagery activity that matches its imagery source", () => {
    for (const product of SEED_PRODUCTS) {
      const wrongKey = product.characteristics.imagerySource === "studio" ? "supplier-imagery" : "studio-imagery";
      expect(product.activities[wrongKey], product.id).toBeUndefined();
    }
  });

  it("gives lifecycle products no outstanding work and no missing information", () => {
    for (const product of SEED_PRODUCTS.filter((p) => p.lifecycle)) {
      expect(summariseReadiness(product).outstanding, product.id).toEqual([]);
      expect(getMissingInformation(product), product.id).toEqual([]);
    }
  });
});

describe("activity resolution across the dataset", () => {
  const resolved = SEED_PRODUCTS.flatMap((product) =>
    resolveAllActivities(product).map((activity) => ({ product, activity })),
  );

  it("marks an activity Not Required exactly when it does not apply", () => {
    for (const { product, activity } of resolved) {
      expect(activity.applies === false, `${product.id} ${activity.def.key}`).toBe(activity.workState === "Not Required");
    }
  });

  it("only blocks a start while the activity is still at its first stage", () => {
    for (const { product, activity } of resolved) {
      if (activity.information.blockingStart.length > 0) {
        expect(getStageIndex(activity.def, activity.state!), `${product.id} ${activity.def.key}`).toBe(0);
        expect(activity.workState).toBe("Awaiting information");
      }
    }
  });

  it("keeps blocking-start information a subset of missing information", () => {
    for (const { activity } of resolved) {
      for (const key of activity.information.blockingStart) {
        expect(activity.information.missing).toContain(key);
      }
    }
  });

  it("never reports missing information for complete work", () => {
    for (const { activity } of resolved.filter((r) => r.activity.status === "Complete")) {
      expect(activity.information.blockingFinish).toEqual([]);
    }
  });

  it("always ends a complete activity on its final workflow stage", () => {
    for (const { activity } of resolved.filter((r) => r.activity.applies && r.activity.status === "Complete")) {
      expect(getStage(activity.def, activity.state!).status).toBe("Complete");
    }
  });

  it("gives every outstanding activity a readable issue and a next action", () => {
    for (const product of SEED_PRODUCTS) {
      for (const activity of summariseReadiness(product).outstanding) {
        expect(describeIssue(activity).length, `${product.id} ${activity.def.key}`).toBeGreaterThan(0);
        expect(activity.nextAction.length, `${product.id} ${activity.def.key}`).toBeGreaterThan(0);
      }
    }
  });

  it("explains Awaiting information issues in terms of what is missing", () => {
    for (const { product, activity } of resolved.filter((r) => r.activity.workState === "Awaiting information")) {
      expect(describeIssue(activity), `${product.id} ${activity.def.key}`).toMatch(/cannot (start|brief).*missing$/);
    }
  });
});

describe("views agree with each other", () => {
  const count = (filters: Parameters<typeof filterProducts>[1]) => filterProducts(SEED_PRODUCTS, filters).length;

  it("partitions the dataset by status with no overlap or gaps", () => {
    const counts = {
      "Action Required": 8,
      "At Risk": 3,
      Ready: 5,
      Live: 1,
      Offsale: 1,
      Dropped: 1,
    } as const;
    for (const [readiness, expected] of Object.entries(counts)) {
      expect(count({ ...EMPTY_FILTERS, readiness: readiness as keyof typeof counts }), readiness).toBe(expected);
    }
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(SEED_PRODUCTS.length);
  });

  it("matches the Action Required view to the Action Required and At Risk filters", () => {
    const attention = SEED_PRODUCTS.filter(needsAttention).map((p) => p.id).sort();
    const fromFilters = [
      ...filterProducts(SEED_PRODUCTS, { ...EMPTY_FILTERS, readiness: "Action Required" }),
      ...filterProducts(SEED_PRODUCTS, { ...EMPTY_FILTERS, readiness: "At Risk" }),
    ]
      .map((p) => p.id)
      .sort();
    expect(attention).toHaveLength(11);
    expect(fromFilters).toEqual(attention);
  });

  it("matches the information filter to the missing-information scenarios", () => {
    const expected = SCENARIOS.filter((s) => s.missing.length > 0).map((s) => s.id);
    const actual = filterProducts(SEED_PRODUCTS, { ...EMPTY_FILTERS, information: "missing" }).map((p) => p.id);
    expect(actual).toEqual(expected);
    expect(actual).toHaveLength(6);
  });

  it("matches each outstanding filter to the resolved activity state", () => {
    for (const key of ["product-setup", "variants", "product-content", "compliance"] as const) {
      const expected = SEED_PRODUCTS.filter((p) =>
        summariseReadiness(p).outstanding.some((a) => a.def.key === key),
      ).map((p) => p.id);
      const actual = filterProducts(SEED_PRODUCTS, { ...EMPTY_FILTERS, outstanding: key }).map((p) => p.id);
      expect(actual, key).toEqual(expected);
    }
  });

  it("produces one action per missing information item", () => {
    for (const product of SEED_PRODUCTS) {
      expect(getInformationActions(product).map((a) => a.key), product.id).toEqual(
        getMissingInformation(product).map((i) => i.key),
      );
    }
  });

  it("never lists past launches under upcoming windows", () => {
    for (const window of ["7", "14", "30"] as const) {
      for (const product of filterProducts(SEED_PRODUCTS, { ...EMPTY_FILTERS, window })) {
        expect(daysUntil(product.launchDate), `${window} ${product.id}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("sorts the whole dataset by urgency", () => {
    const sorted = [...SEED_PRODUCTS].sort(compareByUrgency).map((p) => p.id);
    // Products sharing a launch date within a status keep their seed order.
    expect(sorted).toEqual([
      "5678901",
      "1245678",
      "8901234",
      "1234567",
      "2345678",
      "1023456",
      "3456789",
      "6789012",
      "7890123",
      "1134567",
      "1467890",
      "4567890",
      "1578901",
      "1356789",
      "9012345",
      "1912345",
      "1689012",
      "1790123",
      "1801234",
    ]);
  });
});
