// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LATEST_RELEASE } from "@/lib/launch/guide-content";
import { DATE_CHANGED_WITHIN_DAYS, MANDATORY_FIELDS, SLA_CONFIG } from "@/lib/launch/readiness-config";
import {
  FlagsAndPlaceholders,
  HowTheThinkingChanged,
  InfoCard,
  Limits,
  ReadinessStatuses,
  Section,
  SlaGuide,
  TheModel,
  Walkthrough,
  WhatItIs,
} from "./how-it-works-sections";

describe("Section", () => {
  it("is a landmark named by its own heading", () => {
    render(
      <Section id="example" title="Example title" intro="Example intro">
        <p>Body</p>
      </Section>,
    );

    const region = screen.getByRole("region", { name: "Example title" });
    expect(within(region).getByText("Example intro")).toBeInTheDocument();
    expect(within(region).getByText("Body")).toBeInTheDocument();
  });
});

describe("InfoCard", () => {
  it("puts its title in a level 3 heading", () => {
    render(<InfoCard title="Card title">Content</InfoCard>);

    expect(screen.getByRole("heading", { level: 3, name: "Card title" })).toBeInTheDocument();
  });
});

describe("WhatItIs", () => {
  it("explains the problem and the approach in two paragraphs", () => {
    render(<WhatItIs />);

    const region = screen.getByRole("region", { name: "What Launch Readiness is" });
    expect(within(region).getByText(/tracked in\s+large spreadsheets/)).toBeInTheDocument();
    expect(within(region).getByText(/is the mandatory product information complete/)).toBeInTheDocument();
  });
});

describe("TheModel", () => {
  it("explains the idea in three cards, quoting the real numbers", () => {
    render(<TheModel />);

    for (const title of ["1. Mandatory information", "2. The SLA starts", "3. Launch status"]) {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    }
    expect(screen.getByText(new RegExp(`${MANDATORY_FIELDS.length} fields are mandatory`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${SLA_CONFIG.defaultWorkingDays}\\s+working days by default`))).toBeInTheDocument();
  });
});

describe("ReadinessStatuses", () => {
  it("describes each of the three statuses", () => {
    render(<ReadinessStatuses />);

    for (const status of ["On Track", "Information Incomplete", "Expectation At Risk"]) {
      expect(screen.getByRole("heading", { level: 3, name: status })).toBeInTheDocument();
    }
    expect(screen.getByText(/on or before the launch date/)).toBeInTheDocument();
    expect(screen.getByText(/the SLA has not started/)).toBeInTheDocument();
    expect(screen.getByText(/falls after the launch date/)).toBeInTheDocument();
  });

  it("says where products that are no longer being prepared go", () => {
    render(<ReadinessStatuses />);

    expect(screen.getByText(/left out of the counts/)).toBeInTheDocument();
  });
});

describe("FlagsAndPlaceholders", () => {
  it("describes both flags and says they never change the status", () => {
    render(<FlagsAndPlaceholders />);

    const region = screen.getByRole("region", { name: "Flags and placeholders" });
    expect(within(region).getByRole("heading", { level: 3, name: "Flags" })).toBeInTheDocument();
    expect(within(region).getByText("Date Changed")).toBeInTheDocument();
    expect(within(region).getByText(new RegExp(`last\\s+${DATE_CHANGED_WITHIN_DAYS} days`))).toBeInTheDocument();
    expect(within(region).getByText("Stock lands after launch")).toBeInTheDocument();
    expect(within(region).getByText(/never change the\s+status, the completeness or the SLA/)).toBeInTheDocument();
  });

  it("labels the SLA length as a placeholder, quoting the real numbers", () => {
    render(<FlagsAndPlaceholders />);

    expect(screen.getByRole("heading", { level: 3, name: "Placeholders" })).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${SLA_CONFIG.defaultWorkingDays} working days, 25 for a Guest bed`)),
    ).toBeInTheDocument();
    expect(screen.getByText(/bank holidays are ignored/)).toBeInTheDocument();
    expect(screen.getByText(/every product, ID and name is\s+fictional/)).toBeInTheDocument();
  });
});

describe("SlaGuide", () => {
  it("explains the start date and the projection date", () => {
    render(<SlaGuide />);

    expect(screen.getByRole("heading", { level: 3, name: "Start date" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Projection date" })).toBeInTheDocument();
    expect(screen.getByText(/SLA Projection Date = start date plus the SLA working days/)).toBeInTheDocument();
  });
});

describe("Walkthrough", () => {
  it("lists the eight steps as a numbered sequence", () => {
    render(<Walkthrough />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(8);
    items.forEach((item, index) => expect(item).toHaveTextContent(new RegExp(`^${index + 1}`)));
  });

  it("starts on Action Required and ends by resetting the demo", () => {
    render(<Walkthrough />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Open Action Required");
    expect(items[items.length - 1]).toHaveTextContent("Reset demo data");
  });

  it("offers a way straight into Action Required", () => {
    render(<Walkthrough />);

    expect(screen.getByRole("link", { name: /Start with Action Required/ })).toHaveAttribute("href", "/action-required");
  });
});

describe("HowTheThinkingChanged", () => {
  it("tells the story across versions 1, 3 and 4 in order", () => {
    render(<HowTheThinkingChanged />);

    const region = screen.getByRole("region", { name: "How the thinking changed" });
    const titles = within(region)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(["Version 1", "Version 3", "Version 4"]);
    expect(within(region).getByText(/mandatory\s+information and SLA risk, with three statuses/)).toBeInTheDocument();
    expect(within(region).getByText(/show-and-tell/)).toBeInTheDocument();
  });
});

describe("Limits", () => {
  it("is honest that this is a fictional, temporary prototype", () => {
    render(<Limits />);

    expect(screen.getByRole("heading", { level: 3, name: "It is a prototype" })).toBeInTheDocument();
    expect(screen.getByText(/All products, IDs and statuses are fictional/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Changes are temporary" })).toBeInTheDocument();
    expect(screen.getByText(/demo date is fixed at 10 Nov 2026/)).toBeInTheDocument();
  });

  it("offers the latest change log as a download and a link to About", () => {
    render(<Limits />);

    const download = screen.getByRole("link", { name: `Download the v${LATEST_RELEASE.version} change log (.md)` });
    expect(download).toHaveAttribute("href", LATEST_RELEASE.href);
    expect(download).toHaveAttribute("download", LATEST_RELEASE.fileName);
    expect(screen.getByRole("link", { name: /Read about this prototype/ })).toHaveAttribute("href", "/about");
  });
});
