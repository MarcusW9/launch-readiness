// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeProduct, withMissingFields } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { ActionRequiredView } from "./action-required-view";

const ready = makeProduct({ id: "1000001", name: "Ready Armchair" });
const atRisk = makeProduct({
  id: "1000002",
  name: "Urgent Lamp",
  launchDate: "2026-11-20",
  infoCompleteAt: "2026-11-02",
});
const incomplete = withMissingFields(
  makeProduct({ id: "1000003", name: "Distant Table", launchDate: "2026-12-30" }),
  "supplierName",
);

describe("ActionRequiredView", () => {
  it("has the page title", () => {
    renderWithStore(<ActionRequiredView />, [ready]);

    expect(screen.getByRole("heading", { level: 1, name: "Action Required" })).toBeInTheDocument();
  });

  it("reassures the reader when every product is on track", () => {
    renderWithStore(<ActionRequiredView />, [ready]);

    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Expectation At Risk" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Information Incomplete" })).not.toBeInTheDocument();
  });

  it("leaves on track products out of the list", () => {
    renderWithStore(<ActionRequiredView />, [ready, atRisk]);

    expect(screen.queryByText("Ready Armchair")).not.toBeInTheDocument();
    expect(screen.getByText("Urgent Lamp")).toBeInTheDocument();
  });

  it("leaves launched and dropped products out of the list", () => {
    const dropped = withMissingFields(makeProduct({ id: "1000009", name: "Gone Stool", lifecycle: "Dropped" }), "supplierName");
    renderWithStore(<ActionRequiredView />, [dropped]);

    expect(screen.queryByText("Gone Stool")).not.toBeInTheDocument();
    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
  });

  it("groups products by status with Expectation At Risk first", () => {
    renderWithStore(<ActionRequiredView />, [incomplete, atRisk]);

    const risk = screen.getByRole("region", { name: "Expectation At Risk" });
    const info = screen.getByRole("region", { name: "Information Incomplete" });

    expect(within(risk).getByText("Urgent Lamp")).toBeInTheDocument();
    expect(within(info).getByText("Distant Table")).toBeInTheDocument();
    expect(risk.compareDocumentPosition(info) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("only shows a group that has products in it", () => {
    renderWithStore(<ActionRequiredView />, [incomplete]);

    expect(screen.queryByRole("region", { name: "Expectation At Risk" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Information Incomplete" })).toBeInTheDocument();
  });

  it("counts the products in each group", () => {
    const secondAtRisk = makeProduct({
      id: "1000004",
      name: "Urgent Rug",
      launchDate: "2026-11-19",
      infoCompleteAt: "2026-11-02",
    });
    renderWithStore(<ActionRequiredView />, [atRisk, secondAtRisk, incomplete]);

    expect(within(screen.getByRole("region", { name: "Expectation At Risk" })).getByText("(2)")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Information Incomplete" })).getByText("(1)")).toBeInTheDocument();
  });

  it("orders products within a group by launch date", () => {
    const sooner = withMissingFields(
      makeProduct({ id: "1000005", name: "Sooner Chair", launchDate: "2026-12-01" }),
      "supplierName",
    );
    renderWithStore(<ActionRequiredView />, [incomplete, sooner]);

    const group = screen.getByRole("region", { name: "Information Incomplete" });
    const names = within(group)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(names).toEqual(["Sooner Chair", "Distant Table"]);
  });

  it("explains why a product has its status and links to the product", () => {
    renderWithStore(<ActionRequiredView />, [atRisk]);

    expect(screen.getByText(/after the proposed launch/)).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toContain("/products/1000002");
  });

  it("names the missing mandatory information and links it to the product page", () => {
    renderWithStore(<ActionRequiredView />, [incomplete]);

    const missing = screen.getByRole("region", { name: "Missing information for Distant Table" });
    const link = within(missing).getByRole("link", { name: /supplier/i });

    expect(link).toHaveAttribute("href", "/products/1000003#information");
  });
});
