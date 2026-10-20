import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { ACTIVITY_DEFINITIONS } from "./activity-definitions";
import { WORK_STATE_LABELS } from "./copy";
import {
  ARCHIVED_RELEASES,
  CHANGELOG_FILE_NAME,
  CHANGELOG_HREF,
  CHANGELOG_RELEASES,
  GUIDE_CONTENTS,
  LATEST_RELEASE,
  TEST_FILES,
  TEST_TOTALS,
} from "./guide-content";
import { SEED_PRODUCTS } from "./data";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

function findTestFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    if (entry === "node_modules" || entry.startsWith(".")) return [];
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return findTestFiles(full);
    return /\.test\.tsx?$/.test(entry) ? [relative(root, full)] : [];
  });
}

describe("the test list in the guide", () => {
  const listed = TEST_FILES.map((entry) => entry.file);

  it("names only files that exist", () => {
    for (const file of listed) expect(existsSync(join(root, file)), file).toBe(true);
  });

  it("includes every test file in the project, so none go undocumented", () => {
    expect(findTestFiles(root).sort()).toEqual([...listed].sort());
  });

  it("totals match the per-file figures", () => {
    expect(TEST_FILES.reduce((sum, entry) => sum + entry.tests, 0)).toBe(TEST_TOTALS.tests);
    expect(TEST_FILES).toHaveLength(TEST_TOTALS.files);
  });

  it("says what each file protects", () => {
    for (const entry of TEST_FILES) expect(entry.protects.length, entry.file).toBeGreaterThan(20);
  });
});

describe("the README", () => {
  const readme = read("README.md");

  it("states the same test and file totals as the guide", () => {
    expect(readme).toContain(`${TEST_TOTALS.tests} tests`);
    expect(readme).toContain(`${TEST_TOTALS.files} test files`);
  });

  it("mentions every test file", () => {
    for (const { file } of TEST_FILES) expect(readme, file).toContain(file);
  });

  it("uses the user-facing name for work waiting on information", () => {
    expect(readme).toContain(WORK_STATE_LABELS["Awaiting information"]);
  });

  it("names every launch activity", () => {
    for (const def of Object.values(ACTIVITY_DEFINITIONS)) expect(readme, def.name).toContain(def.name);
  });
});

describe("the downloadable change log", () => {
  it("is served from the path the page links to", () => {
    expect(CHANGELOG_HREF).toBe(LATEST_RELEASE.href);
    expect(CHANGELOG_FILE_NAME).toBe(LATEST_RELEASE.fileName);
    expect(CHANGELOG_HREF).toBe(`/docs/${CHANGELOG_FILE_NAME}`);
    expect(existsSync(join(root, "public", CHANGELOG_HREF))).toBe(true);
  });

  it("is Markdown with a title and no internal work-state name", () => {
    const text = read(`public${CHANGELOG_HREF}`);

    expect(CHANGELOG_FILE_NAME).toMatch(/\.md$/);
    expect(text.trimStart().startsWith("# ")).toBe(true);
    expect(text).not.toMatch(/\bAwaiting information\b/);
  });

  it("states the same test and file totals as the guide", () => {
    const text = read(`public${CHANGELOG_HREF}`);

    expect(text).toContain(`${TEST_TOTALS.tests} automated tests across ${TEST_TOTALS.files} files`);
  });
});

describe("the change log history", () => {
  it("lists the newest release first, with unique versions", () => {
    const versions = CHANGELOG_RELEASES.map((release) => release.version);

    expect(new Set(versions).size).toBe(versions.length);
    expect(LATEST_RELEASE).toBe(CHANGELOG_RELEASES[0]);
    expect(ARCHIVED_RELEASES).toEqual(CHANGELOG_RELEASES.slice(1));
    expect(ARCHIVED_RELEASES.length).toBeGreaterThan(0);
  });

  it("has a Markdown file on disk for every release, served from the path it links to", () => {
    for (const release of CHANGELOG_RELEASES) {
      expect(release.fileName, release.version).toMatch(/\.md$/);
      expect(release.href.endsWith(release.fileName), release.version).toBe(true);
      expect(existsSync(join(root, "public", release.href)), release.href).toBe(true);
      expect(read(`public${release.href}`).trimStart().startsWith("# "), release.href).toBe(true);
    }
  });

  it("keeps archived releases out of the top level so only the latest is promoted", () => {
    for (const release of ARCHIVED_RELEASES) expect(release.href, release.version).toContain("/archive/");
    expect(LATEST_RELEASE.href).not.toContain("/archive/");
  });

  it("marks every archived change log as archived and points to the latest", () => {
    for (const release of ARCHIVED_RELEASES) {
      const text = read(`public${release.href}`);

      expect(text, release.href).toMatch(/Archived/);
      expect(text, release.href).toContain(LATEST_RELEASE.fileName);
    }
  });

  it("mentions every release's change log in the README", () => {
    const readme = read("README.md");

    for (const release of CHANGELOG_RELEASES) expect(readme, release.fileName).toContain(release.fileName);
  });
});

describe("the guide contents", () => {
  it("gives every section a unique anchor", () => {
    const ids = GUIDE_CONTENTS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a screenshot on disk for every image the guide refers to", () => {
    const sources = read("components/launch/guide-sections.tsx").match(/\/guide\/[\w-]+\.png/g) ?? [];

    expect(sources.length).toBeGreaterThan(0);
    for (const source of new Set(sources)) expect(existsSync(join(root, "public", source)), source).toBe(true);
  });
});

describe("the demo data the guide walks through", () => {
  it("includes the product IDs the guide tells readers to open", () => {
    const ids = new Set(SEED_PRODUCTS.map((product) => product.id));
    const referenced = new Set(
      [...(read("components/launch/guide-sections.tsx") + read("README.md")).matchAll(/\b\d{7}\b/g)].map((match) => match[0]),
    );

    for (const id of referenced) expect(ids, `${id} is mentioned in the docs but not in the demo data`).toContain(id);
  });
});
