import { changeLaunchDate, editProductField } from "./edit-product";
import { validateNote } from "./product-notes";
import type { FieldKey } from "./readiness-config";
import type { NoteRole, Product, ProductNote } from "./types";

export type LaunchAction =
  | { type: "add-product-note"; productId: string; text: string; author: string; role: NoteRole }
  | { type: "edit-field"; productId: string; key: FieldKey; value: string }
  | { type: "change-launch-date"; productId: string; date: string }
  | { type: "reset" };

export interface ReducerDependencies {
  /** Timestamp written to new notes. Its date part is the date edits are recorded on. */
  now: () => string;
  /** Unique id for a new note. */
  newId: (prefix: string) => string;
  /** State restored by the "reset" action. */
  initial: Product[];
}

/**
 * Pure state transitions for the launch prototype. Time and ids are injected so
 * every transition is deterministic and testable without React.
 */
export function createLaunchReducer({ now, newId, initial }: ReducerDependencies) {
  const update = (products: Product[], id: string, change: (product: Product) => Product) =>
    products.map((product) => (product.id === id ? change(product) : product));

  return function reducer(products: Product[], action: LaunchAction): Product[] {
    switch (action.type) {
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
        return update(products, action.productId, (product) => ({
          ...product,
          notes: [note, ...(product.notes ?? [])],
        }));
      }
      case "edit-field":
        return update(products, action.productId, (product) =>
          editProductField(product, action.key, action.value, now().slice(0, 10)),
        );
      case "change-launch-date":
        return update(products, action.productId, (product) =>
          changeLaunchDate(product, action.date, now().slice(0, 10)),
        );
      case "reset":
        return initial;
    }
  };
}
