// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_SESSION } from "@/lib/auth/mock-provider";
import { makeProduct } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { ProductsView } from "./products-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const sofa = makeProduct({
  id: "3000001",
  name: "Oslo Sofa",
  brand: "Oakline",
  criticalPath: "AW26 PH1",
  launchDate: "2026-12-01",
  studio: {
    customerStylePreference: "Scandi",
    imageSource: "Studio shoot",
    cutOutSource: "Studio shoot",
    components: "Frame, legs",
  },
});
const lamp = makeProduct({
  id: "3000002",
  name: "Brass Lamp",
  brand: "Hearthwell",
  criticalPath: "AW26 PH1",
  launchDate: "2026-11-20",
  studio: { customerStylePreference: "Industrial", imageSource: "Supplier", videoSource: "#N/A" },
});
const stool = makeProduct({
  id: "3000003",
  name: "Oak Stool",
  brand: "Oakline",
  criticalPath: "SS27 PH1",
  launchDate: "2026-11-10",
  studio: { customerStylePreference: "Scandi", imageSource: "Supplier" },
});

const COLUMNS = [
  "Cat No.",
  "Product",
  "Critical Path",
  "Customer Style Preference",
  "Image Source",
  "Cut Out source",
  "Lifestyle source",
  "Video source",
  "Components",
  "Proposed Launch",
  "Status",
];

async function openStudio(products = [sofa, lamp, stool]) {
  const user = userEvent.setup();
  renderWithStore(<ProductsView />, products);
  await user.click(screen.getByRole("button", { name: "Studio view" }));
  return user;
}

function studioTable() {
  return screen.getByRole("table", { name: "Active products with studio details" });
}

function rowNames() {
  return within(studioTable())
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).queryAllByRole("link")[0]?.textContent)
    .filter(Boolean);
}

async function choose(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("view switch", () => {
  it("opens on the Exceptions view and leaves its table as it was", () => {
    renderWithStore(<ProductsView />, [sofa]);

    expect(screen.getByRole("button", { name: "Exceptions view" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Studio view" })).toHaveAttribute("aria-pressed", "false");
    const headers = within(screen.getByRole("table", { name: "Products approaching launch" }))
      .getAllByRole("columnheader")
      .map((header) => header.textContent);
    expect(headers).not.toContain("Customer Style Preference");
    expect(headers).not.toContain("Components");
  });

  it("is available to the Downstream team too and does not touch edit rights", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, [sofa], { user: { ...DEMO_SESSION.user, role: "downstream" } });

    await user.click(screen.getByRole("button", { name: "Studio view" }));

    expect(studioTable()).toBeInTheDocument();
  });

  it("switches back to the Exceptions view", async () => {
    const user = await openStudio();

    await user.click(screen.getByRole("button", { name: "Exceptions view" }));

    expect(screen.getByRole("table", { name: "Products approaching launch" })).toBeInTheDocument();
    expect(screen.queryByRole("table", { name: "Active products with studio details" })).not.toBeInTheDocument();
  });
});

describe("Studio table", () => {
  it("has the Studio columns in order, soonest launch first", async () => {
    await openStudio();

    const headers = within(studioTable()).getAllByRole("columnheader").map((header) => header.textContent);
    expect(headers).toEqual(COLUMNS);
    expect(rowNames()).toEqual(["Oak Stool", "Brass Lamp", "Oslo Sofa"]);
  });

  it("shows the title with a brand chip", async () => {
    await openStudio();

    const row = screen.getByRole("link", { name: "Oslo Sofa" }).closest("tr") as HTMLElement;
    expect(within(row).getByText("Oakline")).toBeInTheDocument();
  });

  it("shows missing values as Not provided and data errors as errors", async () => {
    await openStudio();

    const stoolRow = screen.getByRole("link", { name: "Oak Stool" }).closest("tr") as HTMLElement;
    expect(within(stoolRow).getAllByText("Not provided").length).toBeGreaterThan(0);
    const lampRow = screen.getByRole("link", { name: "Brass Lamp" }).closest("tr") as HTMLElement;
    expect(within(lampRow).getByText("#N/A", { exact: false })).toHaveClass("text-danger");
  });

  it("hides the status summary cards and has no Remind Commercial button", async () => {
    await openStudio();

    expect(screen.queryByText("At Risk")).not.toBeInTheDocument();
    expect(screen.queryByText("Also flagged")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remind commercial/i })).not.toBeInTheDocument();
  });
});

describe("Studio filters", () => {
  it("offers search, critical path, style and image source", async () => {
    await openStudio();

    expect(screen.getByRole("searchbox", { name: "Search products" })).toBeInTheDocument();
    for (const name of ["Critical path", "Customer style preference", "Image source"]) {
      expect(screen.getByRole("combobox", { name })).toBeInTheDocument();
    }
  });

  it("searches by critical path", async () => {
    const user = await openStudio();

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "SS27");

    expect(rowNames()).toEqual(["Oak Stool"]);
    expect(screen.getByText("Showing 1 of 3 active products")).toBeInTheDocument();
  });

  it("shows chips for active filters and clears them all", async () => {
    const user = await openStudio();

    await choose(user, "Customer style preference", "Scandi");
    await choose(user, "Image source", "Supplier");

    const chips = within(screen.getByRole("list", { name: "Active filters" })).getAllByRole("listitem");
    expect(chips.map((chip) => chip.textContent)).toEqual(["Style: Scandi", "Image source: Supplier"]);
    expect(rowNames()).toEqual(["Oak Stool"]);

    await user.click(screen.getByRole("button", { name: "Clear all" }));

    expect(screen.queryByRole("list", { name: "Active filters" })).not.toBeInTheDocument();
    expect(rowNames()).toHaveLength(3);
  });

  it("removes a single chip", async () => {
    const user = await openStudio();
    await choose(user, "Customer style preference", "Scandi");

    await user.click(screen.getByRole("button", { name: "Remove filter Style: Scandi" }));

    expect(rowNames()).toHaveLength(3);
  });

  it("shows the critical path strip, without the status cards, when one path is selected", async () => {
    const user = await openStudio();
    expect(screen.queryByText(/active lines/)).not.toBeInTheDocument();

    await choose(user, "Critical path", "AW26 PH1");

    expect(screen.getByText(/AW26 PH1 · 2 active lines/)).toBeInTheDocument();
    expect(screen.queryByText("At Risk")).not.toBeInTheDocument();
  });

  it("explains when nothing matches", async () => {
    const user = await openStudio();

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "zzzz");

    expect(screen.getByText("No products match these filters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export to CSV/ })).toBeDisabled();
  });
});

describe("Group by style", () => {
  it("groups rows under style headings with a line count, soonest launch first", async () => {
    const user = await openStudio();

    await user.click(screen.getByRole("checkbox", { name: "Group by style" }));

    const rows = within(studioTable()).getAllByRole("row").slice(1);
    const headings = rows.filter((row) => within(row).queryAllByRole("link").length === 0).map((row) => row.textContent);
    expect(headings).toEqual(["Industrial · 1 line", "Scandi · 2 lines"]);
    expect(rowNames()).toEqual(["Brass Lamp", "Oak Stool", "Oslo Sofa"]);
  });
});

describe("CSV export", () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let blobs: Blob[];

  beforeEach(() => {
    blobs = [];
    createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob);
      return "blob:studio";
    });
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("labels the button with the number of filtered products and carries the prototype note", async () => {
    const user = await openStudio();

    expect(screen.getByRole("button", { name: "Export to CSV (3 products)" })).toBeInTheDocument();
    expect(screen.getByText("Prototype: exports synthetic demo data only")).toBeInTheDocument();

    await choose(user, "Critical path", "SS27 PH1");

    expect(screen.getByRole("button", { name: "Export to CSV (1 product)" })).toBeInTheDocument();
  });

  it("downloads only the filtered rows, named after the critical path", async () => {
    const user = await openStudio();
    await choose(user, "Critical path", "AW26 PH1");

    await user.click(screen.getByRole("button", { name: "Export to CSV (2 products)" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const text = await blobs[0].text();
    expect(text).toContain("Oslo Sofa");
    expect(text).toContain("Brass Lamp");
    expect(text).not.toContain("Oak Stool");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Exported 2 products to launch-readiness-studio-aw26-ph1-2026-11-10.csv",
    );
  });

  it("names the file for all products when no single path is selected", async () => {
    const user = await openStudio();

    await user.click(screen.getByRole("button", { name: "Export to CSV (3 products)" }));

    expect(screen.getByRole("status")).toHaveTextContent("launch-readiness-studio-all-2026-11-10.csv");
  });
});
