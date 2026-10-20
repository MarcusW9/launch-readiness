import type { FieldKey } from "./readiness-config";
import type { Product, ProductNote, StudioDetails } from "./types";

/**
 * SYNTHETIC DEMO DATA ONLY. Product names, IDs and statuses are fictional and
 * are not taken from any operational system.
 */

type RawProduct = Product;

const RAW_PRODUCTS: RawProduct[] = [
  {
    id: "1234567",
    name: "Oakline Oslo Sofa",
    brand: "Oakline",
    category: "Furniture",
    launchDate: "2026-11-24",
    characteristics: { imagerySource: "studio", hasVariants: true, ownBrand: true },
    studioBrief: {
      requiredImagery: [
        "Hero shot on white",
        "2 lifestyle room sets",
        "2 detail shots (fabric and legs)",
        "1 dimensions shot",
      ],
      styling: "Warm neutral living room. Show the sofa in the oatmeal and moss colourways.",
    },
  },
  {
    id: "2345678",
    name: "Samsung Example TV 55\"",
    brand: "Samsung",
    category: "Electricals",
    launchDate: "2026-11-24",
    characteristics: {
      imagerySource: "supplier",
      hasVariants: false,
      ownBrand: false,
      complianceReason:
        "this is an electrical product that needs safety and energy label documentation.",
    },
  },
  {
    id: "3456789",
    name: "Hearthwell Linen Duvet Set",
    brand: "Hearthwell",
    category: "Home textiles",
    launchDate: "2026-12-02",
    characteristics: { imagerySource: "studio", hasVariants: true, ownBrand: true },
    studioBrief: {
      requiredImagery: ["Hero bed shot", "Flat lay of set contents", "2 fabric detail shots"],
      styling: "Soft daylight, crumpled linen look, natural tones.",
    },
  },
  {
    id: "4567890",
    name: "Hearthwell Ceramic Dinner Set 12pc",
    brand: "Hearthwell",
    category: "Kitchen and dining",
    launchDate: "2026-11-16",
    characteristics: {
      imagerySource: "studio",
      hasVariants: false,
      ownBrand: true,
      complianceReason: "it is a food-contact product that needs a declaration of conformity.",
    },
    studioBrief: {
      requiredImagery: ["Hero stack shot", "Table setting lifestyle", "Piece-by-piece line-up"],
      styling: "Bright, minimal table setting.",
    },
  },
  {
    id: "5678901",
    name: "Little Acorn Wooden Play Kitchen",
    brand: "Little Acorn",
    category: "Toys",
    launchDate: "2026-11-16",
    characteristics: {
      imagerySource: "studio",
      hasVariants: false,
      ownBrand: true,
      complianceReason: "toys must have safety test documentation before sale.",
    },
    studioBrief: {
      requiredImagery: ["Hero shot", "Child-play lifestyle", "3 feature close-ups", "Scale shot"],
      styling: "Bright playroom, natural light.",
    },
  },
  {
    id: "6789012",
    name: "Bosch Example Washing Machine",
    brand: "Bosch",
    category: "Appliances",
    launchDate: "2026-12-02",
    characteristics: {
      imagerySource: "supplier",
      hasVariants: false,
      ownBrand: false,
      complianceReason:
        "major appliances need energy label and safety documentation.",
    },
  },
  {
    id: "7890123",
    name: "Hearthwell Kids Rainbow Bed Linen",
    brand: "Hearthwell",
    category: "Home textiles",
    launchDate: "2026-12-02",
    characteristics: { imagerySource: "studio", hasVariants: true, ownBrand: true },
    studioBrief: {
      requiredImagery: ["Hero bed shot", "Pattern close-up", "Kids bedroom lifestyle"],
      styling: "Playful kids bedroom, bright and clean.",
    },
  },
  {
    id: "8901234",
    name: "Kettlewell Air Fryer 6L",
    brand: "Kettlewell",
    category: "Small appliances",
    launchDate: "2026-11-18",
    characteristics: {
      imagerySource: "studio",
      hasVariants: false,
      ownBrand: true,
      complianceReason: "it is an electrical product that needs a safety test certificate.",
    },
    studioBrief: {
      requiredImagery: ["Hero shot", "Lifestyle in kitchen", "Control panel close-up"],
      styling: "Modern kitchen worktop.",
    },
  },
  {
    id: "9012345",
    name: "Oakline Aria Cushion Set",
    brand: "Oakline",
    category: "Home textiles",
    launchDate: "2026-12-02",
    characteristics: { imagerySource: "studio", hasVariants: true, ownBrand: true },
    studioBrief: {
      requiredImagery: ["Hero set shot", "Sofa styling shot"],
      styling: "Layered neutrals on a linen sofa.",
    },
  },
  {
    id: "1023456",
    name: "Philips Example Electric Toothbrush",
    brand: "Philips",
    category: "Health and beauty",
    launchDate: "2026-11-24",
    characteristics: {
      imagerySource: "supplier",
      hasVariants: false,
      ownBrand: false,
      complianceReason: "it is a rechargeable electrical product that needs safety documentation.",
    },
  },
  {
    id: "1134567",
    name: "Oakline Brooklyn Dining Table",
    brand: "Oakline",
    category: "Furniture",
    launchDate: "2026-12-02",
    characteristics: { imagerySource: "studio", hasVariants: true, ownBrand: true },
    studioBrief: {
      requiredImagery: ["Hero shot", "Dining room lifestyle", "Leg and joint detail", "Dimensions shot"],
      styling: "Dining room with six chairs, natural wood tones.",
    },
  },
  {
    id: "1245678",
    name: "Hearthwell Fairy Light Curtain",
    brand: "Hearthwell",
    category: "Seasonal",
    launchDate: "2026-11-16",
    characteristics: {
      imagerySource: "studio",
      hasVariants: false,
      ownBrand: true,
      complianceReason: "it is a mains-powered electrical product that needs safety documentation.",
    },
    studioBrief: {
      requiredImagery: ["Hero lit shot", "Bedroom lifestyle", "Plug and controller detail"],
      styling: "Dark backdrop so the lights show clearly.",
    },
  },
  {
    id: "1356789",
    name: "Sage Example Coffee Machine",
    brand: "Sage",
    category: "Small appliances",
    launchDate: "2026-11-24",
    characteristics: {
      imagerySource: "supplier",
      hasVariants: false,
      ownBrand: false,
      complianceReason: "it is a mains-powered electrical product that needs safety documentation.",
    },
  },
  {
    id: "1467890",
    name: "Hearthwell 3-Seater Garden Sofa Set",
    brand: "Hearthwell",
    category: "Garden furniture",
    launchDate: "2026-12-11",
    characteristics: {
      imagerySource: "studio",
      hasVariants: true,
      ownBrand: true,
      complianceReason: "upholstered furniture needs fire safety labelling confirmed.",
    },
    studioBrief: {
      requiredImagery: ["Hero shot", "Garden lifestyle", "Cushion and weave detail", "Dimensions shot"],
      styling: "Sunny patio setting. Show the grey and natural colourways.",
    },
  },
  {
    id: "1578901",
    name: "Little Acorn Remote Control Racing Car",
    brand: "Little Acorn",
    category: "Toys",
    launchDate: "2026-11-16",
    characteristics: {
      imagerySource: "supplier",
      hasVariants: false,
      ownBrand: false,
      complianceReason: "toys with batteries must have safety test documentation before sale.",
    },
  },
  {
    id: "1912345",
    name: "Oakline Fold-Away Guest Bed",
    brand: "Oakline",
    category: "Furniture",
    launchDate: "2026-12-04",
    characteristics: { imagerySource: "studio", hasVariants: false, ownBrand: true },
    studioBrief: {
      requiredImagery: ["Hero shot", "Spare room lifestyle", "Folded away shot"],
      styling: "Calm spare room, white linen, natural light.",
    },
  },
  {
    id: "1689012",
    name: "Hearthwell Bamboo Storage Set",
    brand: "Hearthwell",
    category: "Home storage",
    launchDate: "2026-10-20",
    lifecycle: "Live",
    characteristics: { imagerySource: "studio", hasVariants: false, ownBrand: true },
    studioBrief: {
      requiredImagery: ["Hero shot", "Bathroom lifestyle"],
      styling: "Light, airy bathroom shelf.",
    },
  },
  {
    id: "1790123",
    name: "Oakline Marlow Armchair",
    brand: "Oakline",
    category: "Furniture",
    launchDate: "2026-09-15",
    lifecycle: "Offsale",
    characteristics: { imagerySource: "studio", hasVariants: true, ownBrand: true },
    studioBrief: {
      requiredImagery: ["Hero shot", "Living room lifestyle"],
      styling: "Reading corner with a floor lamp.",
    },
  },
  {
    id: "1801234",
    name: "Little Acorn Garden Water Table",
    brand: "Little Acorn",
    category: "Toys",
    launchDate: "2026-12-15",
    lifecycle: "Dropped",
    characteristics: {
      imagerySource: "studio",
      hasVariants: false,
      ownBrand: true,
      complianceReason: "toys must have safety test documentation before sale.",
    },
    studioBrief: {
      requiredImagery: ["Hero shot", "Garden play lifestyle"],
      styling: "Sunny lawn, bright colours.",
    },
  },
];

/** Planning range and critical path for each demo product. Absent means not assigned. */
const PLANNING: Record<string, Pick<Product, "range" | "criticalPath">> = {
  "1234567": { range: "Living room", criticalPath: "AW26 PH2" },
  "2345678": { range: "Entertainment", criticalPath: "AW26 PH2" },
  "3456789": { range: "Bedroom", criticalPath: "AW26 PH3" },
  "4567890": { range: "Dining", criticalPath: "AW26 PH1" },
  "5678901": { range: "Kids play", criticalPath: "AW26 PH1" },
  "6789012": { range: "Laundry", criticalPath: "AW26 PH3" },
  "7890123": { range: "Kids bedroom", criticalPath: "AW26 PH3" },
  "8901234": { range: "Kitchen appliances", criticalPath: "AW26 PH2" },
  "9012345": { range: "Living room", criticalPath: "AW26 PH3" },
  "1023456": { range: "Personal care", criticalPath: "AW26 PH2" },
  "1134567": { range: "Dining", criticalPath: "AW26 PH3" },
  "1245678": { range: "Christmas", criticalPath: "AW26 PH1" },
  "1356789": { range: "Kitchen appliances", criticalPath: "AW26 PH2" },
  "1467890": { range: "Outdoor living", criticalPath: "SS27 PH1" },
  "1578901": { range: "Kids play", criticalPath: "AW26 PH1" },
  "1689012": { range: "Storage", criticalPath: "SS26 PH3" },
  "1790123": { range: "Living room", criticalPath: "SS26 PH3" },
  "1801234": { range: "Outdoor living" },
  "1912345": { range: "Bedroom", criticalPath: "AW26 PH3" },
};

/**
 * Studio view details for the Active demo products. A missing key shows as "Not provided".
 * "#N/A" and "#REF!" mimic spreadsheet errors carried over from the source data.
 * None of this affects status or any calculation.
 */
const STUDIO_DETAILS: Record<string, StudioDetails> = {
  "1234567": {
    customerStylePreference: "Scandi",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    lifestyleSource: "Studio shoot",
    components: "Frame, cushions, legs and fixings",
  },
  "2345678": { imageSource: "Supplier", cutOutSource: "Supplier", videoSource: "Supplier" },
  "3456789": {
    customerStylePreference: "Scandi",
    imageSource: "Repro / Retouch",
    cutOutSource: "Repro / Retouch",
    lifestyleSource: "Studio shoot",
  },
  "4567890": {
    customerStylePreference: "Traditional",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    lifestyleSource: "Studio shoot",
  },
  "5678901": {
    customerStylePreference: "Contemporary",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    lifestyleSource: "Studio shoot",
    components: "Frame, worktop, accessories and fixings",
  },
  "6789012": { imageSource: "Supplier", cutOutSource: "Supplier" },
  "7890123": {
    customerStylePreference: "Contemporary",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    lifestyleSource: "Studio shoot",
  },
  "8901234": {
    customerStylePreference: "Contemporary",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    lifestyleSource: "Studio shoot",
    videoSource: "Studio shoot",
  },
  "9012345": {
    customerStylePreference: "Scandi",
    imageSource: "Repro / Retouch",
    cutOutSource: "Repro / Retouch",
  },
  "1023456": { imageSource: "Supplier", cutOutSource: "Supplier", lifestyleSource: "Supplier" },
  "1134567": {
    customerStylePreference: "Industrial",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    lifestyleSource: "Studio shoot",
    components: "Tabletop, legs and fixings shipped separately",
  },
  "1245678": {
    customerStylePreference: "Traditional",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    videoSource: "#N/A",
  },
  "1356789": { customerStylePreference: "Contemporary", imageSource: "Supplier", cutOutSource: "Supplier" },
  "1467890": {
    customerStylePreference: "Traditional",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    lifestyleSource: "Studio shoot",
    components: "Sofa, 2 armchairs, coffee table and cushions",
  },
  "1578901": { imageSource: "Supplier", cutOutSource: "#REF!" },
  "1912345": {
    customerStylePreference: "Scandi",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    lifestyleSource: "Studio shoot",
  },
};

const COMMERCIAL = { author: "Priya Shah", role: "commercial" } as const;
const DOWNSTREAM = { author: "Daniel Okafor", role: "downstream" } as const;

/**
 * Seed product notes, newest first. Every note is dated on a weekday on or before
 * the demo date (10 Nov 2026). Notes never affect status or any calculation.
 */
const PRODUCT_NOTES: Record<string, Array<Omit<ProductNote, "id">>> = {
  "1234567": [
    {
      ...DOWNSTREAM,
      at: "2026-11-09T14:20",
      text: "Cover shot needed with the sofa in the oak finish. Supplier to provide lifestyle images.",
    },
    { ...COMMERCIAL, at: "2026-11-04T10:05", text: "Design insert required for the packaging." },
  ],
  "3456789": [
    { ...COMMERCIAL, at: "2026-11-06T16:40", text: "Repro colour from 8514505." },
  ],
  "5678901": [
    {
      ...DOWNSTREAM,
      at: "2026-11-10T09:15",
      text: "Components: frame, worktop, accessories and fixings shipped separately.",
    },
    { ...COMMERCIAL, at: "2026-11-05T11:30", text: "Safety evidence requested from the supplier." },
    { ...COMMERCIAL, at: "2026-11-02T13:00", text: "Added to the tracker." },
  ],
  "1134567": [
    {
      ...COMMERCIAL,
      at: "2026-11-09T10:45",
      text: "Components: tabletop, legs and fixings shipped separately. Assembly guide to follow.",
    },
  ],
  "1467890": [
    { ...DOWNSTREAM, at: "2026-11-06T15:10", text: "Supplier to provide lifestyle images for the garden set." },
    { ...COMMERCIAL, at: "2026-11-03T09:50", text: "Design insert required for the cushions." },
  ],
};

let noteSeq = 0;
const seedNotes = (productId: string): ProductNote[] =>
  (PRODUCT_NOTES[productId] ?? []).map((note) => ({ id: `pn-seed-${++noteSeq}`, ...note }));

/**
 * Seed details for the weekly summary's "Changed this week" section. They are display-only:
 * launchDate itself is untouched, so no status, date or calculation depends on them.
 */
const WEEKLY_CHANGES: Record<string, Pick<Product, "previousLaunchDate" | "launchDateChangedOn" | "stockLandsDate">> = {
  "1234567": { previousLaunchDate: "2026-11-17", launchDateChangedOn: "2026-11-09" },
  "4567890": { previousLaunchDate: "2026-11-23", launchDateChangedOn: "2026-11-10" },
  "1134567": { previousLaunchDate: "2026-11-25", launchDateChangedOn: "2026-11-10", stockLandsDate: "2026-12-08" },
  "5678901": { stockLandsDate: "2026-11-23" },
  "1356789": { stockLandsDate: "2026-12-01" },
};

/** Product Type for each demo product. It also picks the SLA: Guest bed is 25 working days, everything else 20. */
const PRODUCT_TYPES: Record<string, string> = {
  "1234567": "Sofa",
  "2345678": "Television",
  "3456789": "Duvet set",
  "4567890": "Dinner set",
  "5678901": "Play kitchen",
  "6789012": "Washing machine",
  "7890123": "Bed linen",
  "8901234": "Air fryer",
  "9012345": "Cushion set",
  "1023456": "Electric toothbrush",
  "1134567": "Dining table",
  "1245678": "Fairy lights",
  "1356789": "Coffee machine",
  "1467890": "Garden sofa set",
  "1578901": "Remote control toy",
  "1689012": "Storage set",
  "1790123": "Armchair",
  "1801234": "Water table",
  "1912345": "Guest bed",
};

/**
 * Deliberate gaps in the mandatory fields. "" is blank, "N/A" is missing in a mandatory field,
 * and "#N/A" or "#REF!" are data errors. Products not listed here have every mandatory field.
 */
const FIELD_GAPS: Record<string, Partial<Record<FieldKey, string>>> = {
  "5678901": { supplierContact: "", integration: "N/A" },
  "1134567": { productFeatures: "#N/A", supplierContact: "", channelB: "" },
  "1467890": { supplierName: "#REF!", integration: "" },
  "1801234": { productFeatures: "" },
};

/** Optional fields that hold a value worth showing. "N/A" in an optional field is a valid answer. */
const OPTIONAL_FIELDS: Record<string, Partial<Record<FieldKey, string>>> = {
  "2345678": { subRange: "N/A", dimensions: "1230 x 710 x 60 mm" },
  "1234567": { dimensions: "2200 x 950 x 850 mm", careAndUse: "Spot clean only" },
  "3456789": { careAndUse: "Machine wash at 40 degrees" },
};

/**
 * The date the last mandatory field was completed, which starts the SLA. Only products whose
 * mandatory fields are all present have one. Every date is a weekday on or before the demo date.
 */
const INFO_COMPLETE_AT: Record<string, string> = {
  "1234567": "2026-11-03",
  "2345678": "2026-10-13",
  "3456789": "2026-10-20",
  "4567890": "2026-10-26",
  "6789012": "2026-10-22",
  "7890123": "2026-10-27",
  "8901234": "2026-10-14",
  "9012345": "2026-10-29",
  "1023456": "2026-10-15",
  "1245678": "2026-10-06",
  "1356789": "2026-10-19",
  "1578901": "2026-10-12",
  "1689012": "2026-09-14",
  "1790123": "2026-08-17",
  "1912345": "2026-11-02",
};

/** The date each product was entered in the PIM. Always on or before the date its information was completed. */
const PIM_DATES: Record<string, string> = {
  "1234567": "2026-10-27",
  "2345678": "2026-10-05",
  "3456789": "2026-10-12",
  "4567890": "2026-10-19",
  "5678901": "2026-10-28",
  "6789012": "2026-10-15",
  "7890123": "2026-10-20",
  "8901234": "2026-10-07",
  "9012345": "2026-10-22",
  "1023456": "2026-10-08",
  "1134567": "2026-11-02",
  "1245678": "2026-09-29",
  "1356789": "2026-10-12",
  "1467890": "2026-10-21",
  "1578901": "2026-10-05",
  "1689012": "2026-09-07",
  "1790123": "2026-08-10",
  "1801234": "2026-10-30",
  "1912345": "2026-10-26",
};

function seedFields(product: RawProduct): Product["fields"] {
  const planning = PLANNING[product.id];
  const season = planning?.criticalPath?.split(" ")[0];
  const gaps = FIELD_GAPS[product.id] ?? {};
  return {
    productType: PRODUCT_TYPES[product.id],
    channelA: "Y",
    channelB: product.characteristics.ownBrand ? "Y" : "N",
    productFeatures: "Key features agreed",
    department: product.category,
    season,
    barcode: `50${product.id}0000`,
    supplierName: product.characteristics.ownBrand ? "Fictional Manufacturing Co." : `${product.brand} (supplier)`,
    supplierContact: "Supplier account contact on file",
    integration: product.characteristics.hasVariants ? "Y" : "N",
    variantType: product.characteristics.hasVariants ? "Size and colour" : undefined,
    variantCount: product.variantCount ? String(product.variantCount) : undefined,
    ...OPTIONAL_FIELDS[product.id],
    ...gaps,
  };
}

export const SEED_PRODUCTS: Product[] = RAW_PRODUCTS.map((product) => ({
  ...product,
  ...PLANNING[product.id],
  ...WEEKLY_CHANGES[product.id],
  studio: STUDIO_DETAILS[product.id],
  fields: seedFields(product),
  pimDate: PIM_DATES[product.id],
  infoCompleteAt: INFO_COMPLETE_AT[product.id],
  notes: seedNotes(product.id),
}));
