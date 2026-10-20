// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEMO_SESSION } from "@/lib/auth/mock-provider";
import type { Session } from "@/lib/auth/types";
import { makeProduct, withMissingFields } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { NotificationsMenu } from "./notifications-menu";
import { ProductsView } from "./products-view";
import { Toaster } from "./toaster";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const risky = makeProduct({
  id: "3100001",
  name: "Risky Rug",
  criticalPath: "AW26 PH1",
  launchDate: "2026-11-20",
  infoCompleteAt: "2026-11-02",
});
const soon = withMissingFields(
  makeProduct({ id: "3100002", name: "Soon Sofa", criticalPath: "AW26 PH1", launchDate: "2026-12-04" }),
  "supplierName",
);
const onTrack = makeProduct({ id: "3100003", name: "Ready Rack", criticalPath: "SS27 PH1", launchDate: "2027-03-01" });
const moved = makeProduct({
  id: "3100004",
  name: "Moved Mirror",
  criticalPath: "SS27 PH1",
  launchDate: "2027-03-01",
  previousLaunchDate: "2027-02-01",
  launchDateChangedOn: "2026-11-09",
  stockLandsDate: "2027-03-12",
});
const products = [risky, soon, onTrack, moved];

const viewer: Session = { ...DEMO_SESSION, role: "downstream" } as Session;

async function openPreview(session: Session = DEMO_SESSION) {
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
  renderWithStore(
    <>
      <NotificationsMenu />
      <ProductsView />
      <Toaster />
    </>,
    products,
    session,
  );
  await user.click(screen.getByRole("button", { name: "Preview weekly summary" }));
  const dialog = await screen.findByRole("dialog", { name: "Weekly summary preview" });
  return { user, dialog };
}

describe("Weekly summary preview", () => {
  it("is available in both roles", async () => {
    await openPreview();
  });

  it("is available to the Downstream team", async () => {
    await openPreview(viewer);
  });

  it("shows the subject and the headline for all Active products", async () => {
    const { dialog } = await openPreview();
    expect(within(dialog).getByText("Launch Readiness weekly summary \u2013 All active products \u2013 w/c 9 Nov 2026")).toBeInTheDocument();
    expect(within(dialog).getByText("4 products:")).toBeInTheDocument();
    expect(within(dialog).getByText("1 at risk")).toBeInTheDocument();
    expect(within(dialog).getByText("1 information incomplete")).toBeInTheDocument();
    expect(within(dialog).getByText("2 on track")).toBeInTheDocument();
  });

  it("lists attention and change sections with Cat No links, and only counts on track products", async () => {
    const { dialog } = await openPreview();
    expect(within(dialog).getByRole("link", { name: "3100001" })).toHaveAttribute("href", "/products/3100001");
    expect(within(dialog).getByRole("link", { name: "3100002" })).toHaveAttribute("href", "/products/3100002");
    expect(within(dialog).getAllByRole("link", { name: "3100004" })).toHaveLength(2);
    expect(within(dialog).queryByRole("link", { name: "3100003" })).not.toBeInTheDocument();
    expect(within(dialog).getByText(/working days to launch/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Generated from Launch Readiness on 10 Nov 2026. Prototype: no email is sent./)).toBeInTheDocument();
  });

  it("copies a plain-text version", async () => {
    const { user, dialog } = await openPreview();
    await user.click(within(dialog).getByRole("button", { name: "Copy text" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("Subject: Launch Readiness weekly summary"));
    expect(await within(dialog).findByText("Copied to clipboard.")).toBeInTheDocument();
  });

  it("sends a simulated email to the chosen recipient with a toast and a notification", async () => {
    const { user, dialog } = await openPreview();
    await user.click(within(dialog).getByRole("button", { name: "Send (simulated)" }));
    expect(screen.queryByRole("dialog", { name: "Weekly summary preview" })).not.toBeInTheDocument();
    expect(await screen.findByText(/Weekly summary sent to Downstream teams \(simulated\)\. No email was sent\./)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("Weekly summary sent (simulated)")).toBeInTheDocument();
  });
});
