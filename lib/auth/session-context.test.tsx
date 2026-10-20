// @vitest-environment jsdom
import { render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DEMO_SESSION } from "./mock-provider";
import { SessionProvider, useSession } from "./session-context";
import type { Session } from "./types";

const wrapperFor = (session: Session | null) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
  };

describe("useSession", () => {
  it("gives components the session the server resolved", () => {
    const { result } = renderHook(() => useSession(), { wrapper: wrapperFor(DEMO_SESSION) });

    expect(result.current.session).toBe(DEMO_SESSION);
  });

  it("answers permission questions for the downstream team", () => {
    const { result } = renderHook(() => useSession(), { wrapper: wrapperFor(DEMO_SESSION) });

    expect(result.current.can("demo:reset")).toBe(true);
    expect(result.current.can("product:edit")).toBe(false);
    expect(result.current.can("reminder:send")).toBe(true);
  });

  it("answers permission questions for Commercial / Range Planning", () => {
    const viewer: Session = { user: { ...DEMO_SESSION.user, role: "commercial" } };
    const { result } = renderHook(() => useSession(), { wrapper: wrapperFor(viewer) });

    expect(result.current.can("product:view")).toBe(true);
    expect(result.current.can("product:edit")).toBe(true);
  });

  it("denies everything when nobody is signed in", () => {
    const { result } = renderHook(() => useSession(), { wrapper: wrapperFor(null) });

    expect(result.current.session).toBeNull();
    expect(result.current.can("product:view")).toBe(false);
  });

  it("fails loudly when used outside a SessionProvider", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useSession())).toThrow("useSession must be used inside SessionProvider");

    quiet.mockRestore();
  });
});

describe("SessionProvider", () => {
  it("renders its children", () => {
    render(
      <SessionProvider session={DEMO_SESSION}>
        <p>Inside the provider</p>
      </SessionProvider>,
    );

    expect(screen.getByText("Inside the provider")).toBeInTheDocument();
  });
});
