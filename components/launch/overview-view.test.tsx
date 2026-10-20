// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeProduct, stateAt, withActivity, withoutInformation } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { OverviewView } from "./overview-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const ready = makeProduct({ id: "1000001", name: "Ready Armchair" });
const needsContent = withActivity(
  makeProduct({ id: "1000002", name: "Unfinished Table" }),
  "product-content",
  stateAt("in-progress"),
);

describe("OverviewView", () => {
  it("has the page title and description", () => {
    renderWithStore(<OverviewView />, [ready]);

    expect(screen.getByRole("heading", { level: 1, name: "Product Launch Readiness" })).toBeInTheDocument();
    expect(screen.getByText(/Track upcoming products/)).toBeInTheDocument();
  });

  it("says nothing needs attention when every product is ready", () => {
    renderWithStore(<OverviewView />, [ready]);

    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
    expect(screen.getByText("Every product is ready to launch.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /See what is holding each one back/ })).not.toBeInTheDocument();
  });

  it("uses the singular when exactly one product needs attention", () => {
    renderWithStore(<OverviewView />, [ready, needsContent]);

    expect(screen.getByText("1 product needs your attention")).toBeInTheDocument();
  });

  it("uses the plural when several products need attention", () => {
    const another = withActivity(
      makeProduct({ id: "1000003", name: "Another Table" }),
      "product-content",
      stateAt("in-progress"),
    );
    renderWithStore(<OverviewView />, [needsContent, another]);

    expect(screen.getByText("2 products need your attention")).toBeInTheDocument();
  });

  it("links to the Action Required screen when something needs attention", () => {
    renderWithStore(<OverviewView />, [needsContent]);

    expect(screen.getByRole("link", { name: "See what is holding each one back" })).toHaveAttribute(
      "href",
      "/action-required",
    );
  });

  it("does not show the missing-information notice when everything is known", () => {
    renderWithStore(<OverviewView />, [ready]);

    expect(screen.queryByText(/missing required information/)).not.toBeInTheDocument();
  });

  it("counts missing information separately from outstanding work", () => {
    const missingOne = withoutInformation(makeProduct({ id: "1000004", name: "Mystery Chair" }), "supplier");
    renderWithStore(<OverviewView />, [ready, missingOne]);

    expect(screen.getByText("1 product is missing required information")).toBeInTheDocument();
    expect(screen.getByText(/1 piece of information still need someone to provide them/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See which products" })).toHaveAttribute(
      "href",
      "/products?information=missing",
    );
  });

  it("lists the most urgent launches in a table", () => {
    renderWithStore(<OverviewView />, [ready, needsContent]);

    const table = screen.getByRole("table", { name: "Most urgent upcoming launches" });
    expect(within(table).getByRole("link", { name: "Ready Armchair" })).toBeInTheDocument();
    expect(within(table).getByRole("link", { name: "Unfinished Table" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View all products/ })).toHaveAttribute("href", "/products");
  });

  it("shows only the six most urgent launches", () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      makeProduct({ id: `200000${i}`, name: `Armchair ${i}`, launchDate: `2026-12-${String(10 + i).padStart(2, "0")}` }),
    );
    renderWithStore(<OverviewView />, many);

    const table = screen.getByRole("table", { name: "Most urgent upcoming launches" });
    expect(within(table).getAllByRole("row").slice(1)).toHaveLength(6);
  });

  it("shows how much work is complete for each activity", () => {
    renderWithStore(<OverviewView />, [ready, needsContent]);

    expect(screen.getByText("Product setup: 2 of 2 complete")).toBeInTheDocument();
    expect(screen.getByText("Product content: 1 of 2 complete")).toBeInTheDocument();
    expect(screen.getByText("Variants: 0 of 0 complete")).toBeInTheDocument();
  });

  it("reports required information available out of the total", () => {
    const missingOne = withoutInformation(makeProduct({ id: "1000004", name: "Mystery Chair" }), "supplier");
    renderWithStore(<OverviewView />, [missingOne]);

    expect(screen.getByText(/Required information available: \d+ of \d+/)).toBeInTheDocument();
  });

  it("ignores products that have already launched", () => {
    const launched = makeProduct({ id: "1000005", name: "Old Cushion", lifecycle: "Live" });
    renderWithStore(<OverviewView />, [launched]);

    expect(screen.queryByRole("link", { name: "Old Cushion" })).not.toBeInTheDocument();
    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
  });
});
