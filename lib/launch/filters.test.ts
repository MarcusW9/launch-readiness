import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  LAUNCH_WINDOW_OPTIONS,
  NOT_ASSIGNED,
  countByTab,
  filterProducts,
  getBrands,
  getCategories,
  getCriticalPaths,
  getProductTab,
  getRanges,
  isFlagFilter,
  isStatusFilter,
  type ProductFilters,
} from "./filters";
import { makeProduct, withMissingFields } from "./testing/fixtures";

const atRiskTable = makeProduct({
  id: "1000001",
  name: "Oak Table",
  brand: "Oakline",
  category: "Furniture",
  range: "Dining",
  criticalPath: "AW26 PH1",
  launchDate: "2026-11-20",
  infoCompleteAt: "2026-11-02",
});

const incompleteCushion = withMissingFields(
  makeProduct({
    id: "1000002",
    name: "Linen Cushion",
    brand: "Hearthwell",
    category: "Textiles",
    range: undefined,
    criticalPath: undefined,
    launchDate: "2026-11-30",
  }),
  "supplierName",
);

const onTrackLamp = makeProduct({
  id: "1000003",
  name: "Brass Lamp",
  brand: "Oakline",
  category: "Lighting",
  range: "Living room",
  launchDate: "2026-12-30",
});

const liveSofa = makeProduct({ id: "1000004", name: "Old Sofa", brand: "Hearthwell", category: "Furniture", launchDate: "2026-10-01", lifecycle: "Live" });
const droppedChair = makeProduct({ id: "1000005", name: "Dropped Chair", category: "Furniture", lifecycle: "Dropped" });
const changedShelf = makeProduct({
  id: "1000006",
  name: "Moved Shelf",
  launchDate: "2026-12-20",
  previousLaunchDate: "2026-12-01",
  launchDateChangedOn: "2026-11-08",
});
const lateStockDesk = makeProduct({ id: "1000007", name: "Late Desk", launchDate: "2026-12-20", stockLandsDate: "2027-01-10" });

const catalogue = [atRiskTable, incompleteCushion, onTrackLamp, liveSofa, droppedChair, changedShelf, lateStockDesk];

function ids(filters: Partial<ProductFilters>) {
  return filterProducts(catalogue, { ...EMPTY_FILTERS, ...filters }).map((product) => product.id);
}

describe("filterProducts", () => {
  it("returns every product, in order, for empty filters", () => {
    expect(ids({})).toEqual(catalogue.map((product) => product.id));
  });

  it("searches name, ID, brand, range and critical path, ignoring case and spacing", () => {
    expect(ids({ query: "  oak TABLE " })).toEqual(["1000001"]);
    expect(ids({ query: "1000003" })).toEqual(["1000003"]);
    expect(ids({ query: "hearthwell" })).toEqual(["1000002", "1000004"]);
    expect(ids({ query: "dining" })).toEqual(["1000001"]);
    expect(ids({ query: "aw26" })).toContain("1000001");
  });

  it("filters by category, brand, range and critical path", () => {
    expect(ids({ category: "Lighting" })).toEqual(["1000003"]);
    expect(ids({ brand: "Hearthwell" })).toEqual(["1000002", "1000004"]);
    expect(ids({ range: "Dining" })).toEqual(["1000001"]);
    expect(ids({ criticalPath: "AW26 PH1" })).toContain("1000001");
  });

  it("matches products with no range or critical path on the not-assigned value", () => {
    expect(ids({ range: NOT_ASSIGNED })).toEqual(["1000002"]);
    expect(ids({ criticalPath: NOT_ASSIGNED })).toEqual(["1000002"]);
  });

  it("filters by the calculated status, only for products still being prepared", () => {
    expect(ids({ status: "Expectation At Risk" })).toEqual(["1000001"]);
    expect(ids({ status: "Information Incomplete" })).toEqual(["1000002"]);
    expect(ids({ status: "On Track" })).not.toContain("1000004");
  });

  it("filters by the Date Changed and stock flags", () => {
    expect(ids({ flag: "dateChanged" })).toEqual(["1000006"]);
    expect(ids({ flag: "stockAfterLaunch" })).toEqual(["1000007"]);
  });

  it("filters by launch window", () => {
    expect(ids({ window: "14" })).toEqual(["1000001"]);
    expect(ids({ window: "30" })).toEqual(["1000001", "1000002"]);
    expect(ids({ window: "later" })).toEqual(["1000003", "1000005", "1000006", "1000007"]);
  });

  it("combines filters", () => {
    expect(ids({ category: "Furniture", status: "Expectation At Risk" })).toEqual(["1000001"]);
    expect(ids({ category: "Lighting", status: "Expectation At Risk" })).toEqual([]);
  });

  it("does not change the input", () => {
    const input = [...catalogue];
    filterProducts(input, { ...EMPTY_FILTERS, query: "oak" });
    expect(input).toEqual(catalogue);
  });
});

describe("tabs", () => {
  it("puts products on a tab by lifecycle", () => {
    expect(getProductTab(onTrackLamp)).toBe("active");
    expect(getProductTab(liveSofa)).toBe("launched");
    expect(getProductTab(makeProduct({ lifecycle: "Offsale" }))).toBe("launched");
    expect(getProductTab(droppedChair)).toBe("dropped");
  });

  it("filters by tab", () => {
    expect(ids({ tab: "launched" })).toEqual(["1000004"]);
    expect(ids({ tab: "dropped" })).toEqual(["1000005"]);
  });

  it("counts each tab with every other filter applied", () => {
    expect(countByTab(catalogue, { ...EMPTY_FILTERS, tab: "dropped" })).toEqual({ active: 5, launched: 1, dropped: 1 });
    expect(countByTab(catalogue, { ...EMPTY_FILTERS, category: "Furniture" })).toEqual({ active: 3, launched: 1, dropped: 1 });
  });
});

describe("filter choices", () => {
  it("lists categories and brands once, sorted", () => {
    expect(getCategories(catalogue)).toEqual(["Furniture", "Lighting", "Textiles"]);
    expect(getBrands(catalogue)).toEqual(["Hearthwell", "Oakline"]);
  });

  it("lists ranges and critical paths with the not-assigned value first when any product lacks one", () => {
    expect(getRanges(catalogue)[0]).toBe(NOT_ASSIGNED);
    expect(getRanges(catalogue)).toContain("Dining");
    expect(getCriticalPaths([onTrackLamp])).toEqual(["AW26 PH1"]);
  });

  it("offers launch windows and recognises valid status and flag values", () => {
    expect(LAUNCH_WINDOW_OPTIONS.map((option) => option.value)).toEqual(["all", "7", "14", "30", "later"]);
    expect(isStatusFilter("On Track")).toBe(true);
    expect(isStatusFilter("Ready")).toBe(false);
    expect(isStatusFilter(undefined)).toBe(false);
    expect(isFlagFilter("dateChanged")).toBe(true);
    expect(isFlagFilter("all")).toBe(false);
  });
});
