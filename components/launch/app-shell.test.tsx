// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_SESSION } from "@/lib/auth/mock-provider";
import type { Session } from "@/lib/auth";
import { useLaunch } from "@/lib/launch/store";
import { makeProduct, withMissingFields } from "@/lib/launch/testing/fixtures";
import type { Product } from "@/lib/launch/types";
import { AppShell } from "./app-shell";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

const ready = makeProduct({ id: "1000001", name: "Ready Armchair" });
const needsWork = withMissingFields(
  makeProduct({ id: "1000002", name: "Urgent Lamp", launchDate: "2026-12-30" }),
  "supplierName",
);
const alsoNeedsWork = withMissingFields(
  makeProduct({ id: "1000003", name: "Distant Table", launchDate: "2026-12-30" }),
  "supplierName",
);

function renderShell({
  products = [ready],
  session = DEMO_SESSION,
  children = <p>Page content</p>,
}: { products?: Product[]; session?: Session | null; children?: React.ReactNode } = {}) {
  return render(
    <AppShell initialProducts={products} session={session}>
      {children}
    </AppShell>,
  );
}

function primaryNav() {
  return screen.getByRole("navigation", { name: "Primary" });
}

describe("AppShell", () => {
  beforeEach(() => {
    pathname = "/";
  });

  describe("page chrome", () => {
    it("renders the page it wraps between the header and the footer", () => {
      renderShell({ children: <p>Page content</p> });

      expect(screen.getByText("Page content")).toBeInTheDocument();
    });

    it("shows the product name as a link home", () => {
      renderShell();

      expect(screen.getByRole("link", { name: /Launch Readiness/ })).toHaveAttribute("href", "/");
      expect(screen.getByText("Northwind Home")).toBeInTheDocument();
    });

    it("offers the four main pages in the primary navigation", () => {
      renderShell();

      const links = within(primaryNav()).getAllByRole("link");
      expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
        ["Overview", "/"],
        ["Products", "/products"],
        ["Action Required (0)", "/action-required"],
        ["How it works", "/how-it-works"],
      ]);
    });

    it("includes the theme toggle", () => {
      renderShell();

      expect(screen.getByRole("button", { name: "Toggle dark mode" })).toBeInTheDocument();
    });
  });

  describe("action required count", () => {
    it("is zero when every product is on track", () => {
      renderShell({ products: [ready] });

      expect(within(primaryNav()).getByRole("link", { name: "Action Required (0)" })).toBeInTheDocument();
    });

    it("counts only the products that need attention", () => {
      renderShell({ products: [ready, needsWork, alsoNeedsWork] });

      expect(within(primaryNav()).getByRole("link", { name: "Action Required (2)" })).toBeInTheDocument();
    });

    it("updates when missing information is supplied", async () => {
      function Finish() {
        const { editField } = useLaunch();
        return <button onClick={() => editField("1000002", "supplierName", "Oakline Supply")}>Finish content</button>;
      }
      renderShell({ products: [needsWork], children: <Finish /> });

      expect(within(primaryNav()).getByRole("link", { name: "Action Required (1)" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Finish content" }));

      expect(within(primaryNav()).getByRole("link", { name: "Action Required (0)" })).toBeInTheDocument();
    });
  });

  describe("current page", () => {
    function currentLinks() {
      return within(primaryNav())
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page")
        .map((link) => link.textContent);
    }

    it.each([
      ["/", "Overview"],
      ["/products", "Products"],
      ["/products/1000001", "Products"],
            ["/action-required", "Action Required (0)"],
      ["/how-it-works", "How it works"],
    ])("marks only the right link as current on %s", (path, expected) => {
      pathname = path;
      renderShell();

      expect(currentLinks()).toEqual([expected]);
    });

    it("marks nothing as current on a page outside the navigation", () => {
      pathname = "/about";
      renderShell();

      expect(currentLinks()).toEqual([]);
    });

    it("does not treat every path as the Overview", () => {
      pathname = "/products";
      renderShell();

      expect(within(primaryNav()).getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
    });
  });

  describe("prototype strip", () => {
    it("says the data is synthetic and shows the fixed demo date", () => {
      renderShell();

      expect(screen.getByText(/Portfolio prototype using synthetic demo data\. Demo date: .+\./)).toBeInTheDocument();
    });

    it("offers a reset to a signed-in user", () => {
      renderShell({ session: DEMO_SESSION });

      expect(screen.getByRole("button", { name: "Reset demo data" })).toBeInTheDocument();
    });

    it("hides the reset when nobody is signed in", () => {
      renderShell({ session: null });

      expect(screen.queryByRole("button", { name: "Reset demo data" })).not.toBeInTheDocument();
    });

    it("puts every product back to its starting state when reset", async () => {
      function Finish() {
        const { editField } = useLaunch();
        return <button onClick={() => editField("1000002", "supplierName", "Oakline Supply")}>Finish content</button>;
      }
      renderShell({ products: [needsWork], children: <Finish /> });

      await userEvent.click(screen.getByRole("button", { name: "Finish content" }));
      expect(within(primaryNav()).getByRole("link", { name: "Action Required (0)" })).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Reset demo data" }));
      expect(within(primaryNav()).getByRole("link", { name: "Action Required (1)" })).toBeInTheDocument();
    });
  });

  describe("viewing as", () => {
    it("offers both roles and marks the signed-in one as pressed", () => {
      renderShell({ session: DEMO_SESSION });

      const group = screen.getByRole("group", { name: "Viewing as" });
      const buttons = within(group).getAllByRole("button");
      expect(buttons.map((button) => button.getAttribute("aria-pressed"))).toEqual(["true", "false"]);
    });

    it("switches the role when the other one is chosen", async () => {
      renderShell({ session: DEMO_SESSION });

      const group = screen.getByRole("group", { name: "Viewing as" });
      const [, other] = within(group).getAllByRole("button");
      await userEvent.click(other);

      expect(other).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("footer", () => {
    it("links to How it works and About", () => {
      renderShell();

      const footer = screen.getByRole("navigation", { name: "Footer" });
      expect(within(footer).getByRole("link", { name: "How it works" })).toHaveAttribute("href", "/how-it-works");
      expect(within(footer).getByRole("link", { name: "About this prototype" })).toHaveAttribute("href", "/about");
    });

    it("states that the data is fictional and not connected to a real system", () => {
      renderShell();

      expect(
        screen.getByText(/fictional demo data and are not connected to any real system/),
      ).toBeInTheDocument();
    });
  });
});
