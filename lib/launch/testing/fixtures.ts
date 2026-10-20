import type { FieldKey } from "../readiness-config";
import type { Product, ProductCharacteristics } from "../types";

type ProductOverrides = Partial<Omit<Product, "characteristics">> & {
  characteristics?: Partial<ProductCharacteristics>;
};

/** Every mandatory field that does not already live on the product itself. */
const COMPLETE_FIELDS: Partial<Record<FieldKey, string>> = {
  productType: "Armchair",
  channelA: "Y",
  channelB: "N",
  productFeatures: "Key features agreed",
  supplierName: "Fictional Manufacturing Co.",
  supplierContact: "Supplier account contact on file",
  integration: "N",
};

/**
 * A complete, On Track product by default: every mandatory field present, information completed
 * well before the demo date and a launch date far enough out for the SLA. Tests override only
 * what they care about.
 */
export function makeProduct(overrides: ProductOverrides = {}): Product {
  const { characteristics, fields, ...rest } = overrides;

  return {
    id: "9000001",
    name: "Test Armchair",
    brand: "Oakline",
    category: "Furniture",
    range: "Living room",
    criticalPath: "AW26 PH1",
    launchDate: "2026-12-30",
    pimDate: "2026-10-01",
    infoCompleteAt: "2026-10-05",
    ...rest,
    characteristics: {
      imagerySource: "supplier",
      hasVariants: false,
      ownBrand: false,
      ...characteristics,
    },
    fields: { ...COMPLETE_FIELDS, ...fields },
  };
}

/** The same product with the listed mandatory fields left blank. Information is then incomplete. */
export function withMissingFields(product: Product, ...keys: FieldKey[]): Product {
  const blanked = Object.fromEntries(keys.map((key) => [key, ""]));
  return { ...product, infoCompleteAt: undefined, fields: { ...product.fields, ...blanked } };
}
