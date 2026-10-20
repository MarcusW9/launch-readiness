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
import { createLaunchReducer } from "./store-reducer";
import type { ActivityKey, InformationKey, NoteRole, Product } from "./types";

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
  setStage: (productId: string, key: ActivityKey, stageId: string) => void;
  setBlocked: (productId: string, key: ActivityKey, reason: string | null) => void;
  addNote: (productId: string, key: ActivityKey, text: string) => void;
  provideInformation: (productId: string, infoKey: InformationKey, value: string) => void;
  addProductNote: (productId: string, note: { text: string; author: string; role: NoteRole }) => void;
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
      setStage: (productId, key, stageId) => dispatch({ type: "set-stage", productId, key, stageId }),
      setBlocked: (productId, key, reason) => dispatch({ type: "set-blocked", productId, key, reason }),
      addNote: (productId, key, text) => dispatch({ type: "add-note", productId, key, text }),
      provideInformation: (productId, infoKey, value) =>
        dispatch({ type: "provide-information", productId, infoKey, value }),
      addProductNote: (productId, note) => dispatch({ type: "add-product-note", productId, ...note }),
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
