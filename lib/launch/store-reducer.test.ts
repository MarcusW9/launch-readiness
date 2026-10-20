import { describe, expect, it } from "vitest";
import { INFORMATION_DEFINITIONS } from "./information";
import { createLaunchReducer } from "./store-reducer";
import { makeProduct, stateAt, withoutInformation } from "./testing/fixtures";
import type { Product } from "./types";

const NOW = "2026-10-12T09:30";

function setup(initial: Product[] = []) {
  let counter = 0;
  const reducer = createLaunchReducer({
    now: () => NOW,
    newId: (prefix) => `${prefix}-${++counter}`,
    initial,
  });
  return { reducer };
}

function productNotStarted(): Product {
  return makeProduct({
    id: "100",
    activities: { "product-setup": stateAt("not-started") },
  });
}

describe("add-note", () => {
  it("prepends a note authored by the user at the injected time", () => {
    const { reducer } = setup();
    const product = productNotStarted();
    const [next] = reducer([product], { type: "add-note", productId: "100", key: "product-setup", text: "Call supplier" });

    expect(next.activities["product-setup"]?.notes).toEqual([
      { id: "n-1", at: NOW, author: "You", text: "Call supplier" },
    ]);
  });

  it("leaves other products as the same reference", () => {
    const { reducer } = setup();
    const target = productNotStarted();
    const other = makeProduct({ id: "200" });
    const next = reducer([target, other], { type: "add-note", productId: "100", key: "product-setup", text: "x" });

    expect(next[1]).toBe(other);
  });

  it("does nothing when the product does not have that activity", () => {
    const { reducer } = setup();
    const product = productNotStarted();
    const [next] = reducer([product], { type: "add-note", productId: "100", key: "variants", text: "x" });

    expect(next).toBe(product);
  });
});

describe("set-blocked", () => {
  it("flags the activity and records the reason in history", () => {
    const { reducer } = setup();
    const [next] = reducer([productNotStarted()], {
      type: "set-blocked",
      productId: "100",
      key: "product-setup",
      reason: "Waiting on legal",
    });
    const state = next.activities["product-setup"]!;

    expect(state.blocked).toBe(true);
    expect(state.blockedReason).toBe("Waiting on legal");
    expect(state.history[0]).toEqual({ id: "h-1", at: NOW, text: "Flagged as Blocked: Waiting on legal" });
  });

  it("clears the blocker when the reason is null", () => {
    const { reducer } = setup();
    const blocked = makeProduct({
      id: "100",
      activities: { "product-setup": stateAt("in-progress", { blocked: true, blockedReason: "Old reason" }) },
    });
    const [next] = reducer([blocked], { type: "set-blocked", productId: "100", key: "product-setup", reason: null });
    const state = next.activities["product-setup"]!;

    expect(state.blocked).toBe(false);
    expect(state.blockedReason).toBeUndefined();
    expect(state.history[0].text).toBe("Blocker cleared");
  });
});

describe("set-stage", () => {
  it("moves forward and records the stage label in history", () => {
    const { reducer } = setup();
    const [next] = reducer([productNotStarted()], {
      type: "set-stage",
      productId: "100",
      key: "product-setup",
      stageId: "in-progress",
    });
    const state = next.activities["product-setup"]!;

    expect(state.stage).toBe("in-progress");
    expect(state.history[0]).toEqual({ id: "h-1", at: NOW, text: "Moved to In Progress" });
  });

  it("ignores a stage id that is not in the workflow", () => {
    const { reducer } = setup();
    const products = [productNotStarted()];

    expect(reducer(products, { type: "set-stage", productId: "100", key: "product-setup", stageId: "nonsense" })).toBe(
      products,
    );
  });

  it("refuses to start while start information is missing", () => {
    const { reducer } = setup();
    const products = [withoutInformation(productNotStarted(), "supplier")];

    expect(reducer(products, { type: "set-stage", productId: "100", key: "product-setup", stageId: "in-progress" })).toBe(
      products,
    );
  });

  it("refuses to complete while required information is missing", () => {
    const { reducer } = setup();
    const inProgress = makeProduct({
      id: "100",
      activities: { "product-setup": stateAt("in-progress") },
    });
    const products = [withoutInformation(inProgress, "pricing")];

    expect(reducer(products, { type: "set-stage", productId: "100", key: "product-setup", stageId: "complete" })).toBe(
      products,
    );
  });

  it("completes when all required information is present and clears any blocker", () => {
    const { reducer } = setup();
    const inProgress = makeProduct({
      id: "100",
      activities: { "product-setup": stateAt("in-progress", { blocked: true, blockedReason: "Stale" }) },
    });
    const [next] = reducer([inProgress], {
      type: "set-stage",
      productId: "100",
      key: "product-setup",
      stageId: "complete",
    });
    const state = next.activities["product-setup"]!;

    expect(state.stage).toBe("complete");
    expect(state.blocked).toBe(false);
    expect(state.blockedReason).toBeUndefined();
  });

  it("allows moving backwards even when information is missing", () => {
    const { reducer } = setup();
    const complete = makeProduct({ id: "100" });
    const products = [withoutInformation(complete, "pricing")];
    const [next] = reducer(products, {
      type: "set-stage",
      productId: "100",
      key: "product-setup",
      stageId: "in-progress",
    });

    expect(next.activities["product-setup"]?.stage).toBe("in-progress");
  });
});

describe("provide-information", () => {
  const pricingLabel = INFORMATION_DEFINITIONS.pricing.label;

  it("stores the value as team-sourced at the injected time", () => {
    const { reducer } = setup();
    const products = [withoutInformation(productNotStarted(), "pricing")];
    const [next] = reducer(products, { type: "provide-information", productId: "100", infoKey: "pricing", value: "£25" });

    expect(next.information.pricing).toEqual({ value: "£25", source: "team", at: NOW });
  });

  it("adds a history entry only to activities that require that information", () => {
    const { reducer } = setup();
    const products = [withoutInformation(productNotStarted(), "pricing")];
    const [next] = reducer(products, { type: "provide-information", productId: "100", infoKey: "pricing", value: "£25" });

    expect(next.activities["product-setup"]?.history[0].text).toBe(`${pricingLabel} provided`);
    expect(next.activities["product-content"]?.history).toEqual([]);
  });

  it("does not touch other products", () => {
    const { reducer } = setup();
    const other = makeProduct({ id: "200" });
    const next = reducer([withoutInformation(productNotStarted(), "pricing"), other], {
      type: "provide-information",
      productId: "100",
      infoKey: "pricing",
      value: "£25",
    });

    expect(next[1]).toBe(other);
  });

  it("unblocks starting once the last start-blocking item is provided", () => {
    const { reducer } = setup();
    const products = [withoutInformation(productNotStarted(), "supplier")];
    const afterProvide = reducer(products, {
      type: "provide-information",
      productId: "100",
      infoKey: "supplier",
      value: "Acme Ltd",
    });
    const [started] = reducer(afterProvide, {
      type: "set-stage",
      productId: "100",
      key: "product-setup",
      stageId: "in-progress",
    });

    expect(started.activities["product-setup"]?.stage).toBe("in-progress");
  });
});

describe("add-product-note", () => {
  const add = (text: string) =>
    ({ type: "add-product-note", productId: "100", text, author: "Priya Shah", role: "commercial" }) as const;

  it("puts the new note at the top of the product's log", () => {
    const { reducer } = setup();
    const existing = { id: "pn-0", at: "2026-11-02T09:00", author: "Daniel Okafor", role: "downstream", text: "Older" } as const;
    const [next] = reducer([{ ...productNotStarted(), notes: [existing] }], add("  Newer  "));

    expect(next.notes).toEqual([
      { id: "pn-1", at: NOW, author: "Priya Shah", role: "commercial", text: "Newer" },
      existing,
    ]);
  });

  it("ignores empty and over-long notes", () => {
    const { reducer } = setup();
    const products = [productNotStarted()];

    expect(reducer(products, add("   "))).toBe(products);
    expect(reducer(products, add("a".repeat(501)))).toBe(products);
  });

  it("leaves other products as the same reference and changes nothing else on the product", () => {
    const { reducer } = setup();
    const target = productNotStarted();
    const other = makeProduct({ id: "200" });
    const [next, untouched] = reducer([target, other], add("Hello"));

    expect(untouched).toBe(other);
    expect({ ...next, notes: undefined }).toEqual({ ...target, notes: undefined });
  });
});

describe("reset", () => {
  it("returns the initial data it was created with", () => {
    const initial = [makeProduct({ id: "seed" })];
    const { reducer } = setup(initial);
    const changed = reducer([productNotStarted()], { type: "reset" });

    expect(changed).toBe(initial);
  });
});

describe("purity", () => {
  it("never mutates the state it receives", () => {
    const { reducer } = setup();
    const product = productNotStarted();
    const snapshot = JSON.stringify(product);

    reducer([product], { type: "add-note", productId: "100", key: "product-setup", text: "x" });
    reducer([product], { type: "set-blocked", productId: "100", key: "product-setup", reason: "r" });
    reducer([product], { type: "set-stage", productId: "100", key: "product-setup", stageId: "in-progress" });
    reducer([product], { type: "provide-information", productId: "100", infoKey: "pricing", value: "v" });

    expect(JSON.stringify(product)).toBe(snapshot);
  });
});
