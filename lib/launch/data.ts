import { INFORMATION_DEFINITIONS, INFORMATION_ORDER } from "./information";
import type {
  ActivityState,
  HistoryEntry,
  InformationKey,
  Note,
  Product,
  ProductNote,
  StudioDetails,
} from "./types";

/**
 * SYNTHETIC DEMO DATA ONLY. Product names, IDs and statuses are fictional and
 * are not taken from any operational system.
 */

let seq = 0;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

interface StateOptions {
  blocked?: string;
  notes?: Array<Pick<Note, "at" | "author" | "text">>;
  history?: Array<Pick<HistoryEntry, "at" | "text">>;
}

function state(stage: string, options: StateOptions = {}): ActivityState {
  const history: HistoryEntry[] = (
    options.history ?? [{ at: "2026-11-02T09:00", text: "Added to Launch Readiness" }]
  ).map((entry) => ({ id: nextId("h"), ...entry }));

  return {
    stage,
    blocked: Boolean(options.blocked),
    blockedReason: options.blocked,
    notes: (options.notes ?? []).map((note) => ({ id: nextId("n"), ...note })),
    history,
  };
}

const done = (at = "2026-11-05T11:30") =>
  state("complete", {
    history: [
      { at: "2026-11-02T09:00", text: "Added to Launch Readiness" },
      { at, text: "Marked Complete" },
    ],
  });

type RawProduct = Omit<Product, "information">;

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
    activities: {
      "product-setup": done("2026-11-03T10:00"),
      variants: done("2026-11-05T14:20"),
      "studio-imagery": state("in-progress", {
        history: [
          { at: "2026-11-02T09:00", text: "Added to Launch Readiness" },
          { at: "2026-11-04T10:15", text: "Moved to Briefed" },
          { at: "2026-11-06T16:40", text: "Moved to In Progress" },
        ],
        notes: [
          {
            at: "2026-11-06T16:45",
            author: "Studio team",
            text: "Sample arrived in studio. Shoot provisionally booked for 12 Nov.",
          },
        ],
      }),
      "product-content": done("2026-11-07T09:10"),
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
    activities: {
      "product-setup": done(),
      "supplier-imagery": done("2026-11-06T13:00"),
      "product-content": state("in-progress", {
        notes: [
          {
            at: "2026-11-08T10:05",
            author: "Content team",
            text: "Waiting on final spec sheet from supplier before the feature list can be signed off.",
          },
        ],
      }),
      compliance: state("not-started"),
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
    activities: {
      "product-setup": done(),
      variants: state("in-progress", {
        notes: [
          {
            at: "2026-11-09T15:30",
            author: "Product team",
            text: "Single and double created. King and super king still to add.",
          },
        ],
      }),
      "studio-imagery": done("2026-11-08T17:00"),
      "product-content": done("2026-11-09T11:00"),
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
    activities: {
      "product-setup": done(),
      "studio-imagery": done("2026-11-04T16:00"),
      "product-content": done("2026-11-06T10:00"),
      compliance: done("2026-11-07T12:00"),
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
    activities: {
      "product-setup": done(),
      "studio-imagery": state("briefed", {
        blocked: "Waiting on samples",
        history: [
          { at: "2026-11-02T09:00", text: "Added to Launch Readiness" },
          { at: "2026-11-06T10:00", text: "Moved to Briefed" },
          { at: "2026-11-09T09:20", text: "Flagged as Blocked: Waiting on samples" },
        ],
        notes: [
          {
            at: "2026-11-09T09:20",
            author: "Launch manager",
            text: "Sample delayed in transit. Needs a studio slot this week to hit launch.",
          },
        ],
      }),
      "product-content": state("in-progress"),
      compliance: state("in-progress"),
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
    activities: {
      "product-setup": done(),
      "supplier-imagery": done("2026-11-07T10:30"),
      "product-content": state("not-started"),
      compliance: done("2026-11-08T14:00"),
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
    activities: {
      "product-setup": done(),
      variants: state("in-progress", {
        notes: [
          {
            at: "2026-11-09T12:00",
            author: "Product team",
            text: "8 of 9 size and colour combinations created. Only Age 7-8 in rainbow is still to create.",
          },
        ],
      }),
      "studio-imagery": done("2026-11-08T16:30"),
      "product-content": done("2026-11-09T09:45"),
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
    activities: {
      "product-setup": done(),
      "studio-imagery": done("2026-11-06T15:00"),
      "product-content": done("2026-11-07T16:00"),
      compliance: state("in-progress", {
        blocked: "Waiting on supplier test certificate",
        history: [
          { at: "2026-11-02T09:00", text: "Added to Launch Readiness" },
          { at: "2026-11-05T10:00", text: "Moved to In Progress" },
          { at: "2026-11-09T08:30", text: "Flagged as Blocked: Waiting on supplier test certificate" },
        ],
      }),
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
    activities: {
      "product-setup": done(),
      variants: done(),
      "studio-imagery": done("2026-11-06T11:00"),
      "product-content": done("2026-11-08T09:00"),
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
    activities: {
      "product-setup": done(),
      "supplier-imagery": state("in-progress", {
        notes: [
          {
            at: "2026-11-08T13:15",
            author: "Content team",
            text: "Supplier sent 4 of 7 images. Two do not meet the white background standard.",
          },
        ],
      }),
      "product-content": done("2026-11-07T15:00"),
      compliance: done("2026-11-08T10:00"),
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
    activities: {
      "product-setup": done(),
      variants: state("not-started"),
      "studio-imagery": state("required"),
      "product-content": state("in-progress", {
        notes: [
          {
            at: "2026-11-09T14:40",
            author: "Content team",
            text: "Conflicting information: the supplier spec sheet gives a table width of 160cm but the product record says 180cm. Needs confirming before the content can be signed off.",
          },
        ],
      }),
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
    activities: {
      "product-setup": done(),
      "studio-imagery": done("2026-11-07T17:30"),
      "product-content": state("in-progress", {
        notes: [
          {
            at: "2026-11-09T16:10",
            author: "Content team",
            text: "Copy drafted, awaiting legal review of the safety wording.",
          },
        ],
      }),
      compliance: done("2026-11-08T11:00"),
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
    activities: {
      "product-setup": done(),
      "supplier-imagery": done("2026-11-04T09:30"),
      "product-content": done("2026-11-06T14:00"),
      compliance: done("2026-11-07T10:30"),
    },
  },
  {
    id: "1467890",
    name: "Hearthwell 3-Seater Garden Sofa Set",
    brand: "Hearthwell",
    category: "Garden furniture",
    launchDate: "2026-12-12",
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
    activities: {
      "product-setup": done(),
      variants: state("not-started"),
      "studio-imagery": state("briefed", {
        history: [
          { at: "2026-11-02T09:00", text: "Added to Launch Readiness" },
          { at: "2026-11-09T14:00", text: "Moved to Briefed" },
        ],
      }),
      "product-content": state("not-started"),
      compliance: state("in-progress"),
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
    activities: {
      "product-setup": done(),
      "supplier-imagery": done("2026-11-05T12:00"),
      "product-content": done("2026-11-07T11:00"),
      compliance: done("2026-11-09T10:15"),
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
    activities: {
      "product-setup": done("2026-10-05T10:00"),
      "studio-imagery": done("2026-10-08T15:00"),
      "product-content": done("2026-10-12T11:00"),
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
    activities: {
      "product-setup": done("2026-09-01T10:00"),
      variants: done("2026-09-03T14:00"),
      "studio-imagery": done("2026-09-06T16:00"),
      "product-content": done("2026-09-08T09:30"),
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
    activities: {
      "product-setup": done(),
      "studio-imagery": state("required"),
      "product-content": state("not-started"),
      compliance: state("not-started"),
    },
  },
];

/**
 * Information still missing for each demo product. Everything else is seeded
 * as already known, so the demo shows people are never asked for what exists.
 */
const MISSING_INFORMATION: Record<string, InformationKey[]> = {
  "2345678": ["spec-sheet", "safety-evidence"],
  "4567890": [],
  "5678901": ["sample-availability", "safety-evidence"],
  "6789012": ["spec-sheet"],
  "8901234": ["safety-evidence"],
  "1134567": ["photography-instructions", "variant-options", "sample-availability"],
  "1245678": [],
  "1801234": ["photography-instructions", "spec-sheet", "safety-evidence"],
  "1467890": [
    "variant-options",
    "styling-direction",
    "sample-availability",
    "spec-sheet",
    "safety-evidence",
  ],
};

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
    { ...COMMERCIAL, at: "2026-11-02T13:00", text: "Added to the AW26 PH1 plan." },
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

function seedInformation(product: RawProduct): Product["information"] {
  const missing = new Set(MISSING_INFORMATION[product.id] ?? []);
  const information: Product["information"] = {};
  for (const key of INFORMATION_ORDER) {
    if (missing.has(key)) continue;
    const definition = INFORMATION_DEFINITIONS[key];
    information[key] = {
      value: definition.sampleValue(product as Product),
      source: definition.defaultSource,
      at: "2026-11-02T09:00",
    };
  }
  return information;
}

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

export const SEED_PRODUCTS: Product[] = RAW_PRODUCTS.map((product) => ({
  ...product,
  ...PLANNING[product.id],
  ...WEEKLY_CHANGES[product.id],
  studio: STUDIO_DETAILS[product.id],
  information: seedInformation(product),
  notes: seedNotes(product.id),
}));
