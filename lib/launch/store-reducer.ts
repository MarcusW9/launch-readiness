import { ACTIVITY_DEFINITIONS, ACTIVITY_ORDER } from "./activity-definitions";
import { INFORMATION_DEFINITIONS } from "./information";
import { validateNote } from "./product-notes";
import type { ActivityKey, ActivityState, InformationKey, NoteRole, Product, ProductNote } from "./types";

export type LaunchAction =
  | { type: "set-stage"; productId: string; key: ActivityKey; stageId: string }
  | { type: "set-blocked"; productId: string; key: ActivityKey; reason: string | null }
  | { type: "add-note"; productId: string; key: ActivityKey; text: string }
  | { type: "provide-information"; productId: string; infoKey: InformationKey; value: string }
  | { type: "add-product-note"; productId: string; text: string; author: string; role: NoteRole }
  | { type: "reset" };

export interface ReducerDependencies {
  /** Timestamp written to history entries, notes and provided information. */
  now: () => string;
  /** Unique id for a new history entry or note. */
  newId: (prefix: string) => string;
  /** State restored by the "reset" action. */
  initial: Product[];
}

function updateActivity(
  products: Product[],
  productId: string,
  key: ActivityKey,
  update: (state: ActivityState) => ActivityState,
): Product[] {
  return products.map((product) => {
    const current = product.activities[key];
    if (product.id !== productId || !current) return product;
    return { ...product, activities: { ...product.activities, [key]: update(current) } };
  });
}

/**
 * Pure state transitions for the launch prototype. Time and ids are injected so
 * every transition is deterministic and testable without React.
 */
export function createLaunchReducer({ now, newId, initial }: ReducerDependencies) {
  return function reducer(products: Product[], action: LaunchAction): Product[] {
    switch (action.type) {
      case "provide-information": {
        const at = now();
        const label = INFORMATION_DEFINITIONS[action.infoKey].label;
        return products.map((product) => {
          if (product.id !== action.productId) return product;
          const activities = { ...product.activities };
          for (const key of ACTIVITY_ORDER) {
            const current = activities[key];
            if (current && ACTIVITY_DEFINITIONS[key].requiredInfo.includes(action.infoKey)) {
              activities[key] = {
                ...current,
                history: [{ id: newId("h"), at, text: `${label} provided` }, ...current.history],
              };
            }
          }
          return {
            ...product,
            activities,
            information: {
              ...product.information,
              [action.infoKey]: { value: action.value, source: "team", at },
            },
          };
        });
      }
      case "set-stage": {
        const def = ACTIVITY_DEFINITIONS[action.key];
        const stage = def.workflow.find((s) => s.id === action.stageId);
        if (!stage) return products;
        const product = products.find((p) => p.id === action.productId);
        const current = product?.activities[action.key];
        if (product && current) {
          const fromIndex = def.workflow.findIndex((s) => s.id === current.stage);
          const toIndex = def.workflow.indexOf(stage);
          const missingStart = def.startInfo.some((infoKey) => !product.information[infoKey]);
          if (fromIndex === 0 && toIndex > 0 && missingStart) return products;
          const missingFinish = def.requiredInfo.some((infoKey) => !product.information[infoKey]);
          if (stage.status === "Complete" && toIndex > fromIndex && missingFinish) return products;
        }
        return updateActivity(products, action.productId, action.key, (state) => ({
          ...state,
          stage: stage.id,
          blocked: stage.status === "Complete" ? false : state.blocked,
          blockedReason: stage.status === "Complete" ? undefined : state.blockedReason,
          history: [{ id: newId("h"), at: now(), text: `Moved to ${stage.label}` }, ...state.history],
        }));
      }
      case "set-blocked":
        return updateActivity(products, action.productId, action.key, (state) => ({
          ...state,
          blocked: action.reason !== null,
          blockedReason: action.reason ?? undefined,
          history: [
            {
              id: newId("h"),
              at: now(),
              text: action.reason ? `Flagged as Blocked: ${action.reason}` : "Blocker cleared",
            },
            ...state.history,
          ],
        }));
      case "add-note":
        return updateActivity(products, action.productId, action.key, (state) => ({
          ...state,
          notes: [{ id: newId("n"), at: now(), author: "You", text: action.text }, ...state.notes],
        }));
      case "add-product-note": {
        const checked = validateNote(action.text);
        if (!checked.ok) return products;
        const note: ProductNote = {
          id: newId("pn"),
          at: now(),
          author: action.author,
          role: action.role,
          text: checked.text,
        };
        return products.map((product) =>
          product.id === action.productId ? { ...product, notes: [note, ...(product.notes ?? [])] } : product,
        );
      }
      case "reset":
        return initial;
    }
  };
}
