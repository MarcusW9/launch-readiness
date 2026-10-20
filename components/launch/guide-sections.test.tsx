// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ARCHIVED_RELEASES, GUIDE_CONTENTS, LATEST_RELEASE, TEST_TOTALS } from "@/lib/launch/guide-content";
import { ChangelogHistory, WhatsNewInLatest } from "./guide-sections";

describe("WhatsNewInLatest", () => {
  it("is titled with the latest version and sits at the first contents anchor", () => {
    const { container } = render(<WhatsNewInLatest />);

    expect(screen.getByRole("heading", { name: /what is new in version 4/i })).toBeInTheDocument();
    expect(container.querySelector(`#${GUIDE_CONTENTS[0].id}`)).not.toBeNull();
  });

  it("offers a download of the latest change log only", () => {
    render(<WhatsNewInLatest />);

    const link = screen.getByRole("link", { name: /download the full v4 change log/i });
    expect(link).toHaveAttribute("href", LATEST_RELEASE.href);
    expect(link).toHaveAttribute("download", LATEST_RELEASE.fileName);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("quotes the current test totals", () => {
    render(<WhatsNewInLatest />);

    expect(
      screen.getByText(
        `${TEST_TOTALS.tests} automated tests across ${TEST_TOTALS.files} files, up from 481 across 30 in version 3.5. The Products screen now has 25 tests of its own.`,
      ),
    ).toBeInTheDocument();
  });

  it("describes the Products filter bar, critical path search and tabs", () => {
    render(<WhatsNewInLatest />);

    expect(screen.getByText("A filter bar on Products")).toBeInTheDocument();
    expect(screen.getByText("Search finds critical paths")).toBeInTheDocument();
    expect(screen.getByText("Active, Launched and Dropped tabs")).toBeInTheDocument();
  });

  it("lists the Studio view and the weekly summary preview as built", () => {
    render(<WhatsNewInLatest />);

    expect(screen.getByText("A weekly summary email preview")).toBeInTheDocument();
    expect(screen.getByText("A Studio view with CSV export")).toBeInTheDocument();
    expect(screen.queryByText("Still to come in version 4")).not.toBeInTheDocument();
  });
});

describe("ChangelogHistory", () => {
  it("has an anchor the contents and the Past versions link can jump to", () => {
    const { container } = render(<ChangelogHistory />);

    expect(container.querySelector("#changelog-history")).not.toBeNull();
    expect(GUIDE_CONTENTS.map((section) => section.id)).toContain("changelog-history");
  });

  it("lists one collapsed entry per archived release, labelled as archived", () => {
    const { container } = render(<ChangelogHistory />);
    const entries = container.querySelectorAll("details");

    expect(entries).toHaveLength(ARCHIVED_RELEASES.length);
    for (const entry of entries) expect(entry).not.toHaveAttribute("open");
    for (const release of ARCHIVED_RELEASES) {
      const summary = screen.getByText(release.label).closest("summary");
      expect(summary).not.toBeNull();
      expect(within(summary as HTMLElement).getByText("Archived")).toBeInTheDocument();
      expect(within(summary as HTMLElement).getByText(release.headline)).toBeInTheDocument();
    }
  });

  it("never lists the latest release as history", () => {
    render(<ChangelogHistory />);

    expect(screen.queryByText(LATEST_RELEASE.label)).not.toBeInTheDocument();
  });

  it("opens an entry when its summary is clicked and shows what that version changed", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChangelogHistory />);
    const entry = container.querySelector("details") as HTMLDetailsElement;

    await user.click(screen.getByText(ARCHIVED_RELEASES[0].label));

    expect(entry.open).toBe(true);
    expect(within(entry).getByText("Every screen is tested")).toBeInTheDocument();
  });

  it("lists version 3.5 above version 3, each with its own highlights", () => {
    const { container } = render(<ChangelogHistory />);
    const [first, second] = Array.from(container.querySelectorAll("details"));

    expect(ARCHIVED_RELEASES.map((release) => release.version)).toEqual(["3.5", "3"]);
    expect(within(first).getByText("Every screen is tested")).toBeInTheDocument();
    expect(within(second).getByText("A new, lighter interface")).toBeInTheDocument();
  });

  it("states each archived version's own test totals, not the current ones", async () => {
    render(<ChangelogHistory />);

    expect(screen.getByText(/191 automated tests across 10 files/)).toBeInTheDocument();
    expect(screen.getByText("481 automated tests across 30 files, up from 191 across 10 in version 3.")).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(`${TEST_TOTALS.tests} automated tests`))).not.toBeInTheDocument();
  });

  it("lets each archived change log be downloaded", () => {
    render(<ChangelogHistory />);

    for (const release of ARCHIVED_RELEASES) {
      const link = screen.getByRole("link", { name: new RegExp(`download the ${release.label} change log`, "i") });
      expect(link).toHaveAttribute("href", release.href);
      expect(link).toHaveAttribute("download", release.fileName);
    }
  });
});
