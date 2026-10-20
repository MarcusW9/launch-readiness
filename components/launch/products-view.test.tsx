// @vitest-environment jsdom
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeProduct, withMissingFields } from "@/lib/launch/testing/fixtures";
import { renderWithStore } from "@/lib/launch/testing/render";
import { ProductsView } from "./products-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const armchair = makeProduct({ id: "1000001", name: "Oak Armchair", brand: "Oakline", category: "Furniture" });
const lamp = withMissingFields(
  makeProduct({ id: "1000002", name: "Brass Lamp", brand: "Hearthwell", category: "Lighting", launchDate: "2026-11-15" }),
  "supplierName",
);
const mystery = withMissingFields(
  makeProduct({ id: "1000003", name: "Mystery Stool", brand: "Oakline", category: "Furniture" }),
  "supplierName",
);

function rowNames() {
  const table = screen.getByRole("table", { name: "Products approaching launch" });
  return within(table)
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("link")[0].textContent);
}

describe("ProductsView", () => {
  it("has the page title and the full product count", () => {
    renderWithStore(<ProductsView />, [armchair, lamp]);

    expect(screen.getByRole("heading", { level: 1, name: "Products" })).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2 active products")).toBeInTheDocument();
  });

  it("puts the most urgent product first", () => {
    renderWithStore(<ProductsView />, [armchair, lamp]);

    expect(rowNames()).toEqual(["Brass Lamp", "Oak Armchair"]);
  });

  it("offers every filter, labelled", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, [armchair]);

    for (const name of ["Range", "Brand", "Critical path"]) {
      expect(screen.getByRole("combobox", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("searchbox", { name: "Search products" })).toBeInTheDocument();

    const more = screen.getByRole("button", { name: "More filters" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await user.click(more);
    expect(more).toHaveAttribute("aria-expanded", "true");
    for (const name of ["Category", "Status", "Launch date", "Flag"]) {
      expect(screen.getByRole("combobox", { name })).toBeInTheDocument();
    }
  });

  it("filters as you type and updates the count", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, [armchair, lamp]);

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "lamp");

    expect(screen.getByText("Showing 1 of 2 active products")).toBeInTheDocument();
    expect(rowNames()).toEqual(["Brass Lamp"]);
  });

  it("matches on product ID and brand as well as name", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, [armchair, lamp]);
    const search = screen.getByRole("searchbox", { name: "Search products" });

    await user.type(search, "1000001");
    expect(rowNames()).toEqual(["Oak Armchair"]);

    await user.clear(search);
    await user.type(search, "hearthwell");
    expect(rowNames()).toEqual(["Brass Lamp"]);
  });

  it("explains when nothing matches and offers a way back", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, [armchair, lamp]);

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "zzzz");

    expect(screen.getByText("No products match these filters")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear all filters" }));

    expect(screen.getByText("Showing 2 of 2 active products")).toBeInTheDocument();
    expect(screen.queryByText("No products match these filters")).not.toBeInTheDocument();
  });

  it("only shows Clear all filters once a filter is active", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, [armchair]);

    expect(screen.queryByRole("button", { name: "Clear all filters" })).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "oak");

    expect(screen.getByRole("button", { name: "Clear all filters" })).toBeInTheDocument();
  });

  it("clears just the search with the x button", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, [armchair, lamp]);
    const search = screen.getByRole("searchbox", { name: "Search products" });

    await user.type(search, "lamp");
    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(search).toHaveValue("");
    expect(screen.getByText("Showing 2 of 2 active products")).toBeInTheDocument();
  });

  it("starts filtered when given initial filters, as when arriving from the Overview", () => {
    renderWithStore(<ProductsView initialFilters={{ status: "Information Incomplete" }} />, [armchair, mystery]);

    expect(screen.getByText("Showing 1 of 2 active products")).toBeInTheDocument();
    expect(rowNames()).toEqual(["Mystery Stool"]);
    expect(screen.getByRole("button", { name: "Clear all filters" })).toBeInTheDocument();
  });

  it("can start filtered to a single category", () => {
    renderWithStore(<ProductsView initialFilters={{ category: "Lighting" }} />, [armchair, lamp]);

    expect(rowNames()).toEqual(["Brass Lamp"]);
  });
});

describe("ProductsView range, critical path and tabs", () => {
  const sofa = makeProduct({
    id: "2000001",
    name: "Linen Sofa",
    brand: "Oakline",
    range: "Living room",
    criticalPath: "AW26 PH1",
  });
  const rug = makeProduct({
    id: "2000002",
    name: "Wool Rug",
    brand: "Hearthwell",
    range: "Living room",
    criticalPath: "AW26 PH2",
  });
  const planter = makeProduct({
    id: "2000003",
    name: "Clay Planter",
    brand: "Hearthwell",
    range: undefined,
    criticalPath: undefined,
  });
  const launched = makeProduct({ id: "2000004", name: "Live Kettle", lifecycle: "Live", criticalPath: "AW26 PH1" });
  const dropped = makeProduct({ id: "2000005", name: "Old Toaster", lifecycle: "Dropped" });
  const catalogue = [sofa, rug, planter, launched, dropped];

  async function choose(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
    await user.click(screen.getByRole("combobox", { name: label }));
    await user.click(await screen.findByRole("option", { name: option }));
  }

  it("opens on the Active tab with a count on every tab", () => {
    renderWithStore(<ProductsView />, catalogue);

    expect(screen.getByRole("tab", { name: "Active (3)" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Launched (1)" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "Dropped (1)" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Showing 3 of 3 active products")).toBeInTheDocument();
    expect(rowNames()).not.toContain("Live Kettle");
  });

  it("switches tab and says which kind of product is being shown", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);

    await user.click(screen.getByRole("tab", { name: "Launched (1)" }));

    expect(rowNames()).toEqual(["Live Kettle"]);
    expect(screen.getByText("Showing 1 of 1 launched products")).toBeInTheDocument();
  });

  it("filters by range, offering every range and the unassigned ones", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);

    await user.click(screen.getByRole("combobox", { name: "Range" }));
    expect(await screen.findAllByRole("option")).toHaveLength(3);
    await user.click(screen.getByRole("option", { name: "Living room" }));

    expect(rowNames().sort()).toEqual(["Linen Sofa", "Wool Rug"]);
    expect(screen.getByText("Showing 2 of 3 active products")).toBeInTheDocument();
  });

  it("filters by brand", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);

    await choose(user, "Brand", "Hearthwell");

    expect(rowNames().sort()).toEqual(["Clay Planter", "Wool Rug"]);
  });

  it("filters by critical path, with #N/A for products that have none", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);

    await choose(user, "Critical path", "AW26 PH2");
    expect(rowNames()).toEqual(["Wool Rug"]);

    await choose(user, "Critical path", "#N/A");
    expect(rowNames()).toEqual(["Clay Planter"]);
  });

  it("searches critical path and range as well as name", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);
    const search = screen.getByRole("searchbox", { name: "Search products" });

    await user.type(search, "ph2");
    expect(rowNames()).toEqual(["Wool Rug"]);

    await user.clear(search);
    await user.type(search, "living");
    expect(rowNames().sort()).toEqual(["Linen Sofa", "Wool Rug"]);
  });

  it("counts each tab using the other filters, and keeps the tab when clearing", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);

    await choose(user, "Critical path", "AW26 PH1");

    expect(screen.getByRole("tab", { name: "Active (1)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Launched (1)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Dropped (1)" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Launched (1)" }));
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));

    expect(screen.getByRole("tab", { name: "Launched (1)" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Showing 1 of 1 launched products")).toBeInTheDocument();
  });

  it("opens on the tab it is given", () => {
    renderWithStore(<ProductsView initialFilters={{ tab: "dropped" }} />, catalogue);

    expect(screen.getByRole("tab", { name: /^Dropped/ })).toHaveAttribute("aria-selected", "true");
    expect(rowNames()).toEqual(["Old Toaster"]);
  });
});

describe("ProductsView critical path summary", () => {
  const rushed = makeProduct({
    id: "4000001",
    name: "Rushed Shelf",
    criticalPath: "AW26 PH1",
    launchDate: "2026-11-16",
    infoCompleteAt: "2026-11-10",
  });
  const steady = makeProduct({ id: "4000002", name: "Steady Stool", criticalPath: "AW26 PH1", launchDate: "2026-11-16" });
  const later = makeProduct({ id: "4000003", name: "Later Desk", criticalPath: "AW26 PH1", launchDate: "2026-12-02" });
  const elsewhere = makeProduct({ id: "4000004", name: "Elsewhere Rack", criticalPath: "AW26 PH2", launchDate: "2026-11-24" });
  const catalogue = [rushed, steady, later, elsewhere];

  async function choose(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
    await user.click(screen.getByRole("combobox", { name: label }));
    await user.click(await screen.findByRole("option", { name: option }));
  }

  function summary(path: string) {
    return screen.queryByRole("region", { name: `Critical path summary for ${path}` });
  }

  it("is hidden until a single critical path is selected", () => {
    renderWithStore(<ProductsView />, catalogue);

    expect(screen.queryByRole("region", { name: /Critical path summary/ })).not.toBeInTheDocument();
  });

  it("shows the path, its active lines and its own status counts when the filter picks it", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);

    await choose(user, "Critical path", "AW26 PH1");

    const region = summary("AW26 PH1")!;
    expect(within(region).getByText("AW26 PH1 · 3 active lines")).toBeInTheDocument();
    expect(within(region).getByText("16 Nov 2026")).toBeInTheDocument();
    expect(within(region).getByRole("group", { name: "At Risk: 1" })).toBeInTheDocument();
    expect(within(region).getByRole("group", { name: "Information Incomplete: 0" })).toBeInTheDocument();
    expect(within(region).getByRole("group", { name: "On Track: 2" })).toBeInTheDocument();
    expect(within(region).getByRole("group", { name: "Date Changed: 0" })).toBeInTheDocument();
    expect(within(region).getByRole("group", { name: "Stock lands after launch: 0" })).toBeInTheDocument();
  });

  it("lists the other launch dates, with counts, on request", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);

    await choose(user, "Critical path", "AW26 PH1");
    await user.click(within(summary("AW26 PH1")!).getByRole("button", { name: "+1 other date" }));

    expect(await screen.findByText("Other proposed launch dates")).toBeInTheDocument();
    expect(screen.getByText("2 Dec 2026")).toBeInTheDocument();
    expect(screen.getByText("1 line")).toBeInTheDocument();
  });

  it("has no other-dates control when every line launches together", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);

    await choose(user, "Critical path", "AW26 PH2");

    expect(within(summary("AW26 PH2")!).getByText("AW26 PH2 · 1 active line")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /other date/ })).not.toBeInTheDocument();
  });

  it("appears when a search matches one critical path and goes when it is cleared", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, catalogue);
    const search = screen.getByRole("searchbox", { name: "Search products" });

    await user.type(search, "AW26 PH1");
    expect(summary("AW26 PH1")).toBeInTheDocument();
    expect(rowNames().sort()).toEqual(["Later Desk", "Rushed Shelf", "Steady Stool"]);

    await user.clear(search);
    expect(summary("AW26 PH1")).not.toBeInTheDocument();
  });

  it("is hidden when the search spans several critical paths or the path is #N/A", async () => {
    const user = userEvent.setup();
    renderWithStore(<ProductsView />, [...catalogue, makeProduct({ id: "4000005", name: "Plain Chair", criticalPath: undefined })]);

    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "AW26");
    expect(screen.queryByRole("region", { name: /Critical path summary/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    await choose(user, "Critical path", "#N/A");
    expect(screen.queryByRole("region", { name: /Critical path summary/ })).not.toBeInTheDocument();
  });

  it("searches by title, Cat No and critical path", () => {
    expect(screen.queryByPlaceholderText("Search title, Cat No or critical path")).not.toBeInTheDocument();
    renderWithStore(<ProductsView />, catalogue);

    expect(screen.getByPlaceholderText("Search title, Cat No or critical path")).toBeInTheDocument();
  });
});
