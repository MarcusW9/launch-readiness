import { INFORMATION_DEFINITIONS, INFORMATION_ORDER } from "../information";
import type {
  ActivityKey,
  ActivityState,
  InformationKey,
  Product,
  ProductCharacteristics,
} from "../types";

export function stateAt(stage: string, extra: Partial<ActivityState> = {}): ActivityState {
  return { stage, blocked: false, notes: [], history: [], ...extra };
}

export function allInformation(product: Product): Product["information"] {
  const information: Product["information"] = {};
  for (const key of INFORMATION_ORDER) {
    const definition = INFORMATION_DEFINITIONS[key];
    information[key] = { value: definition.sampleValue(product), source: definition.defaultSource };
  }
  return information;
}

type ProductOverrides = Partial<Omit<Product, "characteristics" | "activities">> & {
  characteristics?: Partial<ProductCharacteristics>;
  activities?: Product["activities"];
};

/**
 * A fully prepared product by default: supplier imagery, no variants, no
 * compliance, every information item known and every applicable activity
 * complete. Tests override only what they care about.
 */
export function makeProduct(overrides: ProductOverrides = {}): Product {
  const { characteristics, activities, information, ...rest } = overrides;

  const product: Product = {
    id: "9000001",
    name: "Test Armchair",
    brand: "Oakline",
    category: "Furniture",
    launchDate: "2026-12-30",
    ...rest,
    characteristics: {
      imagerySource: "supplier",
      hasVariants: false,
      ownBrand: false,
      ...characteristics,
    },
    information: {},
    activities: {
      "product-setup": stateAt("complete"),
      "product-content": stateAt("complete"),
      "supplier-imagery": stateAt("complete"),
      ...activities,
    },
  };

  product.information = information ?? allInformation(product);
  return product;
}

export function withActivity(product: Product, key: ActivityKey, state: ActivityState): Product {
  return { ...product, activities: { ...product.activities, [key]: state } };
}

export function withoutInformation(product: Product, ...keys: InformationKey[]): Product {
  const information = { ...product.information };
  for (const key of keys) delete information[key];
  return { ...product, information };
}

export function withInformation(product: Product, key: InformationKey, value = "Provided in test"): Product {
  return { ...product, information: { ...product.information, [key]: { value, source: "team" } } };
}
