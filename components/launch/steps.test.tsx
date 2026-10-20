// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Steps, type StepStatus } from "./steps";

function renderSteps(statuses: StepStatus[]) {
  const steps = statuses.map((status, index) => ({ label: `Step ${index + 1}`, status }));
  return render(<Steps steps={steps} />);
}

describe("Steps", () => {
  it("renders one list item per step, in order", () => {
    renderSteps(["complete", "active", "incomplete"]);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Step 1");
    expect(items[2]).toHaveTextContent("Step 3");
  });

  it("says each step's state in words for screen readers", () => {
    renderSteps(["complete", "active", "incomplete"]);

    expect(screen.getByText("Step 1").closest("li")).toHaveTextContent("Step 1, complete");
    expect(screen.getByText("Step 2").closest("li")).toHaveTextContent("Step 2, current step");
    expect(screen.getByText("Step 3").closest("li")).toHaveTextContent("Step 3, not started");
  });

  it("marks only the active step as the current one", () => {
    renderSteps(["complete", "active", "incomplete"]);

    const items = screen.getAllByRole("listitem");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[2]).not.toHaveAttribute("aria-current");
  });

  it("shows a tick for finished steps and the step number for the rest", () => {
    const { container } = renderSteps(["complete", "active", "incomplete"]);
    const items = screen.getAllByRole("listitem");

    expect(items[0].querySelector("svg")).not.toBeNull();
    expect(items[1].querySelector("svg")).toBeNull();
    expect(items[1]).toHaveTextContent("2");
    expect(items[2]).toHaveTextContent("3");
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("draws a connector between steps but not after the last one", () => {
    renderSteps(["complete", "complete", "complete"]);
    const items = screen.getAllByRole("listitem");

    expect(items[0].querySelector("[aria-hidden='true'].h-px")).not.toBeNull();
    expect(items[1].querySelector("[aria-hidden='true'].h-px")).not.toBeNull();
    expect(items[2].querySelector("[aria-hidden='true'].h-px")).toBeNull();
  });

  it("renders an empty list for no steps", () => {
    renderSteps([]);

    expect(screen.getByRole("list")).toBeEmptyDOMElement();
  });
});
