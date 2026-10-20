// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ACTIVITY_DEFINITIONS, ACTIVITY_ORDER } from "@/lib/launch/activities";
import { LATEST_RELEASE } from "@/lib/launch/guide-content";
import { AT_RISK_WITHIN_DAYS } from "@/lib/launch/readiness";
import {
  ActivityGuide,
  InfoCard,
  Limits,
  ReadinessStatuses,
  Section,
  TheModel,
  Walkthrough,
  WhatItIs,
} from "./how-it-works-sections";

describe("Section", () => {
  it("is a landmark named by its own heading", () => {
    render(
      <Section id="example" title="Example title">
        <p>Body</p>
      </Section>,
    );

    const region = screen.getByRole("region", { name: "Example title" });
    expect(within(region).getByRole("heading", { name: "Example title" })).toHaveAttribute("id", "example");
    expect(within(region).getByText("Body")).toBeInTheDocument();
  });

  it("shows the intro only when one is given", () => {
    const { rerender } = render(
      <Section id="example" title="Example title" intro="Why this matters">
        <p>Body</p>
      </Section>,
    );
    expect(screen.getByText("Why this matters")).toBeInTheDocument();

    rerender(
      <Section id="example" title="Example title">
        <p>Body</p>
      </Section>,
    );
    expect(screen.queryByText("Why this matters")).not.toBeInTheDocument();
  });
});

describe("InfoCard", () => {
  it("puts its title in a third-level heading and its content in the card", () => {
    render(
      <InfoCard title="Card title">
        <p>Card content</p>
      </InfoCard>,
    );

    expect(screen.getByRole("heading", { level: 3, name: "Card title" })).toBeInTheDocument();
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });
});

describe("WhatItIs", () => {
  it("explains the problem and the approach in two paragraphs", () => {
    render(<WhatItIs />);

    const region = screen.getByRole("region", { name: "What Launch Readiness is" });
    expect(within(region).getByText(/tracked in\s+large spreadsheets/)).toBeInTheDocument();
    expect(within(region).getByText(/is this product ready to launch/)).toBeInTheDocument();
  });
});

describe("TheModel", () => {
  it("lists the six steps in order, each read out as complete", () => {
    render(<TheModel />);

    const steps = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual([
      "Product, complete",
      "Requirements, complete",
      "Information, complete",
      "Work state, complete",
      "Action, complete",
      "Ready, complete",
    ]);
  });

  it("explains the chain in three cards using the user-facing work-state names", () => {
    render(<TheModel />);

    for (const title of ["1. Product and requirements", "2. Information and work state", "3. Action and ready"]) {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    }
    expect(screen.getByText(/Unable to start, Ready to start/)).toBeInTheDocument();
    expect(screen.queryByText(/Awaiting information/)).not.toBeInTheDocument();
  });
});

describe("ReadinessStatuses", () => {
  it("describes each overall readiness status", () => {
    render(<ReadinessStatuses />);

    expect(screen.getByText(/Every required activity is complete/)).toBeInTheDocument();
    expect(screen.getByText(/there is still time to do it/)).toBeInTheDocument();
    expect(screen.getByText(/This is the most urgent/)).toBeInTheDocument();
  });

  it("quotes the same at-risk window the readiness rules use", () => {
    render(<ReadinessStatuses />);

    expect(screen.getByText(new RegExp(`launch date is within ${AT_RISK_WITHIN_DAYS} days`))).toBeInTheDocument();
  });

  it("describes the three launch statuses that sit outside readiness", () => {
    render(<ReadinessStatuses />);

    expect(screen.getByText(/has launched and is on sale/)).toBeInTheDocument();
    expect(screen.getByText(/has been withdrawn/)).toBeInTheDocument();
    expect(screen.getByText(/cancelled before launch/)).toBeInTheDocument();
  });

  it("warns that the at-risk rule is a placeholder and that finished products leave the overview", () => {
    render(<ReadinessStatuses />);

    expect(screen.getByText(/placeholder for testing/)).toBeInTheDocument();
    expect(screen.getByText(/left out of the overview counts and the\s+Action Required page/)).toBeInTheDocument();
  });
});

describe("ActivityGuide", () => {
  it("has one card per modelled activity, in the standard order", () => {
    render(<ActivityGuide />);

    const headings = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(headings).toEqual(ACTIVITY_ORDER.map((key) => ACTIVITY_DEFINITIONS[key].name));
  });

  it("gives each activity its description, owner and completion rule", () => {
    render(<ActivityGuide />);

    for (const key of ACTIVITY_ORDER) {
      const definition = ACTIVITY_DEFINITIONS[key];
      const card = screen.getByRole("heading", { level: 3, name: definition.name }).closest("div[data-slot='card']");
      expect(card, definition.name).not.toBeNull();
      const scope = within(card as HTMLElement);

      expect(scope.getByText(definition.description)).toBeInTheDocument();
      expect(scope.getByText(definition.ownerTeam, { exact: false })).toBeInTheDocument();
      expect(scope.getByText(definition.doneWhen, { exact: false })).toBeInTheDocument();
      expect(scope.getByText(/Needed when:/)).toBeInTheDocument();
    }
  });

  it("explains which activity has the fuller workflow", () => {
    render(<ActivityGuide />);

    expect(screen.getByText(/Studio Imagery has a fuller workflow/)).toBeInTheDocument();
  });
});

describe("Walkthrough", () => {
  it("lists the seven steps as a numbered sequence", () => {
    render(<Walkthrough />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(7);
    items.forEach((item, index) => expect(item).toHaveTextContent(new RegExp(`^${index + 1}`)));
  });

  it("starts on the Little Acorn Wooden Play Kitchen and ends by resetting the demo", () => {
    render(<Walkthrough />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Little Acorn Wooden Play Kitchen");
    expect(items[items.length - 1]).toHaveTextContent("Reset demo data");
  });

  it("offers a way straight into Action Required", () => {
    render(<Walkthrough />);

    expect(screen.getByRole("link", { name: /Start with Action Required/ })).toHaveAttribute("href", "/action-required");
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
