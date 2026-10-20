import { describe, expect, it } from "vitest";
import { createLaunchReducer } from "./store-reducer";
import { makeProduct, withMissingFields } from "./testing/fixtures";

const NOW = "2026-11-10T09:30";

function setup(products = [makeProduct({ id: "100" }), makeProduct({ id: "200" })]) {
  let counter = 0;
  const reducer = createLaunchReducer({
    now: () => NOW,
    newId: (prefix) => `${prefix}-${++counter}`,
    initial: products,
  });
  return { reducer, products };
}

describe("add-product-note", () => {
  it("adds the note to the top of the product's log with the author, role and time", () => {
    const { reducer, products } = setup();

    const first = reducer(products, { type: "add-product-note", productId: "100", text: "First", author: "Sam", role: "commercial" });
    const second = reducer(first, { type: "add-product-note", productId: "100", text: "Second", author: "Alex", role: "downstream" });

    expect(second[0].notes?.map((note) => note.text)).toEqual(["Second", "First"]);
    expect(second[0].notes?.[1]).toMatchObject({ author: "Sam", role: "commercial", at: NOW });
  });

  it("trims the text and ignores an empty note", () => {
    const { reducer, products } = setup();

    const trimmed = reducer(products, { type: "add-product-note", productId: "100", text: "  Hello  ", author: "Sam", role: "commercial" });
    const empty = reducer(products, { type: "add-product-note", productId: "100", text: "   ", author: "Sam", role: "commercial" });

    expect(trimmed[0].notes?.[0].text).toBe("Hello");
    expect(empty).toBe(products);
  });

  it("gives every note its own ID and leaves other products alone", () => {
    const { reducer, products } = setup();

    const a = reducer(products, { type: "add-product-note", productId: "100", text: "A", author: "Sam", role: "commercial" });
    const b = reducer(a, { type: "add-product-note", productId: "100", text: "B", author: "Sam", role: "commercial" });

    expect(new Set(b[0].notes?.map((note) => note.id)).size).toBe(2);
    expect(b[1]).toBe(products[1]);
  });
});

describe("edit-field", () => {
  it("writes the value to the product", () => {
    const { reducer, products } = setup();

    const next = reducer(products, { type: "edit-field", productId: "100", key: "title", value: "  Renamed  " });

    expect(next[0].name).toBe("Renamed");
    expect(next[1]).toBe(products[1]);
  });

  it("starts the SLA on the demo date when an edit completes the last missing field", () => {
    const incomplete = withMissingFields(makeProduct({ id: "100" }), "supplierName");
    const { reducer, products } = setup([incomplete]);

    const next = reducer(products, { type: "edit-field", productId: "100", key: "supplierName", value: "Fictional Manufacturing Co." });

    expect(next[0].infoCompleteAt).toBe("2026-11-10");
  });

  it("does not start the SLA while the product is still incomplete", () => {
    const incomplete = withMissingFields(makeProduct({ id: "100" }), "supplierName", "supplierContact");
    const { reducer, products } = setup([incomplete]);

    const next = reducer(products, { type: "edit-field", productId: "100", key: "supplierName", value: "Fictional Manufacturing Co." });

    expect(next[0].infoCompleteAt).toBeUndefined();
  });

  it("never changes the catalogue number", () => {
    const { reducer, products } = setup();

    const next = reducer(products, { type: "edit-field", productId: "100", key: "catNo", value: "999" });

    expect(next[0]).toBe(products[0]);
  });
});

describe("change-launch-date", () => {
  it("moves the date and records the previous one and when it changed", () => {
    const { reducer, products } = setup();

    const next = reducer(products, { type: "change-launch-date", productId: "100", date: "2027-01-15" });

    expect(next[0]).toMatchObject({
      launchDate: "2027-01-15",
      previousLaunchDate: "2026-12-30",
      launchDateChangedOn: "2026-11-10",
    });
  });

  it("ignores a date that is the same or not a date", () => {
    const { reducer, products } = setup();

    expect(reducer(products, { type: "change-launch-date", productId: "100", date: "2026-12-30" })[0]).toBe(products[0]);
    expect(reducer(products, { type: "change-launch-date", productId: "100", date: "soon" })[0]).toBe(products[0]);
  });
});

describe("reset", () => {
  it("restores the starting products", () => {
    const { reducer, products } = setup();
    const changed = reducer(products, { type: "edit-field", productId: "100", key: "title", value: "Renamed" });

    expect(reducer(changed, { type: "reset" })).toBe(products);
  });
});
