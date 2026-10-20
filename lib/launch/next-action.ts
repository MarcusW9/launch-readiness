import { WORK_STATE_LABELS } from "./copy";
import { INFORMATION_DEFINITIONS } from "./information";
import type { ActivityDefinition, ActivityState, InformationKey, WorkState } from "./types";

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** One label per state, the same on every screen. The start verb only appears in sentences. */
export function workStateLabel(workState: WorkState): string {
  return WORK_STATE_LABELS[workState];
}

interface WorkStateInput {
  isComplete: boolean;
  blocked: boolean;
  notStarted: boolean;
  blockingStart: InformationKey[];
}

export function deriveWorkState({ isComplete, blocked, notStarted, blockingStart }: WorkStateInput): WorkState {
  if (isComplete) return "Complete";
  if (blocked) return "Blocked";
  if (notStarted) return blockingStart.length > 0 ? "Awaiting information" : "Ready to start";
  return "In Progress";
}

interface NextActionInput {
  def: ActivityDefinition;
  state: ActivityState;
  /** Index of the current workflow stage. */
  stageIndex: number;
  missing: InformationKey[];
  blockingStart: InformationKey[];
}

/** The single most useful thing the user can do next, as a sentence fragment. */
export function deriveNextAction({ def, state, stageIndex, missing, blockingStart }: NextActionInput): string {
  const stage = def.workflow[stageIndex];
  const next = def.workflow[stageIndex + 1];

  if (stage.status === "Complete") return "Nothing further. This is complete.";
  if (state.blocked) return `Resolve the blocker: ${lowerFirst(state.blockedReason ?? "see notes")}`;
  if (blockingStart.length > 0) return `Provide ${lowerFirst(INFORMATION_DEFINITIONS[blockingStart[0]].label)}`;
  if (stageIndex === 0) return def.startAction;
  if (missing.length > 0) return `Provide ${lowerFirst(INFORMATION_DEFINITIONS[missing[0]].label)}`;
  if (next && next.status === "Complete") return `Complete ${def.name.toLowerCase()}`;
  return next ? `Move to ${next.label}` : "";
}
