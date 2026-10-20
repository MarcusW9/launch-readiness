import { describe, expect, it } from "vitest";
import { resolveActivity } from "./activities";
import {
  AT_RISK_WITHIN_DAYS,
  DEMO_TODAY,
  compareByUrgency,
  daysUntil,
  describeDaysToLaunch,
  describeIssue,
  formatLongDate,
  formatShortDate,
  formatTimestamp,
  needsAttention,
  summariseReadiness,
} from "./readiness";
import { makeProduct, stateAt, withActivity, withoutInformation } from "./testing/fixtures";

const IN_10_DAYS = "2026-11-20";
const IN_11_DAYS = "2026-11-21";
const IN_25_DAYS = "2026-12-05";
const FIVE_DAYS_AGO = "2026-11-05";

describe("daysUntil", () => {
  it("counts whole days from the fixed demo date", () => {
    expect(DEMO_TODAY).toBe("2026-11-10");
    expect(daysUntil("2026-11-24")).toBe(14);
    expect(daysUntil(DEMO_TODAY)).toBe(0);
  });

  it("returns negative numbers for past dates", () => {
    expect(daysUntil("2026-11-09")).toBe(-1);
    expect(daysUntil(FIVE_DAYS_AGO)).toBe(-5);
  });

  it("accepts a custom origin and handles month and leap-year boundaries", () => {
    expect(daysUntil("2026-03-01", "2026-02-28")).toBe(1);
    expect(daysUntil("2028-03-01", "2028-02-28")).toBe(2);
    expect(daysUntil("2027-01-01", "2026-12-31")).toBe(1);
  });
});

describe("summariseReadiness", () => {
  it("is Ready when every applicable activity is complete", () => {
    const summary = summariseReadiness(makeProduct());
    expect(summary.readiness).toBe("Ready");
    expect(summary.launchStatus).toBe("Ready");
    expect(summary.isPreparing).toBe(true);
    expect(summary.outstanding).toEqual([]);
    expect(summary.complete.map((a) => a.def.key)).toEqual([
      "product-setup",
      "supplier-imagery",
      "product-content",
    ]);
  });

  it("only counts activities that apply to the product", () => {
    const summary = summariseReadiness(makeProduct());
    expect(summary.applicable.map((a) => a.def.key)).not.toContain("variants");
    expect(summary.applicable.map((a) => a.def.key)).not.toContain("studio-imagery");
    expect(summary.applicable.map((a) => a.def.key)).not.toContain("compliance");
  });

  it("is Action Required when work is outstanding and launch is far away", () => {
    const product = makeProduct({
      launchDate: IN_25_DAYS,
      activities: { "product-content": stateAt("in-progress") },
    });
    const summary = summariseReadiness(product);
    expect(summary.readiness).toBe("Action Required");
    expect(summary.outstanding.map((a) => a.def.key)).toEqual(["product-content"]);
    expect(summary.daysToLaunch).toBe(25);
  });

  it("flips to At Risk exactly at the threshold", () => {
    expect(AT_RISK_WITHIN_DAYS).toBe(10);
    const incomplete = { "product-content": stateAt("in-progress") };

    expect(summariseReadiness(makeProduct({ launchDate: IN_10_DAYS, activities: incomplete })).readiness).toBe(
      "At Risk",
    );
    expect(summariseReadiness(makeProduct({ launchDate: IN_11_DAYS, activities: incomplete })).readiness).toBe(
      "Action Required",
    );
  });

  it("is At Risk when work is outstanding and the launch date has already passed", () => {
    const product = makeProduct({
      launchDate: FIVE_DAYS_AGO,
      activities: { "product-content": stateAt("not-started") },
    });
    expect(summariseReadiness(product).readiness).toBe("At Risk");
  });

  it("stays Ready close to launch when nothing is outstanding", () => {
    expect(summariseReadiness(makeProduct({ launchDate: "2026-11-11" })).readiness).toBe("Ready");
  });

  it("treats a blocked activity as outstanding", () => {
    const product = makeProduct({
      launchDate: IN_25_DAYS,
      activities: { "product-setup": stateAt("in-progress", { blocked: true, blockedReason: "Waiting on supplier" }) },
    });
    expect(summariseReadiness(product).outstanding.map((a) => a.status)).toEqual(["Blocked"]);
  });

  it.each(["Live", "Offsale", "Dropped"] as const)(
    "shows the %s lifecycle status and never counts outstanding work",
    (lifecycle) => {
      const product = makeProduct({
        lifecycle,
        launchDate: FIVE_DAYS_AGO,
        activities: { "product-content": stateAt("not-started") },
      });
      const summary = summariseReadiness(product);
      expect(summary.launchStatus).toBe(lifecycle);
      expect(summary.isPreparing).toBe(false);
      expect(summary.outstanding).toEqual([]);
    },
  );
});

describe("needsAttention", () => {
  it("is false for a Ready product", () => {
    expect(needsAttention(makeProduct())).toBe(false);
  });

  it("is true for Action Required and At Risk products", () => {
    const incomplete = { "product-content": stateAt("in-progress") };
    expect(needsAttention(makeProduct({ launchDate: IN_25_DAYS, activities: incomplete }))).toBe(true);
    expect(needsAttention(makeProduct({ launchDate: IN_10_DAYS, activities: incomplete }))).toBe(true);
  });

  it("is false for products that are no longer being prepared", () => {
    const product = makeProduct({ lifecycle: "Live", activities: { "product-content": stateAt("not-started") } });
    expect(needsAttention(product)).toBe(false);
  });
});

describe("describeIssue", () => {
  it("names the missing information that stops an activity starting", () => {
    const product = withoutInformation(
      makeProduct({ characteristics: { hasVariants: true }, activities: { variants: stateAt("not-started") } }),
      "variant-options",
    );
    expect(describeIssue(resolveActivity(product, "variants"))).toBe(
      "Variants cannot start: size and colour options missing",
    );
  });

  it("summarises additional blocking information as a count", () => {
    const base = makeProduct({
      characteristics: { imagerySource: "studio" },
      activities: { "studio-imagery": stateAt("required") },
    });
    const one = withoutInformation(base, "photography-instructions");
    const two = withoutInformation(base, "photography-instructions", "shot-list");

    expect(describeIssue(resolveActivity(one, "studio-imagery"))).toBe(
      "Studio Imagery cannot brief: photography instructions missing",
    );
    expect(describeIssue(resolveActivity(two, "studio-imagery"))).toBe(
      "Studio Imagery cannot brief: photography instructions and 1 more missing",
    );
  });

  it("says ready to start when nothing blocks the first step", () => {
    const product = makeProduct({ activities: { "product-content": stateAt("not-started") } });
    expect(describeIssue(resolveActivity(product, "product-content"))).toBe("Product Content ready to start");
  });

  it("says incomplete once work is under way", () => {
    const product = makeProduct({ activities: { "product-content": stateAt("in-progress") } });
    expect(describeIssue(resolveActivity(product, "product-content"))).toBe("Product Content incomplete");
  });

  it("falls back to the plain activity name when there is no issue to describe", () => {
    const complete = makeProduct();
    const notRequired = makeProduct();

    expect(describeIssue(resolveActivity(complete, "product-content"))).toBe("Product Content");
    expect(describeIssue(resolveActivity(notRequired, "variants"))).toBe("Variants");
  });

  it("includes the blocked reason when there is one", () => {
    const withReason = makeProduct({
      activities: { "product-setup": stateAt("in-progress", { blocked: true, blockedReason: "Supplier has not confirmed cost" }) },
    });
    const withoutReason = makeProduct({
      activities: { "product-setup": stateAt("in-progress", { blocked: true }) },
    });
    expect(describeIssue(resolveActivity(withReason, "product-setup"))).toBe(
      "Product Setup blocked: Supplier has not confirmed cost",
    );
    expect(describeIssue(resolveActivity(withoutReason, "product-setup"))).toBe("Product Setup blocked");
  });

  it("falls back to the plain name for complete work", () => {
    expect(describeIssue(resolveActivity(makeProduct(), "product-content"))).toBe("Product Content");
  });
});

describe("compareByUrgency", () => {
  const incomplete = { "product-content": stateAt("in-progress") };
  const atRisk = makeProduct({ id: "A", launchDate: "2026-11-12", activities: incomplete });
  const actionSoon = makeProduct({ id: "B", launchDate: "2026-11-30", activities: incomplete });
  const actionLater = makeProduct({ id: "C", launchDate: "2026-12-20", activities: incomplete });
  const ready = makeProduct({ id: "D", launchDate: "2026-11-15" });
  const live = makeProduct({ id: "E", lifecycle: "Live", launchDate: "2026-10-01" });
  const offsale = makeProduct({ id: "F", lifecycle: "Offsale", launchDate: "2026-09-01" });
  const dropped = makeProduct({ id: "G", lifecycle: "Dropped", launchDate: "2026-12-01" });

  it("orders by status first, then by earliest launch date", () => {
    const sorted = [dropped, actionLater, live, ready, offsale, actionSoon, atRisk].sort(compareByUrgency);
    expect(sorted.map((p) => p.id)).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("is zero only for the same status and date", () => {
    expect(compareByUrgency(actionSoon, actionSoon)).toBe(0);
    expect(compareByUrgency(actionSoon, actionLater)).toBeLessThan(0);
    expect(compareByUrgency(actionLater, actionSoon)).toBeGreaterThan(0);
  });

  it("does not mutate the activities it reads", () => {
    const before = JSON.stringify(atRisk);
    compareByUrgency(atRisk, ready);
    expect(JSON.stringify(atRisk)).toBe(before);
  });
});

describe("date formatting", () => {
  it("formats short and long dates without zero padding", () => {
    expect(formatShortDate("2026-11-24")).toBe("24 Nov");
    expect(formatShortDate("2026-01-05")).toBe("5 Jan");
    expect(formatLongDate("2026-12-31")).toBe("31 Dec 2026");
  });

  it("formats timestamps and defaults a missing time to midnight", () => {
    expect(formatTimestamp("2026-11-10T09:30:00")).toBe("10 Nov, 09:30");
    expect(formatTimestamp("2026-11-10")).toBe("10 Nov, 00:00");
  });

  it("describes the distance to launch in plain language", () => {
    expect(describeDaysToLaunch(0)).toBe("Today");
    expect(describeDaysToLaunch(1)).toBe("Tomorrow");
    expect(describeDaysToLaunch(14)).toBe("In 14 days");
    expect(describeDaysToLaunch(-21)).toBe("21 days ago");
  });

  it("uses the singular for exactly one day ago", () => {
    expect(describeDaysToLaunch(-1)).toBe("1 day ago");
  });
});

describe("activity changes feed readiness", () => {
  it("moves a product to Ready when its last outstanding activity completes", () => {
    const product = makeProduct({ launchDate: IN_25_DAYS, activities: { "product-content": stateAt("in-progress") } });
    expect(summariseReadiness(product).readiness).toBe("Action Required");

    const finished = withActivity(product, "product-content", stateAt("complete"));
    expect(summariseReadiness(finished).readiness).toBe("Ready");
  });
});
