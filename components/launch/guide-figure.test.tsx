// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuideFigure, SeenFromTop } from "./guide-figure";

const figureProps = {
  src: "/guide/overview.png",
  width: 1280,
  height: 800,
  alt: "The Overview screen",
  caption: "The Overview screen in light mode.",
};

describe("GuideFigure", () => {
  it("shows the screenshot with its alt text and a visible caption", () => {
    render(<GuideFigure {...figureProps} />);

    expect(screen.getByRole("img", { name: "The Overview screen" })).toBeInTheDocument();
    expect(screen.getByText("The Overview screen in light mode.")).toBeInTheDocument();
  });

  it("is a figure so the caption belongs to the image", () => {
    render(<GuideFigure {...figureProps} />);

    const figure = screen.getByRole("figure");
    expect(within(figure).getByText(figureProps.caption)).toBeInTheDocument();
  });

  it("does not add a scroll frame for a normal screenshot", () => {
    render(<GuideFigure {...figureProps} />);

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByText(/Scroll inside the frame/)).not.toBeInTheDocument();
  });

  it("puts a tall screenshot in a keyboard-focusable, named scroll frame", () => {
    render(<GuideFigure {...figureProps} scrollable />);

    const frame = screen.getByRole("region", { name: `${figureProps.caption}. Scroll to see the whole page.` });
    expect(frame).toHaveAttribute("tabindex", "0");
    expect(within(frame).getByRole("img")).toBeInTheDocument();
    expect(screen.getByText(/Scroll inside the frame to see the full page\./)).toBeInTheDocument();
  });
});

describe("SeenFromTop", () => {
  it("lists what is on screen as an ordered, top-to-bottom list", () => {
    render(<SeenFromTop items={["The header", "The summary cards", "The table"]} />);

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["1The header", "2The summary cards", "3The table"]);
  });

  it("uses a default heading that says what the list is", () => {
    render(<SeenFromTop items={["Only item"]} />);

    expect(screen.getByRole("heading", { name: "What you see, from top to bottom" })).toBeInTheDocument();
  });

  it("accepts a custom heading", () => {
    render(<SeenFromTop title="The filter bar" items={["Search box"]} />);

    expect(screen.getByRole("heading", { name: "The filter bar" })).toBeInTheDocument();
  });

  it("hides the step numbers from screen readers, which already announce list position", () => {
    render(<SeenFromTop items={["A", "B"]} />);

    const numbers = screen.getByRole("list").querySelectorAll("[aria-hidden='true']");
    expect(numbers).toHaveLength(2);
  });
});
