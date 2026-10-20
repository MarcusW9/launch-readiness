"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { DEMO_TODAY } from "./readiness";
import type { FieldKey } from "./readiness-config";
import { createLaunchReducer } from "./store-reducer";
import type { NoteRole, Product } from "./types";

/** Time of day is real; the date stays on the fixed demo date. */
export function demoNow(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${DEMO_TODAY}T${hh}:${mm}`;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

interface LaunchContextValue {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  addProductNote: (productId: string, note: { text: string; author: string; role: NoteRole }) => void;
  editField: (productId: string, key: FieldKey, value: string) => void;
  changeLaunchDate: (productId: string, date: string) => void;
  resetDemoData: () => void;
}

const LaunchContext = createContext<LaunchContextValue | null>(null);

/**
 * In-memory prototype store. State is shared by every view in the session and
 * resets on refresh. Nothing is persisted or sent anywhere.
 */
export function LaunchProvider({
  initialProducts,
  children,
}: {
  initialProducts: Product[];
  children: ReactNode;
}) {
  const reducer = useMemo(
    () => createLaunchReducer({ now: demoNow, newId, initial: initialProducts }),
    [initialProducts],
  );
  const [products, dispatch] = useReducer(reducer, initialProducts);

  const getProduct = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  );

  const value = useMemo<LaunchContextValue>(
    () => ({
      products,
      getProduct,
      addProductNote: (productId, note) => dispatch({ type: "add-product-note", productId, ...note }),
      editField: (productId, key, value) => dispatch({ type: "edit-field", productId, key, value }),
      changeLaunchDate: (productId, date) => dispatch({ type: "change-launch-date", productId, date }),
      resetDemoData: () => dispatch({ type: "reset" }),
    }),
    [products, getProduct],
  );

  return <LaunchContext.Provider value={value}>{children}</LaunchContext.Provider>;
}

export function useLaunch(): LaunchContextValue {
  const context = useContext(LaunchContext);
  if (!context) throw new Error("useLaunch must be used inside LaunchProvider");
  return context;
}
