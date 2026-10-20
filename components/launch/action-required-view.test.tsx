// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeProduct, stateAt, withActivity, withoutInformation } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { ActionRequiredView } from "./action-required-view";

const ready = makeProduct({ id: "1000001", name: "Ready Armchair" });
const atRisk = withActivity(
  makeProduct({ id: "1000002", name: "Urgent Lamp", launchDate: "2026-11-15" }),
  "product-content",
  stateAt("in-progress"),
);
const actionRequired = withActivity(
  makeProduct({ id: "1000003", name: "Distant Table", launchDate: "2026-12-30" }),
  "product-content",
  stateAt("not-started"),
);

describe("ActionRequiredView", () => {
  it("has the page title", () => {
    renderWithStore(<ActionRequiredView />, [ready]);

    expect(screen.getByRole("heading", { level: 1, name: "Action Required" })).toBeInTheDocument();
  });

  it("reassures the reader when every product is ready", () => {
    renderWithStore(<ActionRequiredView />, [ready]);

    expect(screen.getByText("Nothing needs attention")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "At Risk" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Action Required" })).not.toBeInTheDocument();
  });

  it("leaves ready products out of the list", () => {
    renderWithStore(<ActionRequiredView />, [ready, atRisk]);

    expect(screen.queryByText("Ready Armchair")).not.toBeInTheDocument();
    expect(screen.getByText("Urgent Lamp")).toBeInTheDocument();
  });

  it("groups products by readiness with At Risk first", () => {
    renderWithStore(<ActionRequiredView />, [actionRequired, atRisk]);

    const risk = screen.getByRole("region", { name: "At Risk" });
    const action = screen.getByRole("region", { name: "Action Required" });

    expect(within(risk).getByText("Urgent Lamp")).toBeInTheDocument();
    expect(within(action).getByText("Distant Table")).toBeInTheDocument();
    expect(risk.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("only shows a group that has products in it", () => {
    renderWithStore(<ActionRequiredView />, [actionRequired]);

    expect(screen.queryByRole("region", { name: "At Risk" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Action Required" })).toBeInTheDocument();
  });

  it("counts the products in each group, singular and plural", () => {
    const secondAtRisk = withActivity(
      makeProduct({ id: "1000004", name: "Urgent Rug", launchDate: "2026-11-14" }),
      "product-content",
      stateAt("in-progress"),
    );
    renderWithStore(<ActionRequiredView />, [atRisk, secondAtRisk, actionRequired]);

    expect(within(screen.getByRole("region", { name: "At Risk" })).getByText("2 products")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Action Required" })).getByText("1 product")).toBeInTheDocument();
  });

  it("orders products within a group by launch date", () => {
    const sooner = withActivity(
      makeProduct({ id: "1000005", name: "Sooner Chair", launchDate: "2026-12-01" }),
      "product-content",
      stateAt("not-started"),
    );
    renderWithStore(<ActionRequiredView />, [actionRequired, sooner]);

    const group = screen.getByRole("region", { name: "Action Required" });
    const names = within(group)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(names).toEqual(["Sooner Chair", "Distant Table"]);
  });

  it("links each outstanding activity to its own screen", () => {
    renderWithStore(<ActionRequiredView />, [atRisk]);

    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links).toContain("/products/1000002/activities/product-content");
  });

  it("names the information that is holding an activity back", () => {
    const blocked = withoutInformation(
      withActivity(makeProduct({ id: "1000006", name: "Stuck Cabinet" }), "product-setup", stateAt("not-started")),
      "supplier",
    );
    renderWithStore(<ActionRequiredView />, [blocked]);

    expect(screen.getAllByText(/supplier/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toContain(
      "/products/1000006/activities/product-setup",
    );
  });
});
