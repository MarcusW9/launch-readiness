// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { makeProduct, stateAt, withActivity, withoutInformation } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { ActivityDetailView } from "./activity-detail-view";

const content = withActivity(
  makeProduct({ id: "1000001", name: "Unfinished Table" }),
  "product-content",
  stateAt("in-progress"),
);

function renderContent(product = content, activityKey = "product-content") {
  return renderWithStore(<ActivityDetailView productId={product.id} activityKey={activityKey} />, [product]);
}

describe("ActivityDetailView", () => {
  describe("when the page cannot be found", () => {
    it("says so for an unknown product", () => {
      renderWithStore(<ActivityDetailView productId="0000000" activityKey="product-content" />, [content]);

      expect(screen.getByRole("heading", { level: 1, name: "Activity not found" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Back to products" })).toHaveAttribute("href", "/products");
    });

    it("says so for an unknown activity", () => {
      renderContent(content, "not-an-activity");

      expect(screen.getByRole("heading", { level: 1, name: "Activity not found" })).toBeInTheDocument();
    });
  });

  describe("when the activity does not apply", () => {
    it("explains why and sends the reader back", () => {
      renderContent(content, "variants");

      expect(screen.getByRole("heading", { level: 1, name: "Variants" })).toBeInTheDocument();
      expect(screen.getByText("Not required for this product")).toBeInTheDocument();
      expect(screen.getByText(/single sellable option/)).toBeInTheDocument();
      expect(screen.queryByRole("region", { name: "Workflow" })).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Return to product" })).toHaveAttribute("href", "/products/1000001");
    });
  });

  describe("overview of the activity", () => {
    it("shows who it is for, who owns it, and the next action", () => {
      renderContent();

      expect(screen.getByRole("heading", { level: 1, name: "Product Content" })).toBeInTheDocument();
      expect(screen.getByText(/Owner: /)).toBeInTheDocument();
      expect(screen.getByText("Next action:")).toBeInTheDocument();
      const productLinks = screen.getAllByRole("link", { name: "Unfinished Table" });
      expect(productLinks.length).toBeGreaterThan(0);
      for (const link of productLinks) expect(link).toHaveAttribute("href", "/products/1000001");
    });

    it("explains the requirement and when it is done", () => {
      renderContent();

      const requirement = screen.getByRole("region", { name: "Requirement" });
      expect(within(requirement).getByText(/Done when:/)).toBeInTheDocument();
    });

    it("tells the reader this is the last thing standing between the product and Ready", () => {
      renderContent();

      expect(
        screen.getByText("This is the only activity left. Completing it makes the product Ready."),
      ).toBeInTheDocument();
    });

    it("lists the other outstanding activities when there are several", () => {
      const several = withActivity(content, "supplier-imagery", stateAt("not-started"));
      renderContent(several);

      const impact = screen.getByRole("region", { name: "Product readiness" });
      expect(within(impact).getByText("Also outstanding:")).toBeInTheDocument();
      expect(within(impact).getByRole("link", { name: "Return to product" })).toHaveAttribute(
        "href",
        "/products/1000001",
      );
    });

    it("lists the information this activity needs", () => {
      renderContent();

      const info = screen.getByRole("region", { name: /Information needed|needed/i });
      expect(within(info).getByText(/required inputs available/)).toBeInTheDocument();
    });

    it("links to the product page when something is missing", () => {
      const missing = withoutInformation(content, "key-features");
      renderContent(missing);

      expect(screen.getByRole("link", { name: /Provide on product page/ })).toHaveAttribute(
        "href",
        "/products/1000001#information-heading",
      );
      expect(screen.getByText("Key features: missing")).toBeInTheDocument();
    });

    it("shows the studio brief when there is one", () => {
      const studio = withActivity(
        makeProduct({
          id: "1000009",
          name: "Play Kitchen",
          characteristics: { imagerySource: "studio" },
          studioBrief: { requiredImagery: ["Hero shot", "Detail close-up"], styling: "Bright playroom" },
        }),
        "studio-imagery",
        stateAt("required"),
      );
      renderContent(studio, "studio-imagery");

      const brief = screen.getByRole("region", { name: "Brief" });
      expect(within(brief).getByRole("heading", { name: "Required imagery" })).toBeInTheDocument();
      expect(within(brief).getByText("Hero shot")).toBeInTheDocument();
      expect(within(brief).getByText("Detail close-up")).toBeInTheDocument();
      expect(within(brief).getByText("Bright playroom")).toBeInTheDocument();
    });
  });

  describe("workflow", () => {
    it("offers the next stage and the previous one", () => {
      renderContent();

      expect(screen.getByRole("button", { name: "Mark complete" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Move back to Not Started" })).toBeEnabled();
    });

    it("only offers going forward from the first stage", () => {
      renderContent(withActivity(content, "product-content", stateAt("not-started")));

      expect(screen.getByRole("button", { name: "Mark as In Progress" })).toBeEnabled();
      expect(screen.queryByRole("button", { name: /Move back/ })).not.toBeInTheDocument();
    });

    it("moves forward and updates the page", async () => {
      const user = userEvent.setup();
      renderContent(withActivity(content, "product-content", stateAt("not-started")));

      await user.click(screen.getByRole("button", { name: "Mark as In Progress" }));

      expect(screen.getByRole("button", { name: "Mark complete" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Move back to Not Started" })).toBeInTheDocument();
    });

    it("moves back a stage", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.click(screen.getByRole("button", { name: "Move back to Not Started" }));

      expect(screen.getByRole("button", { name: "Mark as In Progress" })).toBeInTheDocument();
    });

    it("celebrates completion and says the product is now Ready", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.click(screen.getByRole("button", { name: "Mark complete" }));

      expect(screen.getByText("Product Content complete")).toBeInTheDocument();
      expect(screen.getByText(/Unfinished Table is now Ready/)).toBeInTheDocument();
      expect(screen.queryByText("Next action:")).not.toBeInTheDocument();
    });

    it("says how much is still outstanding when completing is not the last step", async () => {
      const user = userEvent.setup();
      renderContent(withActivity(content, "supplier-imagery", stateAt("not-started")));

      await user.click(screen.getByRole("button", { name: "Mark complete" }));

      expect(screen.getByText(/1 required activity is still outstanding/)).toBeInTheDocument();
    });

    it("lets a completed activity be reopened", async () => {
      const user = userEvent.setup();
      renderContent(withActivity(content, "product-content", stateAt("complete")));

      await user.click(screen.getByRole("button", { name: "Reopen (back to In Progress)" }));

      expect(screen.queryByText("Product Content complete")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Mark complete" })).toBeInTheDocument();
    });

    it("hides the blocking controls once complete", () => {
      renderContent(withActivity(content, "product-content", stateAt("complete")));

      expect(screen.queryByRole("button", { name: "Flag as blocked" })).not.toBeInTheDocument();
    });
  });

  describe("when required information is missing before work can start", () => {
    const stuck = withoutInformation(
      withActivity(makeProduct({ id: "1000002", name: "Stuck Cabinet" }), "product-setup", stateAt("not-started")),
      "supplier",
    );

    it("explains what is missing and where to provide it", () => {
      renderContent(stuck, "product-setup");

      expect(screen.getByText("Cannot start yet")).toBeInTheDocument();
      expect(screen.getByText(/Missing supplier/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Provide information" })).toHaveAttribute(
        "href",
        "/products/1000002#information-heading",
      );
    });

    it("will not let the work move forward", () => {
      renderContent(stuck, "product-setup");

      expect(screen.getByRole("button", { name: "Mark as In Progress" })).toBeDisabled();
    });

    it("lets the work move forward once the information exists", () => {
      const fixed = withActivity(
        makeProduct({ id: "1000002", name: "Stuck Cabinet" }),
        "product-setup",
        stateAt("not-started"),
      );
      renderContent(fixed, "product-setup");

      expect(screen.queryByText("Cannot start yet")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Mark as In Progress" })).toBeEnabled();
    });
  });

  describe("blockers", () => {
    const blocked = withActivity(
      content,
      "product-content",
      stateAt("in-progress", { blocked: true, blockedReason: "Waiting on supplier" }),
    );

    it("shows why an activity is blocked", () => {
      renderContent(blocked);

      const alert = screen.getByRole("alert");
      expect(within(alert).getByText("Blocked")).toBeInTheDocument();
      expect(within(alert).getByText("Waiting on supplier")).toBeInTheDocument();
    });

    it("clears the blocker", async () => {
      const user = userEvent.setup();
      renderContent(blocked);

      await user.click(screen.getByRole("button", { name: "Clear blocker" }));

      expect(screen.queryByText("Waiting on supplier")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Flag as blocked" })).toBeDisabled();
    });

    it("needs a reason before something can be flagged as blocked", () => {
      renderContent();

      expect(screen.getByRole("button", { name: "Flag as blocked" })).toBeDisabled();
      expect(screen.getByText(/Use notes for anything that needs free text/)).toBeInTheDocument();
    });
  });

  describe("notes and history", () => {
    it("starts with no notes", () => {
      renderContent();

      expect(screen.getByText("No notes yet.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add note" })).toBeDisabled();
    });

    it("adds a trimmed note and clears the box", async () => {
      const user = userEvent.setup();
      renderContent();
      const box = screen.getByLabelText("Add a note");

      await user.type(box, "  Chased the supplier  ");
      await user.click(screen.getByRole("button", { name: "Add note" }));

      expect(screen.getByText("Chased the supplier")).toBeInTheDocument();
      expect(screen.queryByText("No notes yet.")).not.toBeInTheDocument();
      expect(box).toHaveValue("");
    });

    it("does not allow a whitespace-only note", async () => {
      const user = userEvent.setup();
      renderContent();

      await user.type(screen.getByLabelText("Add a note"), "   ");

      expect(screen.getByRole("button", { name: "Add note" })).toBeDisabled();
    });

    it("records moving a stage in the history", async () => {
      const user = userEvent.setup();
      renderContent();
      const history = screen.getByRole("region", { name: "Activity history" });
      const before = within(history).queryAllByRole("listitem").length;

      await user.click(screen.getByRole("button", { name: "Mark complete" }));

      expect(within(screen.getByRole("region", { name: "Activity history" })).getAllByRole("listitem").length).toBe(
        before + 1,
      );
    });
  });
});
