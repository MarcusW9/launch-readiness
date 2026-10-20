import { describe, expect, it } from "vitest";
import { getInformationActions, getInformationOverview, getMissingInformation } from "./information-overview";
import { makeProduct, stateAt, withoutInformation } from "./testing/fixtures";

describe("getInformationOverview", () => {
  it("has nothing missing for a fully prepared product", () => {
    const overview = getInformationOverview(makeProduct());
    expect(overview.missing).toEqual([]);
    expect(overview.available.length).toBeGreaterThan(0);
  });

  it("lists information used only by inapplicable activities as not required", () => {
    const overview = getInformationOverview(makeProduct());
    expect(overview.notRequired.map((item) => item.key)).toEqual([
      "regulatory-category",
      "variant-options",
      "variant-pricing",
      "photography-instructions",
      "shot-list",
      "styling-direction",
      "sample-availability",
      "safety-evidence",
    ]);
    expect(overview.notRequired.every((item) => item.impacts.length === 0)).toBe(true);
  });

  it("keeps information used by an applicable activity out of not required", () => {
    const keys = getInformationOverview(makeProduct()).notRequired.map((item) => item.key);
    expect(keys).not.toContain("dimensions");
    expect(keys).not.toContain("spec-sheet");
  });

  it("carries the value and source of available information", () => {
    const item = getInformationOverview(makeProduct()).available.find((entry) => entry.key === "spec-sheet");
    expect(item?.value).toBe("Final spec sheet received");
    expect(item?.source).toBe("team");
    expect(item?.neededBy).toEqual(["Product Content"]);
  });

  it("marks missing start information as blocking the activity", () => {
    const product = withoutInformation(
      makeProduct({ activities: { "product-content": stateAt("not-started") } }),
      "spec-sheet",
    );
    const [missing] = getInformationOverview(product).missing;
    expect(missing.key).toBe("spec-sheet");
    expect(missing.impacts).toEqual([
      {
        activityKey: "product-content",
        activityName: "Product Content",
        blocksStart: true,
        text: "Product Content: unable to start",
      },
    ]);
  });

  it("marks missing information on started work as needed before it can finish", () => {
    const product = withoutInformation(
      makeProduct({ activities: { "product-content": stateAt("in-progress") } }),
      "key-features",
    );
    const [missing] = getInformationOverview(product).missing;
    expect(missing.impacts[0].blocksStart).toBe(false);
    expect(missing.impacts[0].text).toBe("Product Content: needed before it can finish");
  });

  it("lists missing information with no impacts when the work is already complete", () => {
    const [missing] = getInformationOverview(withoutInformation(makeProduct(), "dimensions")).missing;
    expect(missing.key).toBe("dimensions");
    expect(missing.impacts).toEqual([]);
  });

  it("reports every activity that needs a missing item", () => {
    const product = withoutInformation(
      makeProduct({ activities: { "product-content": stateAt("in-progress") } }),
      "dimensions",
    );
    const [missing] = getInformationOverview(product).missing;
    expect(missing.neededBy).toEqual(["Product Content"]);
  });

  it("sorts items that block a start ahead of those that do not", () => {
    const product = withoutInformation(
      makeProduct({
        activities: { "product-setup": stateAt("in-progress"), "product-content": stateAt("not-started") },
      }),
      "supplier",
      "spec-sheet",
    );
    expect(getInformationOverview(product).missing.map((item) => item.key)).toEqual(["spec-sheet", "supplier"]);
  });
});

describe("getMissingInformation", () => {
  it("returns the missing items for a product being prepared", () => {
    const product = withoutInformation(makeProduct(), "dimensions");
    expect(getMissingInformation(product).map((item) => item.key)).toEqual(["dimensions"]);
  });

  it.each(["Live", "Offsale", "Dropped"] as const)("returns nothing for a %s product", (lifecycle) => {
    const product = withoutInformation(makeProduct({ lifecycle }), "dimensions", "spec-sheet");
    expect(getMissingInformation(product)).toEqual([]);
  });
});

describe("getInformationActions", () => {
  it("expresses missing information as imperative actions with an owner", () => {
    const product = withoutInformation(
      makeProduct({ activities: { "product-content": stateAt("in-progress") } }),
      "key-features",
      "spec-sheet",
    );
    const actions = getInformationActions(product);
    expect(actions.map((action) => action.action).sort()).toEqual([
      "Provide key features",
      "Provide supplier specification sheet",
    ]);
    expect(actions.find((action) => action.key === "key-features")?.neededFrom).toBe("Merchandising team");
    expect(actions.find((action) => action.key === "spec-sheet")?.neededFrom).toBe("Buying team");
  });

  it("returns no actions when nothing is missing", () => {
    expect(getInformationActions(makeProduct())).toEqual([]);
  });
});
