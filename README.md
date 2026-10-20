# Launch Readiness (v4)

A portfolio prototype that answers one question for every new product: **is it ready to launch, and if not, what is stopping it?**

Everything in this repository is a prototype. All products, IDs and statuses are fictional (retailer: Northwind Home), nothing is connected to a real system, and the demo date is fixed at **10 Nov 2026** so sample launch dates never go stale. It is not approved for deployment to production infrastructure.

- Full guide with screenshots: run the app and open **How it works** (`/how-it-works`).
- Latest change log (version 4, in progress): [`public/docs/Launch-Readiness-v4-Changelog.md`](public/docs/Launch-Readiness-v4-Changelog.md), also downloadable from the top of the How it works page.
- Past change logs are archived in [`public/docs/archive/`](public/docs/archive/): [`Launch-Readiness-v3.5-Changelog.md`](public/docs/archive/Launch-Readiness-v3.5-Changelog.md) and [`Launch-Readiness-v3-Changelog.md`](public/docs/archive/Launch-Readiness-v3-Changelog.md). They sit in the expandable Change log history at the bottom of the How it works page and can still be downloaded.

## The idea

```
Mandatory information -> SLA starts -> SLA Projection Date -> compared with the Proposed Launch Date
```

1. A product has a set of mandatory information fields. Until they are all complete the SLA has not started.
2. When the last mandatory field is complete the SLA starts. Its length is in working days (20 by default, 25 for a Guest bed; a placeholder, not yet agreed).
3. The SLA Projection Date is the start date plus the SLA working days.
4. The status follows from that: **On Track** when the projection is on or before the launch date, **Information Incomplete** while mandatory information is missing, and **Expectation At Risk** when the projection falls after the launch date.

### Statuses, flags and placeholders

- **Statuses** (exactly one per active product): **On Track**, **Information Incomplete** and **Expectation At Risk**. Live, Offsale and Dropped products stay in the table but leave the counts and Action Required.
- **Flags** sit beside the status and never change it: **Date Changed** (the Proposed Launch Date moved in the last 7 days) and **Stock lands after launch** (the Stock Ready Date is later than the Proposed Launch Date).
- **Placeholders:** the SLA length (20 working days, 25 for a Guest bed) is labelled as a placeholder wherever it appears. Working days are Monday to Friday and ignore bank holidays, so a projection can be a day or more optimistic than real life. The gap shown for late products is counted in working days.

## How the thinking changed

- **Version 1** tracked each team's work step by step, with a separate status for every stage.
- **Version 3** moved to mandatory information and SLA risk, because discovery showed that downstream teams track their work in their own systems.
- **Version 4** added changes from a show-and-tell with the teams who would use it.

## Screens

| Route | Purpose |
| --- | --- |
| `/` | Overview: three status cards (At Risk, Information Incomplete, On Track) that add up to the active total, plus the flagged counts |
| `/products` | Every product, with search, Range, Brand and Critical Path filters, tabs and the Studio view |
| `/action-required` | The exceptions only: Expectation At Risk and Information Incomplete, ordered by urgency |
| [`/products/4567890`](/products/4567890) (`/products/[id]`) | One product (the link opens a real seed product): a banner explaining the cause, the date timeline, field sections (mandatory fields tagged when missing) and the notes log |
| `/how-it-works` | Screen-by-screen guide with screenshots, plus the latest change log download and an expandable history of past versions |
| `/about` | About this prototype |

## Features

### Delivered in v4 (in progress)

- Restored SLA model: three statuses (On Track, Information Incomplete, Expectation At Risk) calculated from the mandatory information, the SLA working days and the Proposed Launch Date. The earlier step-by-step workflow pages are removed.
- Products table: Cat No., Product, PIM Date, Stock Ready Date, Proposed Launch Date (with launch in working days), SLA Projection Date, Additional Checks and one status badge per row. Summary cards are clickable filters. With one critical path selected, an Also flagged row shows the Date Changed and Stock lands after launch counts.
- Product page timeline and field sections: Product identity open by default, Photography collapsed and marked not mandatory.
- Two simulated roles in the header: Downstream team (read-only, default) and Commercial / Range Planning (can edit fields and the Proposed Launch Date). Downstream can remind Commercial about incomplete products, and moving a launch date notifies Downstream (both simulated).
- Products filter bar: search, Range, Brand and Critical Path. Search also finds products by critical path.
- Active, Launched and Dropped tabs with counts that respect the other filters. The earlier detailed filters sit behind a More filters button.
- Every demo product has a range and, for most, a critical path.
- Critical path summary: when one critical path is selected (by the filter or by a search that matches one), a strip above the status cards shows its name, active lines and main launch date (with a tooltip listing any other dates), and the status cards and Also flagged cards recalculate for that path.
- Notes log on the product page: a "Notes (n)" section between the status and launch date block and the information sections. Commercial / Range Planning and the Downstream team can both add notes (up to 500 characters, with a character count). Notes show newest first with the author, role and date and time, and cannot be edited or deleted. They never affect status, completeness or the SLA, and Reset demo data restores the seed notes.
- Studio view on Products: a switch above the table between the Exceptions view (the default, unchanged) and the Studio view. It is a view, not a role, so it is the same in both roles and never changes edit rights. The Studio table lists Active products with Critical Path, Customer Style Preference, Image, Cut Out, Lifestyle and Video sources and Components, with its own filters (search, Critical Path, style, image source), filter chips, Clear all and a Group by style toggle. Missing values show as "Not provided" and #N/A or #REF! as data errors. "Export to CSV (n products)" downloads the filtered rows as `launch-readiness-studio-[critical path or all]-2026-11-10.csv`. The status cards stay hidden; the critical path strip still shows when one path is selected.
- Weekly summary email preview on Products (Exceptions view): a "Preview weekly summary" button next to the other actions, in both roles. It opens an email-style panel with the subject, a headline of at risk, information incomplete and on track counts, Needs attention first (At Risk with the gap in working days, then Information Incomplete with Info needed by passed or within 10 working days), Changed this week (date changes and stock landing after launch), and on track as a count only. Each Cat No links to its product page. Scope is the Critical Path filter or a search that matches one path, otherwise all Active products, and the status card filter is ignored. Copy text copies a plain-text version, and Send (simulated) to Downstream teams or Commercial / Range Planning shows a toast and adds a notification. Nothing is sent, and no status, date or calculation changes.
- Still later: Job ID, per-category views and a real export and email. See the change log for the feedback behind each.

### Delivered in v3.5

- Every screen (Overview, Products, Action Required, and the product page) is tested through the rendered page.
- Component tests for the theme toggle, status pills, downloads, screenshots, products table, store and session.
- Documentation checks: a test compares this README, the How it works guide and the change logs with the real project.
- Wording fix: Overview now says "1 product needs your attention" for a single product.
- Change log history: the How it works page leads with the latest change log, and earlier versions are collapsed into an expandable history, each still downloadable.
- 437 automated tests across 34 test files, plus 3 browser tests (run on desktop and mobile) covering navigation, opening a product from Action Required and checking that removed pages no longer exist.

### Delivered in v3

- Interface rebuilt on Tailwind CSS and shadcn/ui.
- Light and dark mode toggle that follows the device on first visit and remembers the choice.
- Information tracked separately from work: Available, Missing and Not required, with Provide in place.
- Products that are Live, Offsale or Dropped stay visible in the table but leave the counts and the Action Required page.
- Asynchronous product repository as the single data seam.
- Session and permissions architecture with a built-in demo user. There is deliberately no sign-in screen.
- A full How it works guide with eight screenshots and a downloadable Markdown change log.
- 191 automated tests across 10 test files at release (now 437 across 34, see above).

### Behaviour worth knowing

- Changes (editing fields, moving a launch date, notes) last for the session only. Refresh or **Reset demo data** restores the starting state.
- Colour is never the only signal. Every status pill has an icon and a word.
- Overview counts always add up: the three status cards (At Risk, Information Incomplete, On Track) sum to the active total.

## Architecture

```
app/                    Next.js App Router pages (server components load data and session)
components/launch/      Screen components and shared building blocks
components/ui/          shadcn/ui primitives
lib/launch/             Pure business rules: readiness, SLA, completeness, filters, copy, reducer
lib/launch/data.ts      Fictional demo products
lib/launch/product-repository.ts   Async data seam (the only place real data would connect)
lib/auth/               Session types, permissions, mock provider, React session context
public/guide/           Screenshots used by the How it works page
public/docs/            Latest downloadable change log (v4)
public/docs/archive/    Past change logs (v3.5, v3), shown in the history on How it works
```

Design choices:

- **Rules apart from screens.** Statuses, SLA projection, information, filters and wording are plain functions with no UI code, which is why they are thoroughly testable.
- **One door for data.** Pages and the store read products only through the repository. Connecting a real API or database changes one module. That needs Engineering and InfoSec approval and is not done.
- **Auth seam without auth.** `lib/auth` provides a `Session`, a permission list and a mock provider. The header shows the demo user and the Reset button is permission-gated. A real identity provider would replace the mock provider.

## Getting started

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | TypeScript check with no output |
| `pnpm test` | Run all tests once |
| `pnpm test:e2e` | Run the browser tests with Playwright (builds and starts the app) |
| `pnpm test:watch` | Re-run tests on change |
| `pnpm test:coverage` | Run tests with coverage and enforce thresholds |
| `pnpm verify` | Typecheck, tests with coverage, then build |

## Tests

**437 tests across 34 test files, all passing, in a few seconds.** Business rules are tested as plain functions; components are tested the way a person uses them (by role, label and visible text) with Testing Library in jsdom.

| File | Tests | Protects |
| --- | ---: | --- |
| `lib/launch/readiness.test.ts` | 11 | The needs-attention count and lifecycle products: Launched and Dropped products are left out of the counts. |
| `lib/launch/working-days.test.ts` | 13 | Working day arithmetic: weekends skipped forwards and backwards, 20 and 25 day spans, the gap between two dates, and singular and plural wording. |
| `lib/launch/completeness.test.ts` | 20 | The 31 information fields and 13 mandatory ones: what counts as missing, N/A only in optional fields, data errors shown once, and optional fields never blocking completeness. |
| `lib/launch/sla.test.ts` | 9 | The placeholder SLA: 20 working days by default, 25 for a Guest bed, the completion date and the projection date. |
| `lib/launch/readiness-model.test.ts` | 35 | The three readiness statuses, info needed by and passed deadlines, launch in working days, the three flags, the default sort, and that the seed data covers every case. |
| `lib/launch/filters.test.ts` | 15 | Search, category, status, launch window, outstanding work and information filters, alone and combined. |
| `lib/launch/store-reducer.test.ts` | 10 | Providing information, moving work, blocking and clearing, notes, history and reset, and the permanent product notes log (newest first, trimmed, empty notes ignored, restored by reset). |
| `lib/launch/store.test.tsx` | 8 | The in-memory store as components use it: each action reaches the right product, reset restores the demo data, and using it outside the provider fails loudly. |
| `lib/launch/seed-scenarios.integration.test.ts` | 27 | Every demo product resolves correctly and every view agrees with every other view. |
| `lib/launch/critical-path.test.ts` | 11 | The critical path summary: when one path counts as selected (filter or search), its active lines, own status and flagged counts, and the main and other launch dates. |
| `lib/launch/studio.test.ts` | 18 | The Studio view rules: Active products only, search and filters, Not provided and data errors, grouping by style, the CSV contents and file name, and that studio details never change a status. |
| `lib/launch/weekly-summary.test.ts` | 17 | The weekly summary rules: working days, scope (critical path filter or matching search, status card ignored), the three headline counts, At Risk and information-needed lists, date changes, stock after launch, the plain-text version, and that no status changes. |
| `lib/launch/product-notes.test.ts` | 6 | The note rules: the 500-character limit, empty notes refused, role labels, simulated authors and newest-first order. |
| `lib/launch/seed-notes.test.ts` | 6 | The seed notes: which Active products have them, weekday dates on or before 10 Nov 2026, and that notes never change a status. |
| `lib/launch/product-repository.test.ts` | 5 | The data seam: listing, looking up by ID and handling an unknown ID. |
| `lib/launch/docs-consistency.test.ts` | 18 | That this list, the README, every change log release, the screenshots and the product IDs in the guide match the project. |
| `lib/auth/auth.test.ts` | 20 | The demo session, roles and the permission checks behind the Reset demo data button and adding product notes. |
| `lib/auth/session-context.test.tsx` | 6 | How components read the session and permissions, and that using it outside the provider fails loudly. |
| `components/launch/status.test.tsx` | 6 | Every status and lifecycle pill says its status in words, including Data error. |
| `components/launch/products-table.test.tsx` | 6 | The Products table: columns, one row per product, links, status words and whole-row clicks. |
| `components/launch/theme-toggle.test.tsx` | 5 | The dark mode toggle: its label, both directions, keyboard use and the unresolved-theme case. |
| `components/launch/download-button.test.tsx` | 4 | The download links on How it works, including the real change log link. |
| `components/launch/guide-figure.test.tsx` | 8 | Guide screenshots: captions, the scroll frame for tall pages and the top-to-bottom lists. |
| `components/launch/overview-view.test.tsx` | 10 | The Overview screen: summary cards, singular and plural wording, launched products and the links into filtered lists. |
| `components/launch/products-view.test.tsx` | 25 | The Products screen: urgency order, search, Range, Brand and Critical Path filters, the Active, Launched and Dropped tabs, the critical path summary, the no-results state and clearing filters. |
| `components/launch/action-required-view.test.tsx` | 10 | The Action Required screen: At Risk before Information Incomplete, group counts, ordering by launch date and links to each product. |
| `components/launch/product-detail-view.test.tsx` | 17 | The Product page: readiness banner, summary, progress, and how empty fields read (Missing for mandatory, plain Not provided for optional, Data error kept, section badges). |
| `components/launch/product-notes.test.tsx` | 11 | The Notes section on the Product page: title and count, newest first, adding as each role, the character count, the permanent-log caption and its place above the information sections. |
| `components/launch/studio-view.test.tsx` | 17 | The Studio view on Products: the view switch in both roles, the Studio columns, filters with chips and Clear all, Group by style, the critical path strip without status cards, and the CSV export. |
| `components/launch/weekly-summary-dialog.test.tsx` | 6 | The weekly summary preview: the button in both roles, the subject and headline, linked Cat Nos, on track as a count only, Copy text, and the simulated send with its toast and notification. |
| `components/launch/guide-sections.test.tsx` | 12 | The What is new section and the collapsible change log history: archived versions start closed, open on click and download their own file. |
| `components/launch/app-shell.test.tsx` | 22 | The app shell: primary and footer navigation, the current-page marker, the live Action Required count, the prototype strip and who can reset the demo data. |
| `components/launch/how-it-works-sections.test.tsx` | 15 | The How it works sections: the model and statuses, flags and placeholders, the SLA, the walkthrough, how the thinking changed and the limits. |
| `app/how-it-works/page.test.tsx` | 8 | The whole How it works page: metadata, every contents entry pointing at a real section, the downloads and the change log history. |

Coverage of the business rules and auth (`lib/**`) is about 99 percent of statements, 99 percent of branches and 100 percent of functions. `vitest.config.mts` fails the run if `lib/**` drops below 95 percent statements, 90 percent branches, 95 percent functions or 95 percent lines.

Components are measured but not gated. About 96 percent of component statements, 90 percent of branches and 95 percent of functions are covered. All four screens (Overview, Products, Action Required and Product page), the app shell and the How it works page are tested through the rendered page, including the provide-information form, search and filters, the live Action Required count and who can reset the demo data.

Not yet covered by automated tests: parts of the filter bar and the Products table. Visual appearance is still checked by hand in the browser.

### Browser tests

Three Playwright specs in `e2e/` run the main journeys in a real browser on a desktop and a mobile viewport (6 runs): moving between pages, opening a product from Action Required, and checking that removed pages no longer exist. Run `pnpm test:e2e`, which builds and starts the app on port 3100. Set `E2E_BASE_URL` to test an already running server instead. On a fresh machine, run `pnpm exec playwright install chromium` once first.

## Progress

| Area | State |
| --- | --- |
| SLA readiness model: three statuses, flags and Stock Ready Date | Done |
| Overview, Products, Action Required and Product screens | Done |
| Information model and provide-in-place | Done |
| Search and five filters | Done |
| Light and dark theme | Done |
| Lifecycle products (Live, Offsale, Dropped) | Done |
| Async repository seam | Done |
| Auth architecture (no sign-in) | Done |
| How it works guide with screenshots and change log | Done |
| Automated tests and coverage gate | Done |
| Real data source | Not started. Needs Engineering and InfoSec |
| Real sign-in | Not started. Architecture is ready |
| Agreed At Risk definition | Open question |
| Automated browser tests | Started: 8 journeys on desktop and mobile. Visual regression checks not started |

## Governance

This is prototype and proof-of-concept work only. Any connection to a database, internal API or backend service must go through Engineering and InfoSec-approved means before anything is treated as production-ready.
