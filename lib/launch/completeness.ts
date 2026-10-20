import {
  DATA_ERROR_VALUES,
  FIELD_DEFINITIONS,
  NOT_APPLICABLE_VALUE,
  type FieldDefinition,
  type FieldKey,
} from "./readiness-config";
import { pluralise } from "./working-days";
import type { Product } from "./types";

/**
 * Reads one field from a product. Some fields already live on the product itself and the six
 * photography fields live in its studio details; everything else sits in `product.fields`.
 */
export function readField(product: Product, key: FieldKey): string | undefined {
  switch (key) {
    case "catNo":
      return product.id;
    case "title":
      return product.name;
    case "range":
      return product.range;
    case "brand":
      return product.brand;
    case "criticalPath":
      return product.criticalPath;
    case "ownBrand":
      return product.characteristics.ownBrand ? "Own Brand" : "Branded";
    case "customerStylePreference":
    case "imageSource":
    case "cutOutSource":
    case "lifestyleSource":
    case "videoSource":
    case "components":
      return product.studio?.[key];
    default:
      return product.fields?.[key];
  }
}

const normalise = (value: string | undefined) => (value ?? "").trim().toUpperCase();

export function isBlank(value: string | undefined): boolean {
  return normalise(value) === "";
}

/** #N/A and #REF! are errors from the source data, in any field. */
export function isDataError(value: string | undefined): boolean {
  return DATA_ERROR_VALUES.includes(normalise(value));
}

/** Blank and data errors are missing everywhere. "N/A" is missing in a mandatory field only. */
export function isMissing(value: string | undefined, mandatory: boolean): boolean {
  if (isBlank(value) || isDataError(value)) return true;
  return mandatory && normalise(value) === NOT_APPLICABLE_VALUE;
}

export interface FieldAssessment {
  definition: FieldDefinition;
  value: string | undefined;
  missing: boolean;
  dataError: boolean;
}

export interface Completeness {
  fields: FieldAssessment[];
  mandatoryCount: number;
  /** Mandatory fields that are missing, including those that are data errors. Each is counted once. */
  missingMandatory: FieldAssessment[];
  /** The subset of missingMandatory that is a data error. */
  dataErrorsInMandatory: FieldAssessment[];
  /** Data errors in optional fields. They never block completeness. */
  dataErrorsInOptional: FieldAssessment[];
  isComplete: boolean;
  /** "Complete", "3 missing" or "3 missing (incl. 1 data error)". */
  summary: string;
}

/** A data error in a mandatory field is one of the missing fields, never a second count. */
export function formatMissingSummary(missingCount: number, dataErrorCount: number): string {
  if (missingCount === 0) return "Complete";
  if (dataErrorCount === 0) return `${missingCount} missing`;
  return `${missingCount} missing (incl. ${pluralise(dataErrorCount, "data error")})`;
}

export function assessCompleteness(product: Product): Completeness {
  const fields: FieldAssessment[] = FIELD_DEFINITIONS.map((definition) => {
    const value = readField(product, definition.key);
    return {
      definition,
      value,
      missing: isMissing(value, definition.mandatory),
      dataError: isDataError(value),
    };
  });

  const mandatory = fields.filter((field) => field.definition.mandatory);
  const missingMandatory = mandatory.filter((field) => field.missing);
  const dataErrorsInMandatory = missingMandatory.filter((field) => field.dataError);
  const dataErrorsInOptional = fields.filter((field) => !field.definition.mandatory && field.dataError);

  return {
    fields,
    mandatoryCount: mandatory.length,
    missingMandatory,
    dataErrorsInMandatory,
    dataErrorsInOptional,
    isComplete: missingMandatory.length === 0,
    summary: formatMissingSummary(missingMandatory.length, dataErrorsInMandatory.length),
  };
}
