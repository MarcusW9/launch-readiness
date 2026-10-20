// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DEMO_SESSION } from "@/lib/auth/mock-provider";
import { summariseReadiness } from "@/lib/launch/readiness";
import { makeProduct } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import type { Product } from "@/lib/launch/types";
import { ProductDetailView } from "./product-detail-view";
import { ProductNotes } from "./product-notes";

const withNotes = makeProduct({
  id: "1000001",
  name: "Noted Armchair",
  notes: [
    { id: "n2", at: "2026-11-09T14:20", author: "Daniel Okafor", role: "downstream", text: "Second, newest note" },
    { id: "n1", at: "2026-11-04T10:05", author: "Priya Shah", role: "commercial", text: "First, oldest note" },
  ],
});
const noNotes = makeProduct({ id: "1000002", name: "Quiet Table" });

const viewerSession = { ...DEMO_SESSION, user: { ...DEMO_SESSION.user, role: "viewer" as const } };

describe("ProductNotes", () => {
  it("titles the section with the note count and shows the permanent-log caption", () => {
    renderWithStore(<ProductNotes product={withNotes} />, [withNotes]);

    expect(screen.getByRole("heading", { name: "Notes (2)" })).toBeInTheDocument();
    expect(screen.getByText("Notes are a permanent log and can't be edited")).toBeInTheDocument();
  });

  it("lists notes newest first with text, author, role and date and time", () => {
    renderWithStore(<ProductNotes product={withNotes} />, [withNotes]);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Second, newest note")).toBeInTheDocument();
    expect(within(items[0]).getByText("Daniel Okafor · Downstream team · 9 Nov, 14:20")).toBeInTheDocument();
    expect(within(items[1]).getByText("First, oldest note")).toBeInTheDocument();
    expect(within(items[1]).getByText(/Priya Shah · Commercial \/ Range Planning/)).toBeInTheDocument();
  });

  it("says there are no notes yet when the log is empty", () => {
    renderWithStore(<ProductNotes product={noNotes} />, [noNotes]);

    expect(screen.getByRole("heading", { name: "Notes (0)" })).toBeInTheDocument();
    expect(screen.getByText("No notes yet.")).toBeInTheDocument();
  });

  it("does not allow an empty note", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductNotes product={noNotes} />, [noNotes]);
    const add = screen.getByRole("button", { name: "Add note" });

    expect(add).toBeDisabled();
    await user.type(screen.getByLabelText("Add a note"), "   ");
    expect(add).toBeDisabled();
  });

  it("shows a character count and stops at 500 characters", () => {
    renderWithStore(<ProductNotes product={noNotes} />, [noNotes]);
    const field = screen.getByLabelText("Add a note");

    expect(screen.getByText("0 / 500")).toBeInTheDocument();
    expect(field).toHaveAttribute("maxlength", "500");
  });

  it("counts characters as you type", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductNotes product={noNotes} />, [noNotes]);

    await user.type(screen.getByLabelText("Add a note"), "Hello");

    expect(screen.getByText("5 / 500")).toBeInTheDocument();
  });

  it("adds a note at the top straight away, as the commercial editor, and clears the box", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductDetailView productId="1000001" />, [withNotes]);

    await user.type(screen.getByLabelText("Add a note"), "Supplier to provide lifestyle images");
    await user.click(screen.getByRole("button", { name: "Add note" }));

    expect(screen.getByRole("heading", { name: "Notes (3)" })).toBeInTheDocument();
    const [top] = within(screen.getByRole("region", { name: "Notes (3)" })).getAllByRole("listitem");
    expect(within(top).getByText("Supplier to provide lifestyle images")).toBeInTheDocument();
    expect(within(top).getByText(/Priya Shah · Commercial \/ Range Planning/)).toBeInTheDocument();
    expect(screen.getByLabelText("Add a note")).toHaveValue("");
  });

  it("lets the downstream team add notes as the downstream author", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductDetailView productId="1000002" />, [noNotes], viewerSession);

    await user.type(screen.getByLabelText("Add a note"), "Needs a lifestyle shot");
    await user.click(screen.getByRole("button", { name: "Add note" }));

    expect(screen.getByText(/Daniel Okafor · Downstream team/)).toBeInTheDocument();
  });

  it("offers no edit or delete controls on a note", () => {
    renderWithStore(<ProductNotes product={withNotes} />, [withNotes]);

    expect(screen.queryByRole("button", { name: /edit|delete|remove/i })).not.toBeInTheDocument();
  });
});

describe("Notes on the product page", () => {
  it("sits above the product information sections", () => {
    renderWithStore(<ProductDetailView productId="1000001" />, [withNotes]);

    const notes = screen.getByRole("heading", { name: "Notes (2)" });
    const information = screen.getAllByRole("heading").find((heading) => /information/i.test(heading.textContent ?? ""));
    expect(information).toBeDefined();
    expect(notes.compareDocumentPosition(information as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("does not change the product's readiness", () => {
    const stripped: Product = { ...withNotes, notes: [] };
    expect(summariseReadiness(withNotes)).toEqual(summariseReadiness(stripped));
  });
});
