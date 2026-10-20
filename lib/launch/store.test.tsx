// @vitest-environment jsdom
import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LaunchProvider, useLaunch } from "./store";
import { makeProduct } from "./testing/fixtures";

const PRODUCTS = [makeProduct({ id: "100", name: "Armchair" }), makeProduct({ id: "200", name: "Table" })];

const wrapper = ({ children }: { children: ReactNode }) => (
  <LaunchProvider initialProducts={PRODUCTS}>{children}</LaunchProvider>
);

const renderStore = () => renderHook(() => useLaunch(), { wrapper });

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
      <LaunchProvider initialProducts={PRODUCTS}>
        <p>Inside the store</p>
      </LaunchProvider>,
    );

    expect(screen.getByText("Inside the store")).toBeInTheDocument();
  });

  it("starts with the products it was given and finds one by ID", () => {
    const { result } = renderStore();

    expect(result.current.products).toBe(PRODUCTS);
    expect(result.current.getProduct("200")?.name).toBe("Table");
    expect(result.current.getProduct("missing")).toBeUndefined();
  });

  it("adds a note stamped with the demo date and the real time of day", () => {
    const { result } = renderStore();

    act(() => result.current.addProductNote("100", { text: "Called the supplier", author: "Sam", role: "commercial" }));

    expect(result.current.getProduct("100")?.notes?.[0]).toMatchObject({ text: "Called the supplier", at: "2026-11-10T09:05" });
  });

  it("edits a field and leaves the other products alone", () => {
    const { result } = renderStore();

    act(() => result.current.editField("100", "title", "Renamed"));

    expect(result.current.getProduct("100")?.name).toBe("Renamed");
    expect(result.current.getProduct("200")).toBe(PRODUCTS[1]);
  });

  it("changes the launch date and records the change", () => {
    const { result } = renderStore();

    act(() => result.current.changeLaunchDate("100", "2027-02-01"));

    expect(result.current.getProduct("100")).toMatchObject({
      launchDate: "2027-02-01",
      previousLaunchDate: "2026-12-30",
      launchDateChangedOn: "2026-11-10",
    });
  });

  it("gives every note a unique ID", () => {
    const { result } = renderStore();

    act(() => {
      result.current.addProductNote("100", { text: "One", author: "Sam", role: "commercial" });
      result.current.addProductNote("100", { text: "Two", author: "Sam", role: "commercial" });
    });

    const ids = result.current.getProduct("100")?.notes?.map((note) => note.id) ?? [];
    expect(new Set(ids).size).toBe(2);
  });

  it("resets every change back to the starting demo data", () => {
    const { result } = renderStore();

    act(() => {
      result.current.editField("100", "title", "Renamed");
      result.current.changeLaunchDate("200", "2027-02-01");
    });
    act(() => result.current.resetDemoData());

    expect(result.current.products).toBe(PRODUCTS);
  });

  it("refuses to be used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => renderHook(() => useLaunch())).toThrow("useLaunch must be used inside LaunchProvider");

    spy.mockRestore();
  });
});
