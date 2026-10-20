import { describe, expect, it } from "vitest";
import {
  assessCompleteness,
  formatMissingSummary,
  isBlank,
  isDataError,
  isMissing,
  readField,
} from "./completeness";
import { SEED_PRODUCTS } from "./data";
import {
  DATA_ERROR_VALUES,
  FIELD_DEFINITIONS,
  FIELD_GROUPS,
  type FieldKey,
} from "./readiness-config";
import type { Product } from "./types";

const complete = SEED_PRODUCTS.find((p) => p.id === "4567890")!;

function withFields(overrides: Partial<Record<FieldKey, string>>, base: Product = complete): Product {
  return { ...base, fields: { ...base.fields, ...overrides } };
}

describe("field configuration", () => {
  it("defines 31 fields in four groups of 16, 2, 7 and 6", () => {
    expect(FIELD_DEFINITIONS).toHaveLength(31);
    const sizes = FIELD_GROUPS.map((group) => FIELD_DEFINITIONS.filter((f) => f.group === group.key).length);
    expect(sizes).toEqual([16, 2, 7, 6]);
  });

  it("marks exactly the 13 agreed fields as mandatory", () => {
    const mandatory = FIELD_DEFINITIONS.filter((f) => f.mandatory).map((f) => f.label);
    expect(mandatory).toEqual([
      "Cat No.",
      "Title",
      "Product Type",
      "Range",
      "Brand",
      "Own Brand/Branded",
      "Channel A Y/N",
      "Channel B Y/N",
      "Critical Path",
      "Product Features",
      "Supplier Name",
      "Supplier Contact",
      "Integration Y/N",
    ]);
  });

  it("uses each field key once", () => {
    expect(new Set(FIELD_DEFINITIONS.map((f) => f.key)).size).toBe(FIELD_DEFINITIONS.length);
  });

  it("treats #N/A and #REF! as the data errors", () => {
    expect(DATA_ERROR_VALUES).toEqual(["#N/A", "#REF!"]);
  });
});

describe("what counts as missing", () => {
  it("treats blank and whitespace as blank", () => {
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank("")).toBe(true);
    expect(isBlank("   ")).toBe(true);
    expect(isBlank("Sofa")).toBe(false);
  });

  it("recognises data errors in any case", () => {
    expect(isDataError("#N/A")).toBe(true);
    expect(isDataError(" #ref! ")).toBe(true);
    expect(isDataError("N/A")).toBe(false);
  });

  it("treats blank, #N/A and #REF! as missing in mandatory and optional fields", () => {
    for (const mandatory of [true, false]) {
      expect(isMissing("", mandatory)).toBe(true);
      expect(isMissing(undefined, mandatory)).toBe(true);
      expect(isMissing("#N/A", mandatory)).toBe(true);
      expect(isMissing("#REF!", mandatory)).toBe(true);
    }
  });

  it("treats N/A as missing in a mandatory field only", () => {
    expect(isMissing("N/A", true)).toBe(true);
    expect(isMissing("n/a", true)).toBe(true);
    expect(isMissing("N/A", false)).toBe(false);
  });
});

describe("formatMissingSummary", () => {
  it("shows the count once, with data errors folded in", () => {
    expect(formatMissingSummary(0, 0)).toBe("Complete");
    expect(formatMissingSummary(3, 0)).toBe("3 missing");
    expect(formatMissingSummary(2, 1)).toBe("2 missing (incl. 1 data error)");
    expect(formatMissingSummary(3, 2)).toBe("3 missing (incl. 2 data errors)");
  });
});

describe("readField", () => {
  it("reads identity fields from the product itself", () => {
    expect(readField(complete, "catNo")).toBe(complete.id);
    expect(readField(complete, "title")).toBe(complete.name);
    expect(readField(complete, "brand")).toBe(complete.brand);
  });

  it("reports Own Brand or Branded from the product characteristics", () => {
    const own = { ...complete, characteristics: { ...complete.characteristics, ownBrand: true } };
    const branded = { ...complete, characteristics: { ...complete.characteristics, ownBrand: false } };
    expect(readField(own, "ownBrand")).toBe("Own Brand");
    expect(readField(branded, "ownBrand")).toBe("Branded");
  });

  it("reads the photography fields from the studio details", () => {
    const withStudio = { ...complete, studio: { imageSource: "Studio shoot" } };
    expect(readField(withStudio, "imageSource")).toBe("Studio shoot");
  });

  it("reads everything else from the product fields", () => {
    expect(readField(withFields({ supplierName: "Fictional Manufacturing Co." }), "supplierName")).toBe(
      "Fictional Manufacturing Co.",
    );
  });
});

describe("assessCompleteness", () => {
  it("is complete when every mandatory field has a value", () => {
    const result = assessCompleteness(complete);
    expect(result.isComplete).toBe(true);
    expect(result.mandatoryCount).toBe(13);
    expect(result.missingMandatory).toEqual([]);
    expect(result.summary).toBe("Complete");
  });

  it("counts a blank mandatory field as missing", () => {
    const result = assessCompleteness(withFields({ supplierContact: "" }));
    expect(result.isComplete).toBe(false);
    expect(result.summary).toBe("1 missing");
    expect(result.missingMandatory.map((f) => f.definition.key)).toEqual(["supplierContact"]);
  });

  it("counts N/A as missing in a mandatory field", () => {
    expect(assessCompleteness(withFields({ integration: "N/A" })).summary).toBe("1 missing");
  });

  it("shows a mandatory data error once, as part of the missing count", () => {
    const result = assessCompleteness(withFields({ supplierName: "#REF!", integration: "" }));
    expect(result.missingMandatory).toHaveLength(2);
    expect(result.dataErrorsInMandatory).toHaveLength(1);
    expect(result.summary).toBe("2 missing (incl. 1 data error)");
  });

  it("never blocks completeness for an optional field, whatever it holds", () => {
    for (const value of ["", "#N/A", "#REF!", "N/A"]) {
      expect(assessCompleteness(withFields({ dimensions: value })).isComplete, value).toBe(true);
    }
  });

  it("lists data errors in optional fields without counting them as missing", () => {
    const result = assessCompleteness(withFields({ dimensions: "#N/A" }));
    expect(result.dataErrorsInOptional.map((f) => f.definition.key)).toEqual(["dimensions"]);
    expect(result.summary).toBe("Complete");
  });

  it("reads the six photography fields from the studio details", () => {
    const result = assessCompleteness({ ...complete, studio: { imageSource: "#REF!" } });
    const image = result.fields.find((f) => f.definition.key === "imageSource")!;
    expect(image.dataError).toBe(true);
    expect(result.isComplete).toBe(true);
  });
});
