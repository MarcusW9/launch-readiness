import type { ActivityDefinition, ActivityKey, WorkflowStage } from "./types";

const genericWorkflow: WorkflowStage[] = [
  { id: "not-started", label: "Not Started", status: "Not Started" },
  { id: "in-progress", label: "In Progress", status: "In Progress" },
  { id: "complete", label: "Complete", status: "Complete" },
];

const studioWorkflow: WorkflowStage[] = [
  { id: "required", label: "Required", status: "Not Started" },
  { id: "briefed", label: "Briefed", status: "In Progress" },
  { id: "in-progress", label: "In Progress", status: "In Progress" },
  { id: "complete", label: "Complete", status: "Complete" },
];

export const ACTIVITY_ORDER: ActivityKey[] = [
  "product-setup",
  "variants",
  "studio-imagery",
  "supplier-imagery",
  "product-content",
  "compliance",
];

export const ACTIVITY_DEFINITIONS: Record<ActivityKey, ActivityDefinition> = {
  "product-setup": {
    key: "product-setup",
    name: "Product Setup",
    shortName: "Setup",
    description: "Core product record created with pricing, hierarchy and supplier details.",
    ownerTeam: "Product team",
    doneWhen: "The product record is created and approved for launch.",
    workflow: genericWorkflow,
    requiredInfo: ["supplier", "pricing", "hierarchy"],
    startInfo: ["supplier", "hierarchy"],
    startVerb: "start",
    startAction: "Start product setup",
    appliesTo: () => ({
      applies: true,
      reason: "Required for every product.",
    }),
  },
  variants: {
    key: "variants",
    name: "Variants",
    shortName: "Variants",
    description: "Size, colour and other variant options created and linked to the parent product.",
    ownerTeam: "Product team",
    doneWhen: "Every sellable variant exists and is linked to the parent product.",
    workflow: genericWorkflow,
    requiredInfo: ["variant-options", "variant-pricing"],
    startInfo: ["variant-options"],
    startVerb: "start",
    startAction: "Create the variants",
    appliesTo: (product) =>
      product.characteristics.hasVariants
        ? {
            applies: true,
            reason: "Required because this product is sold in more than one size or colour.",
          }
        : {
            applies: false,
            reason: "Not required: this product has a single sellable option.",
          },
  },
  "studio-imagery": {
    key: "studio-imagery",
    name: "Studio Imagery",
    shortName: "Imagery",
    description: "In-house studio photography briefed, shot and delivered for the product.",
    ownerTeam: "Studio team",
    doneWhen: "All required shots are delivered and approved.",
    workflow: studioWorkflow,
    requiredInfo: [
      "photography-instructions",
      "shot-list",
      "styling-direction",
      "sample-availability",
      "dimensions",
    ],
    startInfo: ["photography-instructions", "shot-list"],
    startVerb: "brief",
    startAction: "Brief the studio",
    appliesTo: (product) =>
      product.characteristics.imagerySource === "studio"
        ? {
            applies: true,
            reason: product.characteristics.ownBrand
              ? "Required because this is an own-brand product photographed in the studio."
              : "Required because this product is photographed in the studio.",
          }
        : {
            applies: false,
            reason: "Not required: imagery is supplied by the supplier.",
          },
  },
  "supplier-imagery": {
    key: "supplier-imagery",
    name: "Supplier Imagery",
    shortName: "Imagery",
    description: "Supplier-provided images received, checked against standards and approved.",
    ownerTeam: "Content team",
    doneWhen: "Supplier images are received and meet the imagery standard.",
    workflow: genericWorkflow,
    requiredInfo: ["supplier-contact", "image-delivery"],
    startInfo: ["supplier-contact", "image-delivery"],
    startVerb: "request images",
    startAction: "Request images from the supplier",
    appliesTo: (product) =>
      product.characteristics.imagerySource === "supplier"
        ? {
            applies: true,
            reason: "Required because the supplier provides the imagery for this product.",
          }
        : {
            applies: false,
            reason: "Not required: this product is photographed in the studio.",
          },
  },
  "product-content": {
    key: "product-content",
    name: "Product Content",
    shortName: "Content",
    description: "Titles, descriptions, features and specifications written and approved.",
    ownerTeam: "Content team",
    doneWhen: "All customer-facing copy is written and approved.",
    workflow: genericWorkflow,
    requiredInfo: ["spec-sheet", "key-features", "dimensions"],
    startInfo: ["spec-sheet"],
    startVerb: "start",
    startAction: "Start writing the content",
    appliesTo: () => ({
      applies: true,
      reason: "Required for every product.",
    }),
  },
  compliance: {
    key: "compliance",
    name: "Compliance",
    shortName: "Compliance",
    description: "Safety, regulatory and labelling information confirmed before sale.",
    ownerTeam: "Compliance team",
    doneWhen: "All required compliance evidence is supplied and signed off.",
    workflow: genericWorkflow,
    requiredInfo: ["regulatory-category", "safety-evidence"],
    startInfo: ["regulatory-category"],
    startVerb: "start",
    startAction: "Start the compliance review",
    appliesTo: (product) =>
      product.characteristics.complianceReason
        ? {
            applies: true,
            reason: `Required because ${product.characteristics.complianceReason}`,
          }
        : {
            applies: false,
            reason: "Not required: no regulated characteristics for this product.",
          },
  },
};
