// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GUIDE_CONTENTS, LATEST_RELEASE } from "@/lib/launch/guide-content";
import HowItWorksPage, { metadata } from "./page";

describe("the How it works page", () => {
  it("has a title and a description for search and sharing", () => {
    expect(metadata.title).toBe("How it works | Launch Readiness");
    expect(String(metadata.description)).toContain(`version ${LATEST_RELEASE.version}`);
  });

  it("opens with its heading and a download of the latest change log", () => {
    render(<HowItWorksPage />);

    expect(screen.getByRole("heading", { level: 1, name: "How this works" })).toBeInTheDocument();
    const downloads = screen.getAllByRole("link", { name: `Download the v${LATEST_RELEASE.version} change log (.md)` });
    expect(downloads.length).toBeGreaterThan(0);
    for (const download of downloads) {
      expect(download).toHaveAttribute("href", LATEST_RELEASE.href);
      expect(download).toHaveAttribute("download", LATEST_RELEASE.fileName);
    }
  });

  it("links to past versions from the header", () => {
    render(<HowItWorksPage />);

    expect(screen.getByRole("link", { name: "Past versions" })).toHaveAttribute("href", "#changelog-history");
  });

  it("has a section for every entry in the contents, in the same order", () => {
    const { container } = render(<HowItWorksPage />);
    const headingIds = [...container.querySelectorAll("section[aria-labelledby]")].map((section) =>
      section.getAttribute("aria-labelledby"),
    );

    expect(headingIds).toEqual(GUIDE_CONTENTS.map((entry) => entry.id));
  });

  it("lets every contents link jump to something that exists", () => {
    const { container } = render(<HowItWorksPage />);
    const contents = screen.getByRole("navigation", { name: "On this page" });
    const links = within(contents).getAllByRole("link");

    expect(links).toHaveLength(GUIDE_CONTENTS.length);
    for (const link of links) {
      const id = link.getAttribute("href")?.slice(1);
      expect(container.querySelector(`#${id}`), link.textContent ?? "").not.toBeNull();
    }
  });

  it("names every section by its own heading", () => {
    const { container } = render(<HowItWorksPage />);

    for (const section of container.querySelectorAll("section[aria-labelledby]")) {
      const heading = container.querySelector(`#${section.getAttribute("aria-labelledby")}`);
      expect(heading?.textContent?.trim().length, section.getAttribute("aria-labelledby") ?? "").toBeGreaterThan(0);
    }
  });

  it("describes every screenshot for people who cannot see it", () => {
    render(<HowItWorksPage />);
    const images = screen.getAllByRole("img");

    expect(images.length).toBeGreaterThanOrEqual(8);
    for (const image of images) expect(image.getAttribute("alt")?.length, image.getAttribute("src") ?? "").toBeGreaterThan(20);
  });

  it("keeps the change log history collapsed until someone opens it", () => {
    const { container } = render(<HowItWorksPage />);

    const history = container.querySelector("section[aria-labelledby='changelog-history']");

    expect(history?.querySelectorAll("details").length).toBeGreaterThan(0);
    expect(history?.querySelectorAll("details[open]")).toHaveLength(0);
  });
});
