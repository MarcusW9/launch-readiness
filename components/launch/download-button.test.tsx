// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CHANGELOG_FILE_NAME, CHANGELOG_HREF } from "@/lib/launch/guide-content";
import { DownloadButton } from "./download-button";

describe("DownloadButton", () => {
  it("is a link that downloads the file under the given name", () => {
    render(
      <DownloadButton href="/docs/guide.md" fileName="guide.md">
        Download the guide
      </DownloadButton>,
    );

    const link = screen.getByRole("link", { name: "Download the guide" });
    expect(link).toHaveAttribute("href", "/docs/guide.md");
    expect(link).toHaveAttribute("download", "guide.md");
  });

  it("hides its icon from screen readers so the name is just the label", () => {
    render(
      <DownloadButton href="/x.md" fileName="x.md">
        Get x
      </DownloadButton>,
    );

    expect(screen.getByRole("link", { name: "Get x" }).querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps extra attributes and classes from the caller", () => {
    render(
      <DownloadButton href="/x.md" fileName="x.md" className="custom-class" data-testid="dl">
        Get x
      </DownloadButton>,
    );

    expect(screen.getByTestId("dl")).toHaveClass("custom-class");
  });

  it("works with the real change log constants", () => {
    render(
      <DownloadButton href={CHANGELOG_HREF} fileName={CHANGELOG_FILE_NAME}>
        Download change log
      </DownloadButton>,
    );

    const link = screen.getByRole("link", { name: "Download change log" });
    expect(link).toHaveAttribute("href", CHANGELOG_HREF);
    expect(link.getAttribute("download")).toMatch(/\.md$/);
  });
});
