import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { getProductTab } from "./filters";
import { assessProduct } from "./readiness-model";
import {
  buildStudioCsv,
  displayValue,
  EMPTY_STUDIO_FILTERS,
  filterStudioProducts,
  getStudioCriticalPath,
  getStudioOptions,
  groupByStyle,
  isDataError,
  STUDIO_COLUMNS,
  studioCsvFileName,
} from "./studio";
import { makeProduct } from "./testing/fixtures";

const sofa = makeProduct({
  id: "2000001",
  name: "Oslo Sofa",
  criticalPath: "AW26 PH1",
  launchDate: "2026-12-01",
  studio: { customerStylePreference: "Scandi", imageSource: "Studio shoot", components: "Frame, legs" },
});
const lamp = makeProduct({
  id: "2000002",
  name: "Brass Lamp",
  criticalPath: "AW26 PH1",
  launchDate: "2026-11-20",
  studio: { customerStylePreference: "Industrial", imageSource: "Supplier" },
});
const stool = makeProduct({
  id: "2000003",
  name: "Oak Stool",
  criticalPath: "SS27 PH1",
  launchDate: "2026-11-10",
  studio: { customerStylePreference: "Scandi", imageSource: "Supplier", videoSource: "#N/A" },
});
const bare = makeProduct({ id: "2000004", name: "Plain Shelf", criticalPath: "#N/A", launchDate: "2026-11-30" });
const launched = makeProduct({
  id: "2000005",
  name: "Live Rug",
  lifecycle: "Live",
  studio: { customerStylePreference: "Scandi", imageSource: "Supplier" },
});
const all = [sofa, lamp, stool, bare, launched];

describe("data errors and missing values", () => {
  it("treats #N/A and #REF! as data errors and nothing else", () => {
    expect(isDataError("#N/A")).toBe(true);
    expect(isDataError(" #REF! ")).toBe(true);
    expect(isDataError("Supplier")).toBe(false);
    expect(isDataError(undefined)).toBe(false);
  });

  it("shows a missing or blank value as Not provided", () => {
    expect(displayValue(undefined)).toBe("Not provided");
    expect(displayValue("   ")).toBe("Not provided");
    expect(displayValue("Studio shoot")).toBe("Studio shoot");
  });
});

describe("filterStudioProducts", () => {
  it("lists Active products only, soonest launch first", () => {
    expect(filterStudioProducts(all, EMPTY_STUDIO_FILTERS).map((p) => p.name)).toEqual([
      "Oak Stool",
      "Brass Lamp",
      "Plain Shelf",
      "Oslo Sofa",
    ]);
  });

  it("searches title, Cat No and critical path like the Exceptions view", () => {
    const names = (query: string) => filterStudioProducts(all, { ...EMPTY_STUDIO_FILTERS, query }).map((p) => p.name);

    expect(names("oslo")).toEqual(["Oslo Sofa"]);
    expect(names("2000002")).toEqual(["Brass Lamp"]);
    expect(names("AW26 PH1")).toEqual(["Brass Lamp", "Oslo Sofa"]);
  });

  it("filters by critical path, style and image source together", () => {
    const filtered = filterStudioProducts(all, {
      ...EMPTY_STUDIO_FILTERS,
      criticalPath: "SS27 PH1",
      style: "Scandi",
      imageSource: "Supplier",
    });

    expect(filtered.map((p) => p.name)).toEqual(["Oak Stool"]);
  });

  it("can filter to products with no style or image source provided", () => {
    const filtered = filterStudioProducts(all, { ...EMPTY_STUDIO_FILTERS, style: "Not provided" });

    expect(filtered.map((p) => p.name)).toEqual(["Plain Shelf"]);
  });
});

describe("getStudioCriticalPath", () => {
  it("returns the path when the filter or search narrows to exactly one", () => {
    expect(getStudioCriticalPath(all, { ...EMPTY_STUDIO_FILTERS, criticalPath: "AW26 PH1" })).toBe("AW26 PH1");
    expect(getStudioCriticalPath(all, { ...EMPTY_STUDIO_FILTERS, query: "SS27" })).toBe("SS27 PH1");
  });

  it("returns nothing when no single path is selected", () => {
    expect(getStudioCriticalPath(all, EMPTY_STUDIO_FILTERS)).toBeUndefined();
  });
});

describe("getStudioOptions", () => {
  it("draws choices from Active products, with Not provided last", () => {
    const options = getStudioOptions(all);

    expect(options.criticalPaths).toEqual(["#N/A", "AW26 PH1", "SS27 PH1"]);
    expect(options.styles).toEqual(["Industrial", "Scandi", "Not provided"]);
    expect(options.imageSources).toEqual(["Studio shoot", "Supplier", "Not provided"]);
  });
});

describe("groupByStyle", () => {
  it("orders groups alphabetically with Not provided last and keeps launch order inside each", () => {
    const sorted = filterStudioProducts(all, EMPTY_STUDIO_FILTERS);
    const groups = groupByStyle(sorted);

    expect(groups.map((group) => group.style)).toEqual(["Industrial", "Scandi", "Not provided"]);
    expect(groups[1].products.map((p) => p.name)).toEqual(["Oak Stool", "Oslo Sofa"]);
  });
});

describe("CSV export", () => {
  it("writes the Studio columns, then one row per product with Not provided for gaps", () => {
    const lines = buildStudioCsv([sofa, bare]).replace("\uFEFF", "").trimEnd().split("\r\n");

    expect(lines[0]).toBe(STUDIO_COLUMNS.map((column) => column.header).join(","));
    expect(lines[1]).toContain("2000001,Oslo Sofa,AW26 PH1,Scandi,Studio shoot");
    expect(lines[1]).toContain('"Frame, legs"');
    expect(lines[2]).toContain("2000004,Plain Shelf,#N/A,Not provided,Not provided");
    expect(lines).toHaveLength(3);
  });

  it("starts with a byte order mark so Excel reads it as UTF-8", () => {
    expect(buildStudioCsv([]).startsWith("\uFEFF")).toBe(true);
  });

  it("quotes values with quotes or line breaks and defuses spreadsheet formulas", () => {
    const tricky = makeProduct({
      id: "2000009",
      name: '=HYPERLINK("x")',
      studio: { components: 'Frame\n"large"' },
    });
    const csv = buildStudioCsv([tricky]);

    expect(csv).toContain('"\'=HYPERLINK(""x"")"');
    expect(csv).toContain('"Frame\n""large"""');
  });

  it("names the file after the critical path, or all", () => {
    expect(studioCsvFileName("AW26 PH1")).toBe("launch-readiness-studio-aw26-ph1-2026-11-10.csv");
    expect(studioCsvFileName(undefined)).toBe("launch-readiness-studio-all-2026-11-10.csv");
  });
});

describe("seed data", () => {
  const active = SEED_PRODUCTS.filter((product) => getProductTab(product) === "active");

  it("covers at least 3 customer styles and a mix of image sources", () => {
    const options = getStudioOptions(SEED_PRODUCTS);

    expect(options.styles.filter((style) => style !== "Not provided").length).toBeGreaterThanOrEqual(3);
    expect(options.imageSources).toEqual(expect.arrayContaining(["Studio shoot", "Supplier", "Repro / Retouch"]));
  });

  it("fills Components on at least 3 Active products", () => {
    expect(active.filter((product) => product.studio?.components).length).toBeGreaterThanOrEqual(3);
  });

  it("includes both a missing value and a data error so the view can show each", () => {
    const values = active.flatMap((product) => Object.values(STUDIO_COLUMNS).map((column) => column.read(product)));

    expect(values).toContain(undefined);
    expect(values.some((value) => isDataError(value))).toBe(true);
  });

  it("does not let studio details change any status", () => {
    for (const product of active) {
      const { studio, ...withoutStudio } = product;
      expect(assessProduct(product).status, studio ? product.id : "").toBe(
        assessProduct(withoutStudio as typeof product).status,
      );
    }
  });
});
