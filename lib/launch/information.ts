import type { InformationKey, InformationSource, Product } from "./types";

/**
 * SYNTHETIC DEMO DATA ONLY. "Existing product data" and "Team input required"
 * are a conceptual split to test one principle: people should not re-enter
 * what is already known. They do not refer to any real system.
 */
export interface InformationDefinition {
  key: InformationKey;
  label: string;
  /** Question put to the user when it is missing. */
  prompt: string;
  /** Where this is normally known from in the prototype's story. */
  defaultSource: InformationSource;
  /** Fictional team that would normally supply it when it is missing. */
  neededFrom: string;
  /** Fictional value used to seed products that already have it. */
  sampleValue: (product: Product) => string;
}

export const INFORMATION_ORDER: InformationKey[] = [
  "supplier",
  "pricing",
  "hierarchy",
  "dimensions",
  "regulatory-category",
  "supplier-contact",
  "variant-options",
  "variant-pricing",
  "photography-instructions",
  "shot-list",
  "styling-direction",
  "sample-availability",
  "image-delivery",
  "spec-sheet",
  "key-features",
  "safety-evidence",
];

export const INFORMATION_DEFINITIONS: Record<InformationKey, InformationDefinition> = {
  supplier: {
    key: "supplier",
    label: "Supplier",
    prompt: "Which supplier provides this product?",
    defaultSource: "existing",
    neededFrom: "Buying team",
    sampleValue: (p) => (p.characteristics.ownBrand ? "Fictional Manufacturing Co." : `${p.brand} (supplier)`),
  },
  pricing: {
    key: "pricing",
    label: "Cost and retail price",
    prompt: "What are the cost and retail prices?",
    defaultSource: "existing",
    neededFrom: "Buying team",
    sampleValue: () => "Cost and retail price agreed",
  },
  hierarchy: {
    key: "hierarchy",
    label: "Range and hierarchy",
    prompt: "Where does this sit in the range hierarchy?",
    defaultSource: "existing",
    neededFrom: "Merchandising team",
    sampleValue: (p) => p.category,
  },
  dimensions: {
    key: "dimensions",
    label: "Product dimensions",
    prompt: "What are the product dimensions?",
    defaultSource: "existing",
    neededFrom: "Buying team",
    sampleValue: () => "Height, width and depth recorded",
  },
  "regulatory-category": {
    key: "regulatory-category",
    label: "Regulatory category",
    prompt: "Which regulatory category applies?",
    defaultSource: "existing",
    neededFrom: "Compliance team",
    sampleValue: (p) => (p.characteristics.complianceReason ? "Regulated product" : "Not regulated"),
  },
  "supplier-contact": {
    key: "supplier-contact",
    label: "Supplier contact",
    prompt: "Who is the supplier contact for images?",
    defaultSource: "existing",
    neededFrom: "Buying team",
    sampleValue: () => "Supplier account contact on file",
  },
  "variant-options": {
    key: "variant-options",
    label: "Size and colour options",
    prompt: "Which sizes and colours will be sold?",
    defaultSource: "team",
    neededFrom: "Merchandising team",
    sampleValue: (p) => `${p.variantCount ?? 2} options confirmed`,
  },
  "variant-pricing": {
    key: "variant-pricing",
    label: "Variant pricing",
    prompt: "Does each variant share the parent price?",
    defaultSource: "existing",
    neededFrom: "Buying team",
    sampleValue: () => "Same price across variants",
  },
  "photography-instructions": {
    key: "photography-instructions",
    label: "Photography instructions",
    prompt: "What should the studio know about shooting this product?",
    defaultSource: "team",
    neededFrom: "Merchandising team",
    sampleValue: (p) => p.studioBrief?.styling ?? "Standard studio instructions",
  },
  "shot-list": {
    key: "shot-list",
    label: "Required shot list",
    prompt: "Which shots are needed?",
    defaultSource: "team",
    neededFrom: "Merchandising team",
    sampleValue: (p) => p.studioBrief?.requiredImagery.join(", ") ?? "Hero shot",
  },
  "styling-direction": {
    key: "styling-direction",
    label: "Styling direction",
    prompt: "What styling or setting should the shots use?",
    defaultSource: "team",
    neededFrom: "Merchandising team",
    sampleValue: (p) => p.studioBrief?.styling ?? "Clean, neutral styling",
  },
  "sample-availability": {
    key: "sample-availability",
    label: "Sample availability",
    prompt: "When will a sample reach the studio?",
    defaultSource: "team",
    neededFrom: "Buying team",
    sampleValue: () => "Sample available in studio",
  },
  "image-delivery": {
    key: "image-delivery",
    label: "Image delivery method",
    prompt: "How will the supplier deliver the images?",
    defaultSource: "team",
    neededFrom: "Buying team",
    sampleValue: () => "Supplier shares an image folder",
  },
  "spec-sheet": {
    key: "spec-sheet",
    label: "Supplier specification sheet",
    prompt: "Where is the final specification sheet?",
    defaultSource: "team",
    neededFrom: "Buying team",
    sampleValue: () => "Final spec sheet received",
  },
  "key-features": {
    key: "key-features",
    label: "Key features",
    prompt: "What are the key selling features?",
    defaultSource: "team",
    neededFrom: "Merchandising team",
    sampleValue: () => "Key features agreed",
  },
  "safety-evidence": {
    key: "safety-evidence",
    label: "Safety or compliance evidence",
    prompt: "Which certificate or declaration has been supplied?",
    defaultSource: "team",
    neededFrom: "Buying team",
    sampleValue: (p) => (p.characteristics.complianceReason ? "Evidence supplied" : "Not needed"),
  },
};

export function informationLabel(key: InformationKey): string {
  return INFORMATION_DEFINITIONS[key].label;
}
