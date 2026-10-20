export type ChangelogRelease = {
  version: string;
  label: string;
  headline: string;
  href: string;
  fileName: string;
};

/** Newest first. The first entry is the current release; every other entry is archived history. */
export const CHANGELOG_RELEASES: readonly ChangelogRelease[] = [
  {
    version: "4",
    label: "Version 4",
    headline: "Search, Range, Brand and Critical Path filters and tabs on Products, shaped by the first show-and-tell.",
    href: "/docs/Launch-Readiness-v4-Changelog.md",
    fileName: "Launch-Readiness-v4-Changelog.md",
  },
  {
    version: "3.5",
    label: "Version 3.5",
    headline: "Every screen under test, documentation that checks itself, and a change log history.",
    href: "/docs/archive/Launch-Readiness-v3.5-Changelog.md",
    fileName: "Launch-Readiness-v3.5-Changelog.md",
  },
  {
    version: "3",
    label: "Version 3",
    headline: "A rebuilt interface, light and dark mode, information tracking, a data layer, sign-in architecture and the full guide.",
    href: "/docs/archive/Launch-Readiness-v3-Changelog.md",
    fileName: "Launch-Readiness-v3-Changelog.md",
  },
];

export const LATEST_RELEASE = CHANGELOG_RELEASES[0];
export const ARCHIVED_RELEASES = CHANGELOG_RELEASES.slice(1);

export const CHANGELOG_HREF = LATEST_RELEASE.href;
export const CHANGELOG_FILE_NAME = LATEST_RELEASE.fileName;

export const GUIDE_CONTENTS = [
  { id: "whats-new", label: "What is new in version 4" },
  { id: "what-it-is", label: "What launch readiness is" },
  { id: "the-model", label: "The idea in three steps" },
  { id: "readiness", label: "What the statuses mean" },
  { id: "flags", label: "Flags and placeholders" },
  { id: "page-layout", label: "How every page is laid out" },
  { id: "overview-screen", label: "Screen 1: Overview" },
  { id: "products-screen", label: "Screen 2: Products" },
  { id: "action-screen", label: "Screen 3: Action Required" },
  { id: "product-screen", label: "Screen 4: A product page" },
  { id: "sla", label: "The SLA, in working days" },
  { id: "roles-and-reminders", label: "Two roles, and Remind Commercial" },
  { id: "studio-and-summary", label: "Studio view and weekly summary" },
  { id: "search-and-filter", label: "Searching and filtering" },
  { id: "theme-and-devices", label: "Light, dark and small screens" },
  { id: "try-it", label: "Try it in five minutes" },
  { id: "under-the-hood", label: "Under the hood" },
  { id: "tests", label: "How we know it works" },
  { id: "thinking", label: "How the thinking changed" },
  { id: "limits", label: "What to keep in mind" },
  { id: "changelog-history", label: "Change log history" },
] as const;

/** Per-file test counts. Keep in step with `pnpm test`; `docs-consistency.test.ts` checks this list against the project and the README. */
export const TEST_FILES = [
  {
    file: "lib/launch/readiness.test.ts",
    tests: 11,
    protects: "The needs-attention count and lifecycle products: Launched and Dropped products are left out of the counts.",
  },
  {
    file: "lib/launch/working-days.test.ts",
    tests: 13,
    protects: "Working day arithmetic: weekends skipped forwards and backwards, 20 and 25 day spans, the gap between two dates, and singular and plural wording.",
  },
  {
    file: "lib/launch/completeness.test.ts",
    tests: 20,
    protects: "The 31 information fields and 13 mandatory ones: what counts as missing, N/A only in optional fields, data errors shown once, and optional fields never blocking completeness.",
  },
  {
    file: "lib/launch/sla.test.ts",
    tests: 9,
    protects: "The placeholder SLA: 20 working days by default, 25 for a Guest bed, the completion date and the projection date.",
  },
  {
    file: "lib/launch/readiness-model.test.ts",
    tests: 35,
    protects: "The three readiness statuses, info needed by and passed deadlines, launch in working days, the three flags, the default sort, and that the seed data covers every case.",
  },
  {
    file: "lib/launch/filters.test.ts",
    tests: 15,
    protects: "Search, category, status, launch window, outstanding work and information filters, alone and combined.",
  },
  {
    file: "lib/launch/store-reducer.test.ts",
    tests: 10,
    protects: "Providing information, moving work, blocking and clearing, notes, history and reset, and the permanent product notes log (newest first, trimmed, empty notes ignored, restored by reset).",
  },
  {
    file: "lib/launch/store.test.tsx",
    tests: 8,
    protects: "The in-memory store as components use it: each action reaches the right product, reset restores the demo data, and using it outside the provider fails loudly.",
  },
  {
    file: "lib/launch/seed-scenarios.integration.test.ts",
    tests: 27,
    protects: "Every demo product resolves correctly and every view agrees with every other view.",
  },
  {
    file: "lib/launch/critical-path.test.ts",
    tests: 11,
    protects: "The critical path summary: when one path counts as selected (filter or search), its active lines, own status and flagged counts, and the main and other launch dates.",
  },
  {
    file: "lib/launch/studio.test.ts",
    tests: 18,
    protects: "The Studio view rules: Active products only, search and filters, Not provided and data errors, grouping by style, the CSV contents and file name, and that studio details never change a status.",
  },
  {
    file: "lib/launch/weekly-summary.test.ts",
    tests: 17,
    protects: "The weekly summary rules: working days, scope (critical path filter or matching search, status card ignored), the three headline counts, At Risk and information-needed lists, date changes, stock after launch, the plain-text version, and that no status changes.",
  },
  {
    file: "lib/launch/product-notes.test.ts",
    tests: 6,
    protects: "The note rules: the 500-character limit, empty notes refused, role labels, simulated authors and newest-first order.",
  },
  {
    file: "lib/launch/seed-notes.test.ts",
    tests: 6,
    protects: "The seed notes: which Active products have them, weekday dates on or before 10 Nov 2026, and that notes never change a status.",
  },
  {
    file: "lib/launch/product-repository.test.ts",
    tests: 5,
    protects: "The data seam: listing, looking up by ID and handling an unknown ID.",
  },
  {
    file: "lib/launch/docs-consistency.test.ts",
    tests: 18,
    protects: "That this list, the README, every change log release, the screenshots and the product IDs in the guide match the project.",
  },
  {
    file: "lib/auth/auth.test.ts",
    tests: 20,
    protects: "The demo session, roles and the permission checks behind the Reset demo data button and adding product notes.",
  },
  {
    file: "lib/auth/session-context.test.tsx",
    tests: 6,
    protects: "How components read the session and permissions, and that using it outside the provider fails loudly.",
  },
  {
    file: "components/launch/status.test.tsx",
    tests: 6,
    protects: "Every status and lifecycle pill says its status in words, including Data error.",
  },
  {
    file: "components/launch/products-table.test.tsx",
    tests: 6,
    protects: "The Products table: columns, one row per product, links, status words and whole-row clicks.",
  },
  {
    file: "components/launch/theme-toggle.test.tsx",
    tests: 5,
    protects: "The dark mode toggle: its label, both directions, keyboard use and the unresolved-theme case.",
  },
  {
    file: "components/launch/download-button.test.tsx",
    tests: 4,
    protects: "The download links on How it works, including the real change log link.",
  },
  {
    file: "components/launch/guide-figure.test.tsx",
    tests: 8,
    protects: "Guide screenshots: captions, the scroll frame for tall pages and the top-to-bottom lists.",
  },
  {
    file: "components/launch/overview-view.test.tsx",
    tests: 10,
    protects: "The Overview screen: summary cards, singular and plural wording, launched products and the links into filtered lists.",
  },
  {
    file: "components/launch/products-view.test.tsx",
    tests: 25,
    protects: "The Products screen: urgency order, search, Range, Brand and Critical Path filters, the Active, Launched and Dropped tabs, the critical path summary, the no-results state and clearing filters.",
  },
  {
    file: "components/launch/action-required-view.test.tsx",
    tests: 10,
    protects: "The Action Required screen: At Risk before Information Incomplete, group counts, ordering by launch date and links to each product.",
  },
  {
    file: "components/launch/product-detail-view.test.tsx",
    tests: 11,
    protects: "The Product page: readiness banner, summary, progress and the Provide information form from open to saved.",
  },
  {
    file: "components/launch/product-notes.test.tsx",
    tests: 11,
    protects: "The Notes section on the Product page: title and count, newest first, adding as each role, the character count, the permanent-log caption and its place above the information sections.",
  },
  {
    file: "components/launch/studio-view.test.tsx",
    tests: 17,
    protects: "The Studio view on Products: the view switch in both roles, the Studio columns, filters with chips and Clear all, Group by style, the critical path strip without status cards, and the CSV export.",
  },
  {
    file: "components/launch/weekly-summary-dialog.test.tsx",
    tests: 6,
    protects: "The weekly summary preview: the button in both roles, the subject and headline, linked Cat Nos, on track as a count only, Copy text, and the simulated send with its toast and notification.",
  },
  {
    file: "components/launch/guide-sections.test.tsx",
    tests: 12,
    protects: "The What is new section and the collapsible change log history: archived versions start closed, open on click and download their own file.",
  },
  {
    file: "components/launch/app-shell.test.tsx",
    tests: 22,
    protects: "The app shell: primary and footer navigation, the current-page marker, the live Action Required count, the prototype strip and who can reset the demo data.",
  },
  {
    file: "components/launch/how-it-works-sections.test.tsx",
    tests: 15,
    protects: "The How it works sections: the model and statuses, flags and placeholders, the SLA, the walkthrough, how the thinking changed and the limits.",
  },
  {
    file: "app/how-it-works/page.test.tsx",
    tests: 8,
    protects: "The whole How it works page: metadata, every contents entry pointing at a real section, the downloads and the change log history.",
  },
] as const;

export const TEST_TOTALS = {
  tests: 431,
  files: 34,
  coverage: 99,
} as const;
