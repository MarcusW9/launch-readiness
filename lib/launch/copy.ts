import type { WorkState } from "./types";

/**
 * Display wording for each derived work state. "Awaiting information" is the
 * internal name; users see "Unable to start" on every screen.
 */
export const WORK_STATE_LABELS: Record<WorkState, string> = {
  "Not Required": "Not Required",
  "Awaiting information": "Unable to start",
  "Ready to start": "Ready to start",
  "In Progress": "In Progress",
  Blocked: "Blocked",
  Complete: "Complete",
};

export const INFORMATION_NEEDED_HEADING = "Information needed";

export const HAS_MISSING_INFORMATION_LABEL = "Has missing information";
