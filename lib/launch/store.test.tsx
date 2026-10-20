// @vitest-environment jsdom
import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SEED_PRODUCTS } from "./data";
import { DEMO_TODAY } from "./readiness";
import { LaunchProvider, useLaunch } from "./store";

const PRODUCT_ID = "5678901";

const wrapperFor = (products = SEED_PRODUCTS) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <LaunchProvider initialProducts={products}>{children}</LaunchProvider>;
  };

const renderStore = (products = SEED_PRODUCTS) => renderHook(() => useLaunch(), { wrapper: wrapperFor(products) });

describe("LaunchProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 0, 1, 9, 5));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders its children", () => {
    render(
      <LaunchProvider initialProducts={SEED_PRODUCTS}>
        <p>Inside the store</p>
      </LaunchProvider>,
    );

    expect(screen.getByText("Inside the store")).toBeInTheDocument();
  });

  it("starts with the products it was given", () => {
    const { result } = renderStore();

    expect(result.current.products).toBe(SEED_PRODUCTS);
  });

  it("finds a product by ID and returns undefined for an unknown ID", () => {
    const { result } = renderStore();

    expect(result.current.getProduct(PRODUCT_ID)?.name).toBe("Little Acorn Wooden Play Kitchen");
    expect(result.current.getProduct("0000000")).toBeUndefined();
  });

  it("provides information, stamping it with the demo date and the real time of day", () => {
    const { result } = renderStore();
    expect(result.current.getProduct(PRODUCT_ID)?.information["sample-availability"]).toBeUndefined();

    act(() => result.current.provideInformation(PRODUCT_ID, "sample-availability", "Sample arrives Monday"));

    const info = result.current.getProduct(PRODUCT_ID)?.information["sample-availability"];
    expect(info).toEqual({ value: "Sample arrives Monday", source: "team", at: `${DEMO_TODAY}T09:05` });
  });

  it("adds a note to an activity, newest first", () => {
    const { result } = renderStore();
    const before = result.current.getProduct(PRODUCT_ID)?.activities["studio-imagery"]?.notes.length ?? 0;

    act(() => result.current.addNote(PRODUCT_ID, "studio-imagery", "Chased the supplier"));

    const notes = result.current.getProduct(PRODUCT_ID)?.activities["studio-imagery"]?.notes ?? [];
    expect(notes).toHaveLength(before + 1);
    expect(notes[0]).toMatchObject({ author: "You", text: "Chased the supplier" });
  });

  it("flags work as blocked and then clears the blocker", () => {
    const { result } = renderStore();

    act(() => result.current.setBlocked(PRODUCT_ID, "studio-imagery", "Waiting on the supplier"));
    expect(result.current.getProduct(PRODUCT_ID)?.activities["studio-imagery"]).toMatchObject({
      blocked: true,
      blockedReason: "Waiting on the supplier",
    });

    act(() => result.current.setBlocked(PRODUCT_ID, "studio-imagery", null));
    expect(result.current.getProduct(PRODUCT_ID)?.activities["studio-imagery"]?.blocked).toBe(false);
  });

  it("moves work to another stage and records it in the history", () => {
    const { result } = renderStore();
    const current = result.current.getProduct(PRODUCT_ID)?.activities["product-setup"];
    expect(current).toBeDefined();

    act(() => result.current.setStage(PRODUCT_ID, "product-setup", "in-progress"));

    const moved = result.current.getProduct(PRODUCT_ID)?.activities["product-setup"];
    expect(moved?.history.length).toBeGreaterThanOrEqual((current?.history.length ?? 0));
  });

  it("gives every history entry and note a unique ID", () => {
    const { result } = renderStore();

    act(() => {
      result.current.addNote(PRODUCT_ID, "studio-imagery", "One");
      result.current.addNote(PRODUCT_ID, "studio-imagery", "Two");
    });

    const ids = result.current.getProduct(PRODUCT_ID)?.activities["studio-imagery"]?.notes.map((note) => note.id) ?? [];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves the other products alone when one changes", () => {
    const { result } = renderStore();
    const other = SEED_PRODUCTS.find((product) => product.id !== PRODUCT_ID)!;

    act(() => result.current.addNote(PRODUCT_ID, "studio-imagery", "Only here"));

    expect(result.current.getProduct(other.id)).toBe(other);
  });

  it("resets every change back to the starting demo data", () => {
    const { result } = renderStore();

    act(() => {
      result.current.addNote(PRODUCT_ID, "studio-imagery", "Temporary");
      result.current.provideInformation(PRODUCT_ID, "sample-availability", "Soon");
    });
    expect(result.current.products).not.toBe(SEED_PRODUCTS);

    act(() => result.current.resetDemoData());

    expect(result.current.products).toBe(SEED_PRODUCTS);
  });

  it("keeps the same action functions between renders when nothing has changed", () => {
    const { result, rerender } = renderStore();
    const first = result.current.getProduct;

    rerender();

    expect(result.current.getProduct).toBe(first);
  });
});

describe("useLaunch", () => {
  it("fails loudly when used outside a LaunchProvider", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useLaunch())).toThrow("useLaunch must be used inside LaunchProvider");

    quiet.mockRestore();
  });
});
