// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeProduct } from "@/lib/launch/testing/fixtures";
import { ProductsTable } from "./products-table";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const products = [
  makeProduct({ id: "1000001", name: "Oat Cookies", category: "Bakery" }),
  makeProduct({ id: "1000002", name: "Garden Chair", category: "Furniture" }),
];

describe("ProductsTable", () => {
  beforeEach(() => {
    push.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has an accessible caption and the expected column headings", () => {
    render(<ProductsTable products={products} caption="All products" />);

    expect(screen.getByRole("table", { name: "All products" })).toBeInTheDocument();
    const headings = screen.getAllByRole("columnheader").map((heading) => heading.textContent);
    expect(headings).toEqual([
      "Product",
      "Category",
      "Launch date",
      "Imagery",
      "Content",
      "Variants",
      "Compliance",
      "Status",
    ]);
  });

  it("shows one row per product, with its name, ID and category", () => {
    render(<ProductsTable products={products} caption="All products" />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);

    const first = within(rows[0]);
    expect(first.getByRole("link", { name: "Oat Cookies" })).toHaveAttribute("href", "/products/1000001");
    expect(first.getByText("ID 1000001")).toBeInTheDocument();
    expect(first.getByText("Bakery")).toBeInTheDocument();

    expect(within(rows[1]).getByRole("link", { name: "Garden Chair" })).toHaveAttribute("href", "/products/1000002");
  });

  it("shows each product's launch status as words", () => {
    render(<ProductsTable products={[makeProduct({ id: "1000003", lifecycle: "Live" })]} caption="Live" />);

    expect(within(screen.getAllByRole("row")[1]).getByText("Live")).toBeInTheDocument();
  });

  it("renders only the header when there are no products", () => {
    render(<ProductsTable products={[]} caption="Nothing here" />);

    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  it("opens the product when any part of its row is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ProductsTable products={products} caption="All products" />);

    await user.click(screen.getByText("Furniture"));

    expect(push).toHaveBeenCalledExactlyOnceWith("/products/1000002");
  });

  it("lets the product link navigate on its own instead of also pushing from the row", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ProductsTable products={products} caption="All products" />);

    await user.click(screen.getByRole("link", { name: "Oat Cookies" }));

    expect(push).not.toHaveBeenCalled();
  });
});
