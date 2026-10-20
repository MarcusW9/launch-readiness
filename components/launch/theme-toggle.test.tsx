// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

const setTheme = vi.fn();
let resolvedTheme: string | undefined = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
    resolvedTheme = "light";
  });

  it("is a labelled button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Toggle dark mode" })).toBeInTheDocument();
  });

  it("switches to dark when the page is light", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }));

    expect(setTheme).toHaveBeenCalledExactlyOnceWith("dark");
  });

  it("switches to light when the page is dark", async () => {
    resolvedTheme = "dark";
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }));

    expect(setTheme).toHaveBeenCalledExactlyOnceWith("dark".replace("dark", "light"));
  });

  it("can be used from the keyboard", async () => {
    render(<ThemeToggle />);
    screen.getByRole("button", { name: "Toggle dark mode" }).focus();
    await userEvent.keyboard("{Enter}");

    expect(setTheme).toHaveBeenCalledOnce();
  });

  it("treats a theme that has not resolved yet as light", async () => {
    resolvedTheme = undefined;
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle dark mode" }));

    expect(setTheme).toHaveBeenCalledExactlyOnceWith("dark");
  });
});
