import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { SLA_CONFIG } from "./readiness-config";
import { describeSla, infoCompleteAt, slaProjectionDate, slaWorkingDays, slaWorkingDaysFor } from "./sla";
import type { Product } from "./types";

const find = (id: string) => SEED_PRODUCTS.find((p) => p.id === id)!;

describe("SLA configuration", () => {
  it("defaults to 20 working days and gives a Guest bed 25, both labelled Placeholder", () => {
    expect(SLA_CONFIG.defaultWorkingDays).toBe(20);
    expect(SLA_CONFIG.workingDaysByProductType["Guest bed"]).toBe(25);
    expect(SLA_CONFIG.label).toBe("Placeholder");
  });
});

describe("slaWorkingDaysFor", () => {
  it("uses 25 for a Guest bed in any case and 20 for everything else", () => {
    expect(slaWorkingDaysFor("Guest bed")).toBe(25);
    expect(slaWorkingDaysFor("guest bed")).toBe(25);
    expect(slaWorkingDaysFor("Sofa")).toBe(20);
    expect(slaWorkingDaysFor(undefined)).toBe(20);
  });
});

describe("slaWorkingDays", () => {
  it("reads the product type from the product", () => {
    expect(slaWorkingDays(find("1912345"))).toBe(25);
    expect(slaWorkingDays(find("4567890"))).toBe(20);
  });
});

describe("describeSla", () => {
  it("carries the Placeholder label with the number", () => {
    expect(describeSla(20)).toBe("20 working days (Placeholder)");
    expect(describeSla(25)).toBe("25 working days (Placeholder)");
  });
});

describe("infoCompleteAt", () => {
  it("is the recorded date for a complete product", () => {
    expect(infoCompleteAt(find("4567890"))).toBe("2026-10-26");
  });

  it("does not exist while any mandatory field is missing, even if a date was recorded", () => {
    const incomplete: Product = { ...find("4567890"), fields: { ...find("4567890").fields, supplierContact: "" } };
    expect(infoCompleteAt(incomplete)).toBeUndefined();
    expect(infoCompleteAt(find("5678901"))).toBeUndefined();
  });
});

describe("slaProjectionDate", () => {
  it("is the completion date plus 20 working days by default", () => {
    expect(slaProjectionDate(find("4567890"))).toBe("2026-11-23");
    expect(slaProjectionDate(find("1234567"))).toBe("2026-12-01");
  });

  it("is the completion date plus 25 working days for a Guest bed", () => {
    expect(slaProjectionDate(find("1912345"))).toBe("2026-12-07");
  });

  it("is undefined when the SLA has not started", () => {
    expect(slaProjectionDate(find("5678901"))).toBeUndefined();
  });
});
