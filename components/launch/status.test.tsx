// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WORK_STATE_LABELS } from "@/lib/launch/copy";
import type { ActivityStatus, LaunchStatus, Readiness, WorkState } from "@/lib/launch/types";
import { ActivityStatusPill, ActivityStatusText, LaunchStatusPill, ReadinessPill, WorkStatePill } from "./status";

describe("ReadinessPill", () => {
  it.each<Readiness>(["Ready", "Action Required", "At Risk"])("says %s in words, not only colour", (readiness) => {
    render(<ReadinessPill readiness={readiness} />);
    expect(screen.getByText(readiness)).toBeInTheDocument();
  });
});

describe("LaunchStatusPill", () => {
  it.each<LaunchStatus>(["Live", "Offsale", "Dropped"])("shows the lifecycle status %s once a product is out of preparation", (status) => {
    render(<LaunchStatusPill status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it.each<LaunchStatus>(["Ready", "Action Required", "At Risk"])("shows readiness %s while a product is being prepared", (status) => {
    render(<LaunchStatusPill status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });
});

describe("ActivityStatusPill", () => {
  it.each<ActivityStatus>(["Not Started", "In Progress", "Blocked", "Complete", "Not Required"])(
    "says %s in words",
    (status) => {
      render(<ActivityStatusPill status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    },
  );
});

describe("ActivityStatusText", () => {
  it("shows the status as plain text in the table", () => {
    render(<ActivityStatusText status="In Progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("reads a not-required activity as 'Not required' without alarm", () => {
    render(<ActivityStatusText status="Not Required" />);
    expect(screen.getByText("Not required")).toBeInTheDocument();
  });
});

describe("WorkStatePill", () => {
  const states = Object.keys(WORK_STATE_LABELS).filter((state) => state !== "Not Required") as WorkState[];

  it.each(states)("shows the plain-words label for %s", (state) => {
    render(<WorkStatePill workState={state} label={WORK_STATE_LABELS[state]} />);
    expect(screen.getByText(WORK_STATE_LABELS[state])).toBeInTheDocument();
  });

  it("shows 'Unable to start', never the internal name, for work waiting on information", () => {
    render(<WorkStatePill workState="Awaiting information" label={WORK_STATE_LABELS["Awaiting information"]} />);

    expect(screen.getByText("Unable to start")).toBeInTheDocument();
    expect(screen.queryByText("Awaiting information")).not.toBeInTheDocument();
  });
});
