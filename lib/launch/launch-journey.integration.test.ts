import { describe, expect, it } from "vitest";
import { getStage, resolveActivity } from "./activities";
import { SEED_PRODUCTS } from "./data";
import { EMPTY_FILTERS, filterProducts } from "./filters";
import { getInformationActions, getMissingInformation } from "./information-overview";
import { describeIssue, needsAttention, summariseReadiness } from "./readiness";
import { stateAt, withActivity, withInformation } from "./testing/fixtures";
import type { Product } from "./types";

function seed(id: string): Product {
  const product = SEED_PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`Seed product ${id} not found`);
  return product;
}

function completeOutstandingWork(product: Product): Product {
  let updated = product;
  for (const activity of summariseReadiness(product).outstanding) {
    const finalStage = activity.def.workflow[activity.def.workflow.length - 1];
    updated = withActivity(updated, activity.def.key, stateAt(finalStage.id));
  }
  return updated;
}

describe("providing missing information (variants awaiting size and colour options)", () => {
  const before = seed("1134567");
  const after = withInformation(before, "variant-options", "Sizes S-XL, three colours");

  it("starts out unable to start, with a clear reason", () => {
    const variants = resolveActivity(before, "variants");
    expect(variants.workState).toBe("Awaiting information");
    expect(variants.nextAction).toBe("Provide size and colour options");
    expect(describeIssue(variants)).toBe("Variants cannot start: size and colour options missing");
  });

  it("becomes ready to start once the information is provided", () => {
    const variants = resolveActivity(after, "variants");
    expect(variants.workState).toBe("Ready to start");
    expect(variants.information.blockingStart).toEqual([]);
    expect(describeIssue(variants)).toBe("Variants ready to start");
  });

  it("removes only that item from the missing list", () => {
    expect(getMissingInformation(before).map((i) => i.key)).toContain("variant-options");
    expect(getMissingInformation(after).map((i) => i.key)).toEqual(["photography-instructions", "sample-availability"]);
    expect(getInformationActions(after)).toHaveLength(2);
  });

  it("does not by itself make the product ready", () => {
    expect(summariseReadiness(after).outstanding).toHaveLength(3);
    expect(summariseReadiness(after).readiness).toBe("Action Required");
    expect(needsAttention(after)).toBe(true);
  });

  it("does not mutate the original product", () => {
    expect(before.information["variant-options"]).toBeUndefined();
  });

  it("drops the product from the information filter once nothing is missing", () => {
    let product = before;
    for (const item of getMissingInformation(before)) product = withInformation(product, item.key);
    const results = filterProducts([product], { ...EMPTY_FILTERS, information: "missing" });
    expect(results).toEqual([]);
  });
});

describe("advancing work", () => {
  it("moves a started activity forward until the product is Ready", () => {
    const product = seed("1234567");
    expect(summariseReadiness(product).readiness).toBe("Action Required");

    const finished = completeOutstandingWork(product);
    expect(summariseReadiness(finished).readiness).toBe("Ready");
    expect(needsAttention(finished)).toBe(false);
    expect(summariseReadiness(finished).outstanding).toEqual([]);
  });

  it("makes every preparing seed product Ready when its outstanding work is completed", () => {
    for (const product of SEED_PRODUCTS.filter((p) => !p.lifecycle)) {
      const finished = completeOutstandingWork(product);
      expect(summariseReadiness(finished).readiness, product.id).toBe("Ready");
    }
  });

  it("lands every completed activity on a Complete workflow stage", () => {
    const finished = completeOutstandingWork(seed("1467890"));
    for (const activity of summariseReadiness(finished).applicable) {
      expect(getStage(activity.def, activity.state!).status, activity.def.key).toBe("Complete");
    }
  });

  it("clears Blocked status when the blocked activity is completed", () => {
    const blocked = withActivity(
      seed("4567890"),
      "product-content",
      stateAt("in-progress", { blocked: true, blockedReason: "Awaiting legal copy" }),
    );
    expect(resolveActivity(blocked, "product-content").status).toBe("Blocked");

    const unblocked = withActivity(blocked, "product-content", stateAt("complete"));
    expect(resolveActivity(unblocked, "product-content").status).toBe("Complete");
    expect(summariseReadiness(unblocked).readiness).toBe("Ready");
  });
});

describe("the calendar", () => {
  it("escalates a product to At Risk as its launch date approaches", () => {
    const product = seed("1134567");
    expect(summariseReadiness(product).readiness).toBe("Action Required");

    const imminent = { ...product, launchDate: "2026-11-15" };
    expect(summariseReadiness(imminent).readiness).toBe("At Risk");
    expect(filterProducts([imminent], { ...EMPTY_FILTERS, window: "7" })).toHaveLength(1);
  });

  it("keeps a Ready product Ready as its launch date approaches", () => {
    const imminent = { ...seed("4567890"), launchDate: "2026-11-11" };
    expect(summariseReadiness(imminent).readiness).toBe("Ready");
  });

  it("stops counting outstanding work once a product goes Live", () => {
    const product = seed("1134567");
    expect(summariseReadiness(product).outstanding).toHaveLength(3);

    const live = { ...product, lifecycle: "Live" as const };
    const summary = summariseReadiness(live);
    expect(summary.launchStatus).toBe("Live");
    expect(summary.outstanding).toEqual([]);
    expect(getMissingInformation(live)).toEqual([]);
    expect(needsAttention(live)).toBe(false);
  });
});
