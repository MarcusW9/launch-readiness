import { ACTIVITY_DEFINITIONS, ACTIVITY_ORDER } from "./activity-definitions";
import { deriveNextAction, deriveWorkState, workStateLabel } from "./next-action";
import type {
  ActivityDefinition,
  ActivityKey,
  ActivityState,
  ActivityStatus,
  InformationKey,
  Product,
  WorkflowStage,
  WorkState,
} from "./types";

export { ACTIVITY_DEFINITIONS, ACTIVITY_ORDER } from "./activity-definitions";
export { workStateLabel } from "./next-action";

export function getStage(def: ActivityDefinition, state: ActivityState): WorkflowStage {
  return def.workflow.find((stage) => stage.id === state.stage) ?? def.workflow[0];
}

export function getStageIndex(def: ActivityDefinition, state: ActivityState): number {
  const index = def.workflow.findIndex((stage) => stage.id === state.stage);
  return index === -1 ? 0 : index;
}

export interface ActivityInformation {
  required: InformationKey[];
  available: InformationKey[];
  missing: InformationKey[];
  /** Missing items that stop the work from beginning. Empty once started. */
  blockingStart: InformationKey[];
  /** Missing items that stop the work from being marked complete. */
  blockingFinish: InformationKey[];
}

export interface ResolvedActivity {
  def: ActivityDefinition;
  applies: boolean;
  reason: string;
  /** Workflow status only. Says nothing about whether information is complete. */
  status: ActivityStatus;
  state?: ActivityState;
  information: ActivityInformation;
  workState: WorkState;
  /** Display wording for workState, e.g. "Unable to start". */
  workStateLabel: string;
  nextAction: string;
}

const EMPTY_INFORMATION: ActivityInformation = {
  required: [],
  available: [],
  missing: [],
  blockingStart: [],
  blockingFinish: [],
};

export function resolveActivity(product: Product, key: ActivityKey): ResolvedActivity {
  const def = ACTIVITY_DEFINITIONS[key];
  const { applies, reason } = def.appliesTo(product);
  const state = product.activities[key];

  if (!applies || !state) {
    return {
      def,
      applies: false,
      reason,
      status: "Not Required",
      information: EMPTY_INFORMATION,
      workState: "Not Required",
      workStateLabel: "Not Required",
      nextAction: "",
    };
  }

  const stageIndex = getStageIndex(def, state);
  const isComplete = def.workflow[stageIndex].status === "Complete";
  const status: ActivityStatus = state.blocked && !isComplete ? "Blocked" : def.workflow[stageIndex].status;

  const available = def.requiredInfo.filter((infoKey) => product.information[infoKey]);
  const missing = def.requiredInfo.filter((infoKey) => !product.information[infoKey]);
  const notStarted = stageIndex === 0;
  const blockingStart = notStarted ? def.startInfo.filter((infoKey) => !product.information[infoKey]) : [];

  const workState = deriveWorkState({ isComplete, blocked: Boolean(state.blocked), notStarted, blockingStart });

  return {
    def,
    applies: true,
    reason,
    status,
    state,
    information: {
      required: def.requiredInfo,
      available,
      missing,
      blockingStart,
      blockingFinish: isComplete ? [] : missing,
    },
    workState,
    workStateLabel: workStateLabel(workState),
    nextAction: deriveNextAction({ def, state, stageIndex, missing, blockingStart }),
  };
}

/** Every activity in display order, including the ones that do not apply to the product. */
export function resolveAllActivities(product: Product): ResolvedActivity[] {
  return ACTIVITY_ORDER.map((key) => resolveActivity(product, key));
}

export function getApplicableActivities(product: Product): ResolvedActivity[] {
  return resolveAllActivities(product).filter((activity) => activity.applies);
}

/** The imagery activity relevant to this product (studio or supplier). */
export function resolveImagery(product: Product): ResolvedActivity {
  return resolveActivity(
    product,
    product.characteristics.imagerySource === "studio" ? "studio-imagery" : "supplier-imagery",
  );
}
