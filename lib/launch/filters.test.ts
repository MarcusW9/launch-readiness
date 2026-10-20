import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  INFORMATION_OPTIONS,
  LAUNCH_WINDOW_OPTIONS,
  OUTSTANDING_OPTIONS,
  READINESS_OPTIONS,
  activityLabel,
  filterProducts,
  getCategories,
  isInformationFilter,
  isOutstandingFilter,
  isReadinessFilter,
  type ProductFilters,
} from "./filters";
import { makeProduct, stateAt, withoutInformation } from "./testing/fixtures";

const atRiskTable = makeProduct({
  id: "1000001",
  name: "Oak Table",
  brand: "Oakline",
  category: "Furniture",
  launchDate: "2026-11-15",
  activities: { "product-content": stateAt("in-progress") },
});

const missingInfoCushion = withoutInformation(
  makeProduct({
    id: "1000002",
    name: "Linen Cushion",
    brand: "Hearthwell",
    category: "Textiles",
    launchDate: "2026-11-30",
    activities: { "supplier-imagery": stateAt("not-started") },
  }),
  "image-delivery",
);

const readyLamp = makeProduct({
  id: "1000003",
  name: "Brass Lamp",
  brand: "Oakline",
  category: "Lighting",
  launchDate: "2026-12-30",
});

const liveSofa = makeProduct({
  id: "1000004",
  name: "Old Sofa",
  brand: "Hearthwell",
  category: "Furniture",
  launchDate: "2026-10-01",
  lifecycle: "Live",
  activities: { "product-content": stateAt("not-started") },
});

const variantChair = makeProduct({
  id: "1000005",
  name: "Variant Chair",
  brand: "Oakline",
  category: "Furniture",
  launchDate: "2026-12-05",
  characteristics: { hasVariants: true },
  activities: { variants: stateAt("in-progress") },
});

const catalogue = [atRiskTable, missingInfoCushion, readyLamp, liveSofa, variantChair];

function ids(filters: Partial<ProductFilters>) {
  return filterProducts(catalogue, { ...EMPTY_FILTERS, ...filters }).map((product) => product.id);
}

describe("filterProducts", () => {
  it("returns every product, in order, for empty filters", () => {
    expect(ids({})).toEqual(["1000001", "1000002", "1000003", "1000004", "1000005"]);
  });

  it("returns a new array and leaves the input untouched", () => {
    const input = [...catalogue];
    const result = filterProducts(input, EMPTY_FILTERS);
    expect(result).not.toBe(input);
    expect(input).toEqual(catalogue);
  });

  describe("search", () => {
    it("matches name, id and brand without regard to case", () => {
      expect(ids({ query: "TABLE" })).toEqual(["1000001"]);
      expect(ids({ query: "1000003" })).toEqual(["1000003"]);
      expect(ids({ query: "oakline" })).toEqual(["1000001", "1000003", "1000005"]);
    });

    it("trims whitespace around the query", () => {
      expect(ids({ query: "  lamp  " })).toEqual(["1000003"]);
    });

    it("treats a whitespace-only query as no query", () => {
      expect(ids({ query: "   " })).toHaveLength(5);
    });

    it("returns nothing when nothing matches", () => {
      expect(ids({ query: "zzz" })).toEqual([]);
    });
  });

  it("filters by category", () => {
    expect(ids({ category: "Furniture" })).toEqual(["1000001", "1000004", "1000005"]);
    expect(ids({ category: "Garden" })).toEqual([]);
  });

  describe("status", () => {
    it("filters by readiness", () => {
      expect(ids({ readiness: "At Risk" })).toEqual(["1000001"]);
      expect(ids({ readiness: "Action Required" })).toEqual(["1000002", "1000005"]);
      expect(ids({ readiness: "Ready" })).toEqual(["1000003"]);
    });

    it("filters by lifecycle status", () => {
      expect(ids({ readiness: "Live" })).toEqual(["1000004"]);
      expect(ids({ readiness: "Dropped" })).toEqual([]);
    });
  });

  describe("launch window", () => {
    it("includes products launching within the window, boundary included", () => {
      expect(ids({ window: "7" })).toEqual(["1000001"]);
      expect(ids({ window: "14" })).toEqual(["1000001"]);
      expect(ids({ window: "30" })).toEqual(["1000001", "1000002", "1000005"]);
    });

    it("excludes products that launched in the past from upcoming windows", () => {
      expect(ids({ window: "7" })).not.toContain("1000004");
      expect(ids({ window: "30" })).not.toContain("1000004");
    });

    it("selects only products more than 30 days away for later", () => {
      expect(ids({ window: "later" })).toEqual(["1000003"]);
    });
  });

  describe("outstanding activity", () => {
    it("finds products with outstanding work of a given type", () => {
      expect(ids({ outstanding: "product-content" })).toEqual(["1000001"]);
      expect(ids({ outstanding: "variants" })).toEqual(["1000005"]);
    });

    it("treats imagery as whichever imagery activity applies", () => {
      expect(ids({ outstanding: "imagery" })).toEqual(["1000002"]);
    });

    it("never matches an activity that does not apply", () => {
      expect(ids({ outstanding: "compliance" })).toEqual([]);
    });

    it("ignores products that are no longer being prepared", () => {
      expect(ids({ outstanding: "product-content" })).not.toContain("1000004");
    });
  });

  describe("information", () => {
    it("keeps only products with missing information", () => {
      expect(ids({ information: "missing" })).toEqual(["1000002"]);
    });

    it("does not count missing information on Live products", () => {
      const sofa = withoutInformation(liveSofa, "spec-sheet");
      expect(filterProducts([sofa], { ...EMPTY_FILTERS, information: "missing" })).toEqual([]);
    });
  });

  it("combines filters with AND", () => {
    expect(ids({ category: "Furniture", readiness: "Action Required" })).toEqual(["1000005"]);
    expect(ids({ window: "30", information: "missing" })).toEqual(["1000002"]);
    expect(ids({ category: "Textiles", readiness: "Ready" })).toEqual([]);
  });
});

describe("getCategories", () => {
  it("returns unique categories in alphabetical order", () => {
    expect(getCategories(catalogue)).toEqual(["Furniture", "Lighting", "Textiles"]);
  });

  it("returns an empty list for no products", () => {
    expect(getCategories([])).toEqual([]);
  });
});

describe("type guards", () => {
  it("accepts every status option except all", () => {
    for (const option of READINESS_OPTIONS.filter((o) => o.value !== "all")) {
      expect(isReadinessFilter(option.value)).toBe(true);
    }
    expect(isReadinessFilter("all")).toBe(false);
    expect(isReadinessFilter("ready")).toBe(false);
    expect(isReadinessFilter(undefined)).toBe(false);
  });

  it("accepts the outstanding options and rejects internal activity keys", () => {
    for (const option of OUTSTANDING_OPTIONS) expect(isOutstandingFilter(option.value)).toBe(true);
    expect(isOutstandingFilter("studio-imagery")).toBe(false);
    expect(isOutstandingFilter(undefined)).toBe(false);
  });

  it("accepts only the known information options", () => {
    for (const option of INFORMATION_OPTIONS) expect(isInformationFilter(option.value)).toBe(true);
    expect(isInformationFilter("present")).toBe(false);
    expect(isInformationFilter(undefined)).toBe(false);
  });
});

describe("options and labels", () => {
  it("starts every option list with the unfiltered choice", () => {
    expect(READINESS_OPTIONS[0].value).toBe("all");
    expect(LAUNCH_WINDOW_OPTIONS[0].value).toBe("all");
    expect(OUTSTANDING_OPTIONS[0].value).toBe("all");
    expect(INFORMATION_OPTIONS[0].value).toBe("all");
  });

  it("uses the activity name as its label", () => {
    expect(activityLabel("studio-imagery")).toBe("Studio Imagery");
    expect(activityLabel("product-setup")).toBe("Product Setup");
  });
});
