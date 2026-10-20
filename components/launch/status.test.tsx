// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { assessProduct } from "@/lib/launch/readiness-model";
import { makeProduct, withMissingFields } from "@/lib/launch/testing/fixtures";
import { DateChangedFlag, StatusBadge, StockAfterLaunchFlag } from "./status";

describe("StatusBadge", () => {
  it("says On Track for a complete product with time to spare", () => {
    render(<StatusBadge assessment={assessProduct(makeProduct())} />);
    expect(screen.getByText("On Track")).toBeInTheDocument();
  });

  it("says Information Incomplete when a mandatory field is missing", () => {
    const product = withMissingFields(makeProduct({ launchDate: "2027-03-01" }), "supplierName");
    render(<StatusBadge assessment={assessProduct(product)} />);
    expect(screen.getByText("Information Incomplete")).toBeInTheDocument();
  });

  it("says Expectation At Risk when the SLA falls after the launch date", () => {
    const product = makeProduct({ launchDate: "2026-11-20", infoCompleteAt: "2026-11-02" });
    render(<StatusBadge assessment={assessProduct(product)} />);
    expect(screen.getByText(/^Expectation At Risk: \d+ working days? late$/)).toBeInTheDocument();
  });

  it("shows the lifecycle in place of a status once a product has launched or been dropped", () => {
    render(
      <>
        <StatusBadge assessment={assessProduct(makeProduct({ lifecycle: "Live" }))} />
        <StatusBadge assessment={assessProduct(makeProduct({ lifecycle: "Offsale" }))} />
        <StatusBadge assessment={assessProduct(makeProduct({ lifecycle: "Dropped" }))} />
      </>,
    );

    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Offsale")).toBeInTheDocument();
    expect(screen.getByText("Dropped")).toBeInTheDocument();
    expect(screen.queryByText("On Track")).not.toBeInTheDocument();
  });
});

describe("flags", () => {
  it("labels the date changed flag", () => {
    render(<DateChangedFlag />);
    expect(screen.getByText("Date Changed")).toBeInTheDocument();
  });

  it("labels the stock flag", () => {
    render(<StockAfterLaunchFlag />);
    expect(screen.getByText("Stock lands after launch")).toBeInTheDocument();
  });
});
