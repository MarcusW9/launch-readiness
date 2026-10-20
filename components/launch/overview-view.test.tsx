// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeProduct, withMissingFields } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { OverviewView } from "./overview-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const ready = makeProduct({ id: "1000001", name: "Ready Armchair" });
const incomplete = withMissingFields(makeProduct({ id: "1000002", name: "Unfinished Table" }), "supplierName");

describe("OverviewView", () => {
  it("has the page title and description", () => {
    renderWithStore(<OverviewView />, [ready]);

    expect(screen.getByRole("heading", { level: 1, name: "Product Launch Readiness" })).toBeInTheDocument();
    expect(screen.getByText(/Track upcoming products/)).toBeInTheDocument();
  });

  it("says nothing needs attention when every product is on track", () => {
    renderWithStore(<OverviewView />, [ready]);

    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
    expect(screen.getByText("Every product is on track.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /See what is holding each one back/ })).not.toBeInTheDocument();
  });

  it("uses the singular when exactly one product needs attention", () => {
    renderWithStore(<OverviewView />, [ready, incomplete]);

    expect(screen.getByText("1 product needs your attention")).toBeInTheDocument();
  });

  it("uses the plural when several products need attention", () => {
    const another = withMissingFields(makeProduct({ id: "1000003", name: "Another Table" }), "supplierName");
    renderWithStore(<OverviewView />, [incomplete, another]);

    expect(screen.getByText("2 products need your attention")).toBeInTheDocument();
  });

  it("splits attention between at risk and waiting on information", () => {
    const atRisk = makeProduct({ id: "1000004", name: "Late Lamp", launchDate: "2026-11-20", infoCompleteAt: "2026-11-02" });
    renderWithStore(<OverviewView />, [atRisk, incomplete]);

    expect(screen.getByText(/1 at risk of missing launch and 1 waiting on mandatory information/)).toBeInTheDocument();
  });

  it("links to the Action Required screen when something needs attention", () => {
    renderWithStore(<OverviewView />, [incomplete]);

    expect(screen.getByRole("link", { name: "See what is holding each one back" })).toHaveAttribute(
      "href",
      "/action-required",
    );
  });

  it("lists the most urgent launches in a table", () => {
    renderWithStore(<OverviewView />, [ready, incomplete]);

    const table = screen.getByRole("table", { name: "Most urgent upcoming launches" });
    expect(within(table).getByText("Ready Armchair")).toBeInTheDocument();
    expect(within(table).getByText("Unfinished Table")).toBeInTheDocument();
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

  it("reports mandatory fields complete out of the total", () => {
    renderWithStore(<OverviewView />, [incomplete]);

    expect(screen.getByText(/Mandatory fields complete: \d+ of \d+/)).toBeInTheDocument();
  });

  it("ignores products that have already launched", () => {
    const launched = makeProduct({ id: "1000005", name: "Old Cushion", lifecycle: "Live" });
    renderWithStore(<OverviewView />, [launched]);

    expect(screen.queryByText("Old Cushion")).not.toBeInTheDocument();
    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
  });
});
