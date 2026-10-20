// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { makeProduct, stateAt, withActivity, withoutInformation } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { ProductDetailView } from "./product-detail-view";

const ready = makeProduct({ id: "1000001", name: "Ready Armchair" });
const outstanding = withActivity(
  makeProduct({ id: "1000002", name: "Unfinished Table" }),
  "product-content",
  stateAt("in-progress"),
);
const missingSupplier = withoutInformation(makeProduct({ id: "1000003", name: "Mystery Chair" }), "supplier");

describe("ProductDetailView", () => {
  describe("when the product does not exist", () => {
    it("says so and offers a way back", () => {
      renderWithStore(<ProductDetailView productId="0000000" />, [ready]);

      expect(screen.getByRole("heading", { level: 1, name: "Product not found" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Back to products" })).toHaveAttribute("href", "/products");
    });
  });

  describe("header", () => {
    it("shows the name, breadcrumbs, status and launch date", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [ready]);

      expect(screen.getByRole("heading", { level: 1, name: "Ready Armchair" })).toBeInTheDocument();
      const crumbs = screen.getByRole("navigation", { name: /breadcrumb/i });
      expect(within(crumbs).getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/");
      expect(within(crumbs).getByRole("link", { name: "Products" })).toHaveAttribute("href", "/products");
      expect(screen.getByText(/Launch date: .*2026/)).toBeInTheDocument();
    });
  });

  describe("readiness banner", () => {
    it("celebrates a product that is ready", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [ready]);

      expect(screen.getByText("Ready to launch")).toBeInTheDocument();
    });

    it("lists what is stopping an unready product, each linking to its activity", () => {
      renderWithStore(<ProductDetailView productId="1000002" />, [outstanding]);

      expect(screen.getByText("What is stopping this product from being ready?")).toBeInTheDocument();
      const alert = screen.getByRole("alert");
      expect(within(alert).getByRole("link")).toHaveAttribute(
        "href",
        "/products/1000002/activities/product-content",
      );
    });

    it("says no work is outstanding once a product is live", () => {
      const live = makeProduct({ id: "1000004", name: "Old Cushion", lifecycle: "Live" });
      renderWithStore(<ProductDetailView productId="1000004" />, [live]);

      expect(screen.getByText("This product is Live")).toBeInTheDocument();
      expect(screen.queryByText("Ready to launch")).not.toBeInTheDocument();
    });
  });

  describe("product summary", () => {
    it("lists the product facts", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [ready]);

      const summary = screen.getByRole("region", { name: "Product summary" });
      expect(within(summary).getByText("1000001")).toBeInTheDocument();
      expect(within(summary).getByText("Oakline")).toBeInTheDocument();
      expect(within(summary).getByText("Furniture")).toBeInTheDocument();
      expect(within(summary).getByText("Supplier provided")).toBeInTheDocument();
      expect(within(summary).getByText("Single option")).toBeInTheDocument();
      expect(within(summary).getByText("Not required")).toBeInTheDocument();
    });

    it("describes a studio, own-brand, variant product with compliance", () => {
      const rich = makeProduct({
        id: "1000005",
        name: "Play Kitchen",
        variantCount: 3,
        characteristics: {
          imagerySource: "studio",
          ownBrand: true,
          hasVariants: true,
          complianceReason: "Toy safety",
        },
      });
      renderWithStore(<ProductDetailView productId="1000005" />, [rich]);

      const summary = screen.getByRole("region", { name: "Product summary" });
      expect(within(summary).getByText("Studio photography")).toBeInTheDocument();
      expect(within(summary).getByText("Parent product, 3 variants")).toBeInTheDocument();
      expect(within(summary).getByText("Sign-off required")).toBeInTheDocument();
      expect(within(summary).getByText("Yes")).toBeInTheDocument();
    });
  });

  describe("progress", () => {
    it("shows activities and inputs complete for a ready product", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [ready]);

      const progress = screen.getByRole("region", { name: "Progress" });
      expect(within(progress).getByText("3 of 3 required activities complete")).toBeInTheDocument();
      expect(within(progress).getByText(/required inputs available/)).toBeInTheDocument();
    });

    it("counts only the finished activities", () => {
      renderWithStore(<ProductDetailView productId="1000002" />, [outstanding]);

      expect(screen.getByText("2 of 3 required activities complete")).toBeInTheDocument();
    });

    it("warns when work cannot begin because information is missing", () => {
      const stuck = withActivity(missingSupplier, "product-setup", stateAt("not-started"));
      renderWithStore(<ProductDetailView productId="1000003" />, [stuck]);

      expect(screen.getByText(/waiting on missing information before work can begin/)).toBeInTheDocument();
    });
  });

  describe("information section", () => {
    it("says everything is available when nothing is missing", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [ready]);

      expect(screen.getByText(/pieces of required information are available/)).toBeInTheDocument();
      expect(screen.getByText("Nothing is missing. No one needs to provide anything.")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Missing (0)" })).toBeInTheDocument();
    });

    it("lists what is missing, with its impact", () => {
      renderWithStore(<ProductDetailView productId="1000003" />, [missingSupplier]);

      expect(screen.getByRole("heading", { name: "Missing (1)" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Supplier" })).toBeInTheDocument();
      expect(screen.getByText("Impact")).toBeInTheDocument();
      expect(screen.getByText(/1 still needs someone to provide it/)).toBeInTheDocument();
    });

    it("explains which items are not required for this product", () => {
      renderWithStore(<ProductDetailView productId="1000001" />, [ready]);

      expect(screen.getByRole("heading", { name: /Not required for this product/ })).toBeInTheDocument();
      expect(screen.getAllByText(/which does not apply to this product/).length).toBeGreaterThan(0);
    });

    it("opens a form that asks the right question", async () => {
      const user = userEvent.setup();
      renderWithStore(<ProductDetailView productId="1000003" />, [missingSupplier]);

      await user.click(screen.getByRole("button", { name: "Provide supplier" }));

      expect(screen.getByLabelText("Which supplier provides this product?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save information" })).toBeDisabled();
    });

    it("does not allow saving blank or whitespace-only answers", async () => {
      const user = userEvent.setup();
      renderWithStore(<ProductDetailView productId="1000003" />, [missingSupplier]);

      await user.click(screen.getByRole("button", { name: "Provide supplier" }));
      await user.type(screen.getByLabelText("Which supplier provides this product?"), "   ");

      expect(screen.getByRole("button", { name: "Save information" })).toBeDisabled();
    });

    it("moves the item to Available once saved", async () => {
      const user = userEvent.setup();
      renderWithStore(<ProductDetailView productId="1000003" />, [missingSupplier]);

      await user.click(screen.getByRole("button", { name: "Provide supplier" }));
      await user.type(screen.getByLabelText("Which supplier provides this product?"), "  Acme Furniture Ltd  ");
      await user.click(screen.getByRole("button", { name: "Save information" }));

      expect(screen.getByRole("heading", { name: "Missing (0)" })).toBeInTheDocument();
      const saved = screen.getByText("Acme Furniture Ltd").closest("li");
      expect(saved).not.toBeNull();
      expect(within(saved as HTMLElement).getByText("Provided by the team")).toBeInTheDocument();
    });

    it("unblocks the work that was waiting on it", async () => {
      const user = userEvent.setup();
      const stuck = withActivity(missingSupplier, "product-setup", stateAt("not-started"));
      renderWithStore(<ProductDetailView productId="1000003" />, [stuck]);
      expect(screen.getByText(/waiting on missing information/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Provide supplier" }));
      await user.type(screen.getByLabelText("Which supplier provides this product?"), "Acme");
      await user.click(screen.getByRole("button", { name: "Save information" }));

      expect(screen.queryByText(/waiting on missing information/)).not.toBeInTheDocument();
    });

    it("discards what was typed when cancelled", async () => {
      const user = userEvent.setup();
      renderWithStore(<ProductDetailView productId="1000003" />, [missingSupplier]);

      await user.click(screen.getByRole("button", { name: "Provide supplier" }));
      await user.type(screen.getByLabelText("Which supplier provides this product?"), "Half typed");
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByLabelText("Which supplier provides this product?")).not.toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Missing (1)" })).toBeInTheDocument();
    });
  });
});
