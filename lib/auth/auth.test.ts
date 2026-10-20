import { describe, expect, it } from "vitest";
import { UnauthenticatedError, authProvider, createAuth, getSession, requireSession } from "./index";
import { DEMO_SESSION, createMockAuthProvider } from "./mock-provider";
import { can } from "./permissions";
import type { Permission, Role, Session } from "./types";

const sessionFor = (role: Role): Session => ({ user: { ...DEMO_SESSION.user, role } });

describe("can", () => {
  const matrix: Record<Role, Record<Permission, boolean>> = {
    viewer: { "product:view": true, "note:add": true, "activity:update": false, "demo:reset": false },
    editor: { "product:view": true, "note:add": true, "activity:update": true, "demo:reset": true },
  };

  for (const role of Object.keys(matrix) as Role[]) {
    for (const permission of Object.keys(matrix[role]) as Permission[]) {
      const expected = matrix[role][permission];
      it(`${expected ? "allows" : "denies"} ${permission} for a ${role}`, () => {
        expect(can(sessionFor(role), permission)).toBe(expected);
      });
    }
  }

  it("denies every permission when nobody is signed in", () => {
    for (const permission of Object.keys(matrix.editor) as Permission[]) {
      expect(can(null, permission), permission).toBe(false);
    }
  });
});

describe("mock auth provider", () => {
  it("returns the fixed demo session by default", async () => {
    await expect(createMockAuthProvider().getSession()).resolves.toBe(DEMO_SESSION);
  });

  it("describes a fictional editor, never a real person", () => {
    expect(DEMO_SESSION.user.role).toBe("editor");
    expect(DEMO_SESSION.user.email).toMatch(/@example\.com$/);
  });

  it("can be told to model a signed-out visitor", async () => {
    await expect(createMockAuthProvider(null).getSession()).resolves.toBeNull();
  });
});

describe("the app's auth bindings", () => {
  it("use the mock provider in the prototype", async () => {
    await expect(authProvider.getSession()).resolves.toEqual(DEMO_SESSION);
    await expect(getSession()).resolves.toEqual(DEMO_SESSION);
    await expect(requireSession()).resolves.toEqual(DEMO_SESSION);
  });
});

describe("createAuth", () => {
  it("returns the session from whatever provider it is given", async () => {
    const viewer = sessionFor("viewer");
    const auth = createAuth(createMockAuthProvider(viewer));

    await expect(auth.getSession()).resolves.toBe(viewer);
    await expect(auth.requireSession()).resolves.toBe(viewer);
  });

  it("reports a signed-out visitor as null from getSession", async () => {
    await expect(createAuth(createMockAuthProvider(null)).getSession()).resolves.toBeNull();
  });

  it("makes requireSession reject a signed-out visitor with UnauthenticatedError", async () => {
    const auth = createAuth(createMockAuthProvider(null));

    await expect(auth.requireSession()).rejects.toBeInstanceOf(UnauthenticatedError);
    await expect(auth.requireSession()).rejects.toThrow("Authentication required");
  });

  it("passes provider failures through rather than treating them as signed out", async () => {
    const failing = createAuth({
      getSession: async () => {
        throw new Error("identity service unavailable");
      },
    });

    await expect(failing.requireSession()).rejects.toThrow("identity service unavailable");
  });
});

describe("UnauthenticatedError", () => {
  it("is a recognisable Error subclass", () => {
    const error = new UnauthenticatedError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("UnauthenticatedError");
  });
});
