// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { sessionForRole } from "@/lib/auth/permissions";
import { makeProduct, withMissingFields } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { ProductDetailView } from "./product-detail-view";

const onTrack = makeProduct({ id: "1000001", name: "Ready Armchair" });
const incomplete = withMissingFields(makeProduct({ id: "1000003", name: "Mystery Chair" }), "supplierName");
const atRisk = makeProduct({
  id: "1000002",
  name: "Late Table",
  launchDate: "2026-11-16",
  infoCompleteAt: "2026-11-10",
});

describe("ProductDetailView", () => {
  describe("when the product does not exist", () => {
    it("says so and offers a way back", () => {
      renderWithStore(<ProductDetailView productId="0000000" />, [onTrack]);

      expect(screen.getByRole("heading", { level: 1, name: "Product not found" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Back to products" })).toHaveAttribute("href", "/products");
    });
  });

  describe("header", () => {
    it("shows the name, breadcrumbs and proposed launch date", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      expect(screen.getByRole("heading", { level: 1, name: "Ready Armchair" })).toBeInTheDocument();
      const crumbs = screen.getByRole("navigation", { name: /breadcrumb/i });
      expect(within(crumbs).getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/");
      expect(within(crumbs).getByRole("link", { name: "Products" })).toHaveAttribute("href", "/products");
      expect(screen.getByText(/Proposed launch: .*2026/)).toBeInTheDocument();
    });
  });

  describe("status", () => {
    it("explains why a product is On Track", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      expect(screen.getByText("Why this status")).toBeInTheDocument();
      expect(screen.getByText(/All mandatory information is in and the SLA projection/)).toBeInTheDocument();
    });

    it("explains how late an Expectation At Risk product is", () => {
      renderWithStore(<ProductDetailView productId="1000002" />, [atRisk]);

      expect(screen.getByText(/working days? after the proposed launch/)).toBeInTheDocument();
    });

    it("says what is missing when information is incomplete", () => {
      renderWithStore(<ProductDetailView productId="1000003" />, [incomplete]);

      expect(screen.getByText(/1 mandatory field still missing \(Supplier Name\)/)).toBeInTheDocument();
    });

    it("says no launch preparation is tracked once a product is live", () => {
      const live = makeProduct({ id: "1000004", name: "Old Cushion", lifecycle: "Live" });
      renderWithStore(<ProductDetailView productId="1000004" />, [live]);

      expect(screen.getByText("This product is Live")).toBeInTheDocument();
    });
  });

  describe("product summary", () => {
    it("lists the product facts", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      const summary = screen.getByRole("region", { name: "Product summary" });
      expect(within(summary).getByText("1000001")).toBeInTheDocument();
      expect(within(summary).getByText("Oakline")).toBeInTheDocument();
      expect(within(summary).getByText("Furniture")).toBeInTheDocument();
    });
  });

  describe("product information", () => {
    it("counts the mandatory fields that are complete", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      const info = screen.getByRole("region", { name: /Product information/ });
      expect(within(info).getByText(/(\d+) of \1 mandatory fields complete/)).toBeInTheDocument();
    });

    it("flags the group that has a mandatory field missing", () => {
      renderWithStore(<ProductDetailView productId="1000003" />, [incomplete]);

      expect(screen.getByText("1 mandatory missing")).toBeInTheDocument();
    });

    const rowFor = (label: string) => screen.getByText(label).closest("div") as HTMLElement;
    const headerFor = (label: RegExp) => screen.getByText(label).closest("summary") as HTMLElement;

    it("keeps the amber Missing badge for an empty mandatory field", () => {
      renderWithStore(<ProductDetailView productId="1000003" />, [incomplete]);

      const row = rowFor("Supplier Name");
      expect(within(row).getByText("Missing")).toBeInTheDocument();
      expect(within(row).getByText("(mandatory)")).toBeInTheDocument();
      expect(within(row).queryByText("Not provided")).not.toBeInTheDocument();
    });

    it("shows an empty optional field as plain muted Not provided, with no badge", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      const row = rowFor("Sub-range");
      const text = within(row).getByText("Not provided");
      expect(text).toHaveClass("text-muted-foreground");
      expect(within(row).queryByText("Missing")).not.toBeInTheDocument();
      expect(within(row).queryByText("(mandatory)")).not.toBeInTheDocument();
    });

    it("never shows Missing when only optional fields are empty", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      expect(screen.queryByText("Missing")).not.toBeInTheDocument();
      expect(screen.queryByText(/mandatory missing/)).not.toBeInTheDocument();
    });

    it("keeps the Data error badge for an optional field holding #N/A", () => {
      const product = makeProduct({ id: "1000005", name: "Odd Lamp", fields: { barcode: "#N/A" } });
      renderWithStore(<ProductDetailView productId="1000005" />, [product]);

      const row = rowFor("Barcode (EAN)");
      expect(within(row).getByText("Data error (#N/A)")).toBeInTheDocument();
      expect(within(row).queryByText("Missing")).not.toBeInTheDocument();
      expect(within(row).queryByText("Not provided")).not.toBeInTheDocument();
    });

    it("shows Complete on a section whose mandatory fields are all in, even with optional gaps", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      const header = headerFor(/Product identity|Identity/i);
      expect(within(header).getByText("Complete")).toBeInTheDocument();
    });

    it("leaves a section with no mandatory fields without a badge", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      const header = headerFor(/Photography/i);
      expect(within(header).queryByText("Complete")).not.toBeInTheDocument();
      expect(within(header).queryByText(/mandatory missing/)).not.toBeInTheDocument();
    });
  });

  describe("launch date", () => {
    it("is read-only for the downstream team", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack]);

      expect(screen.queryByRole("button", { name: /Change launch date/ })).not.toBeInTheDocument();
    });

    it("lets the commercial team change the proposed date and cancel", async () => {
      const user = userEvent.setup();
      renderWithStore(<ProductDetailView productId="1000001" />, [onTrack], sessionForRole("commercial"));

      await user.click(screen.getByRole("button", { name: /Change launch date/ }));
      expect(screen.getByLabelText("Proposed launch date")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByLabelText("Proposed launch date")).not.toBeInTheDocument();
    });
  });
});
