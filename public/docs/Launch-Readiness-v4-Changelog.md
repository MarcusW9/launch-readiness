# Launch Readiness: Version 4 change log

Launch Readiness is a portfolio prototype that tracks whether new products are ready to launch. All products, IDs and statuses are fictional (retailer: Northwind Home). The demo date is fixed at 10 Nov 2026.

Version 4 is the first version shaped by feedback from a show-and-tell. The main theme: people want to see the product list by critical path (the season and phase a product launches in, such as AW26 PH1) and in views made for their role, without adding every spreadsheet column back to the main screen.

This change log lists the four changes built for the version 4 demo (Change 1 to Change 4, plus Fix 1a) and what is deliberately left for later.

Everything in version 3.5 still applies. Its change log is archived and can still be downloaded: `Launch-Readiness-v3.5-Changelog.md`.

## Summary

| Area | Change |
| --- | --- |
| Products | A new filter bar: search, Range, Brand and Critical Path. Search also finds products by critical path. |
| Tabs | Active, Launched and Dropped tabs with counts that respect the other filters. |
| Data | Every demo product now has a range and, for most, a critical path. |
| Critical path summary | Selecting one critical path shows a summary strip (name, active lines, main launch date) and recalculates the status cards for that path. |
| Notes | A permanent Notes log on the product page. Both roles can add notes; they never affect status or any calculation. |
| Studio view | A switch on Products between the Exceptions view and a Studio view with its own columns, filters, Group by style and a CSV export of the filtered rows. |
| Weekly summary | A "Preview weekly summary" button in the Exceptions view opens an email-style preview (at risk, information incomplete, on track, what changed). Copy text and a simulated send, with a toast and a notification. Nothing is sent. |
| Later | Job ID, per-category views, real export and email, Commercial review. |
| Quality | 437 automated tests across 34 files (up from 481 in version 3.5), plus browser tests of the main journeys on desktop and mobile. |

## What the show-and-tell told us

| # | Feedback | Who | What it means for the product | Status |
| --- | --- | --- | --- | --- |
| 1 | Teams plan by critical path name (for example AW26 PH1). They want to filter by it and see how many lines are in that season, with an overall status. | Review group | The summary cards should respond to the critical path filter and show the line count and the main launch date or dates. | Built. The filter and a critical path summary strip are in place. |
| 2 | Search should also find products by critical path name. | Review group | A small search change. | Built. |
| 3 | Studio needs its own view: Cat No, description, brand, trend or customer style preference, asset source (studio, supplier, retouch) and components. They pull this into Excel today to plan shoots. | Studio team | A Studio view with its own columns, filters and an export. | Built (Change 3). |
| 4 | Job ID is created by the studio when a product is ready to brief, not at the start. | Studio team and review group | This is not Commercial context. Add it later as an optional field entered by the studio. | Later. |
| 5 | A comments column in the spreadsheet is typed in by Commercial (for example "design insert" or "supplier providing images"). | Review group | A notes log on the product (who, when, text), entered in the app rather than imported. | Built (Change 2). |
| 6 | Export and a weekly summary: on track, at risk and needs attention. | Review group | Simulate an export and an email preview. A real export and email depend on data-governance approval, so they are a later step. | Preview built (Change 4), and the Studio CSV export is built (Change 3). Real export and email later. |
| 7 | Different teams and categories may need different columns. | Review group | Role or category views come later, once the lead for each category has given input. | Later. |
| 8 | Do not recreate the spreadsheet on the main screen. Extra detail belongs on the product page, in role views or in existing reports. | Review group | This becomes a design principle for version 4 (see below). | Applied to every change. |

The strongest positive signal was the three-status summary (Ready, Action Required, At Risk), which was described as groundbreaking because the spreadsheet does not show what is a problem. Version 4 builds on it.

## Design principle for version 4

The main screen stays simple. Extra columns do not go back onto the Products table. Detail belongs on the product page, in a role view such as Studio, or in an existing report. The filter bar follows this: the four controls people asked for are always visible, and the older detailed filters sit behind a "More filters" button.

## Change 1: Critical path summary and search

### Search, filters and tabs on Products

- The Products screen opens with a filter bar: a search box (with a clear button) and Range, Brand and Critical Path dropdowns.
- Search matches name, product ID, brand, range and critical path. Typing a critical path name such as `AW26 PH2` finds the products in that season.
- Active, Launched and Dropped tabs sit under the bar, each with a count. The counts respect the other filters, and the line below reads, for example, "Showing 22 of 22 active products".
- Products with no range or critical path are listed under "#N/A".
- The earlier filters (category, status, launch date, outstanding work, information) are still there, behind a "More filters" button. The status list only offers statuses that can appear on the current tab.
- Clear all filters keeps the current tab. Links from the Overview that filter by status open the matching tab.
- Each demo product now has a range and, for most, a critical path (AW26 PH1 to PH3, SS26 PH3, SS27 PH1).

### Critical path summary and search

- The search box placeholder now reads "Search title, Cat No or critical path". Search already matched critical path (for example `AW26 PH1`), and this is now covered by tests.
- When exactly one critical path is selected, a compact summary strip appears above the status cards. A path counts as selected when the Critical Path filter names it, or when a search matches products in that path only. The strip is hidden when nothing, several paths, or #N/A is selected.
- The strip reads "[Critical path] · [n] active lines" and shows the Main launch date: the most common Proposed Launch Date among the path's active lines. If dates differ, a "+[n] other dates" button opens a list of those dates with the number of lines on each. A tie between dates goes to the earlier date.
- The three status cards (At Risk, Action Required, Ready) and the Also flagged cards (Blocked, Missing information) recalculate for the filtered set, so they show that critical path's own counts. They follow the other filters too.
- The main table has no new columns.
- New file `lib/launch/critical-path.ts` holds the logic and `components/launch/critical-path-summary.tsx` the strip. `products-view.tsx` shows it and `product-filters.tsx` has the new placeholder.

## Fix 1a: Demo data for the summary

- The seed products span five critical paths: AW26 PH1, AW26 PH2, AW26 PH3, SS26 PH3 and SS27 PH1, with a mix of Ready, Action Required and At Risk lines.
- Launch dates within each critical path were lined up so each has a clear main date. 11 products moved by 1 to 6 days. No product changed status, so every key seed product (4836047, 4837721, 4838264, 4841588, 4840133, 4835512, 4833390, 4844802) keeps the status it had.
- Kettlewell Air Fryer (8901234) moved from AW26 PH1 to AW26 PH2, so AW26 PH2 has two different launch dates and shows "+1 other date".
- The urgency order test changed where products now share a launch date. Ties keep their seed order.

## Change 2: Notes log

- The product page has a "Notes (n)" section between the status and launch date block and the information sections. It lists notes newest first.
- Each note shows the text, the author name, the role ("Commercial / Range Planning" or "Downstream team") and the date and time.
- Both roles can add notes, including the Downstream team, who stay read-only for product fields. A text box and an "Add note" button sit above the list. Notes are limited to 500 characters with a live character count, and empty or blank notes are refused. The new note appears at the top straight away.
- Authors are simulated: Priya Shah for Commercial / Range Planning and Daniel Okafor for the Downstream team.
- Notes are a permanent log. They cannot be edited or deleted, and the caption "Notes are a permanent log and can't be edited" says so.
- Notes do not affect status, completeness, the SLA or any calculation. There is no notes column or icon on the Products list.
- Reset demo data restores the seed notes and removes any added during the session.
- New files: `lib/launch/product-notes.ts` (the rules), `components/launch/product-notes.tsx` (the section). The store has an `addProductNote` action and `lib/auth/permissions.ts` has the new permission to add notes.

### Seed notes

- Seven realistic notes are spread over five Active products: Sofa Bed (1234567), 3456789, 5678901, 1134567 and 1467890. Examples: "Design insert required for the packaging", "Supplier to provide lifestyle images", "Repro colour from 8514505" and "Components: frame, worktop, accessories and fixings shipped separately".
- Every seed note is dated on a weekday on or before 10 Nov 2026.
- No product changed status. Notes are stored apart from every status calculation, and a test checks every product's status before and after notes are added.
- Product IDs 4836047 and 4841588 do not exist in this prototype's data, so they have no notes. Tell me which products to use instead and I will add notes to them.
- How it works: the "Screen 4: A product page" walkthrough now has a Notes bullet, placed above the information sections as on the page (`components/launch/guide-sections.tsx`). No test counts changed.

## Change 3: Studio view and CSV export

- A switch above the table on Products: "Exceptions view" (the current table, the default) and "Studio view". It is a view, not a role. It is the same in both roles and does not change edit rights. The Exceptions view gains no columns.
- The Studio table lists Active products only, one row each: Cat No., Product (title and brand chip), Critical Path, Customer Style Preference, Image Source, Cut Out source, Lifestyle source, Video source, Components, Proposed Launch and Status (a small badge). Missing values show as "Not provided" in grey. #N/A and #REF! show as data errors.
- Filters on one row: search (the same as the Exceptions view, so it also finds critical paths), Critical Path, Customer Style Preference and Image Source. Active filters show as chips, each removable, with "Clear all".
- "Group by style" groups rows under Customer Style Preference headings with a line count, soonest launch first inside each group. Groups run alphabetically with "Not provided" last.
- The status summary cards and the "Also flagged" cards are hidden in the Studio view. There is no "Remind Commercial" button in this prototype, so there was nothing to hide. The critical path strip still shows when one path is selected.
- "Export to CSV (n products)" downloads the filtered rows with the Studio columns, named `launch-readiness-studio-[critical path or all]-2026-11-10.csv`. The file starts with a byte order mark so Excel reads it as UTF-8, and values that start like a spreadsheet formula are defused. A note says "Prototype: exports synthetic demo data only".
- New files: `lib/launch/studio.ts` (the rules and the CSV), `components/launch/studio-view.tsx`, `studio-table.tsx`, `studio-filters.tsx`, `view-switch.tsx` and a shared `search-box.tsx`, now also used by the Exceptions filter bar. `critical-path-summary.tsx` can show the strip without the cards.
- Studio details (`studio` on each product) are read only and kept apart from every status calculation. No product changed status, and a test compares every Active product's status with and without them.

### Seed data for the Studio view

- Active products now cover several Customer Style Preferences and a mix of image sources (Studio shoot, Supplier and Repro / Retouch). At least three products have Components filled. A few values are left blank on purpose so "Not provided" shows, and one is #N/A so a data error shows.
- Statuses are unchanged.

## Change 4: Weekly summary preview

- A "Preview weekly summary" button sits with the other actions above the table in the Exceptions view. It is available in both roles and does not appear in the Studio view.
- Scope: the current Critical Path filter, or a search that matches exactly one path. Otherwise the summary covers all Active products. The status card filter is ignored.
- The preview opens in a panel styled like a simple email. Subject: "Launch Readiness weekly summary – [critical path or All active products] – w/c 9 Nov 2026". Headline: "[n] products: [a] at risk, [b] information incomplete, [c] on track", with the same colours as the status cards.
- Needs attention comes first: At Risk products (Cat No, title, gap in working days, launch date), then Information Incomplete products whose Info needed by date has passed or falls within the next 10 working days (missing count and deadline).
- Changed this week lists products whose launch date changed (old to new date) and products whose stock lands after launch. On track is a count only, not a list. Each Cat No links to its product page.
- Footer: "Generated from Launch Readiness on 10 Nov 2026. Prototype: no email is sent."
- Copy text copies a plain-text version. "Send (simulated)" asks for a recipient, Downstream teams or Commercial / Range Planning, then shows a toast and adds an entry to a new notifications bell in the header. Nothing is sent.
- Display-only seed fields (`previousLaunchDate`, `launchDateChangedOn`, `stockLandsDate`) on five products feed the Changed this week section. They never feed a status, date or calculation, and no product changed status.
- New files: `lib/launch/weekly-summary.ts` (the rules and plain text), `lib/launch/notifications.tsx` (notifications and toasts), `components/launch/weekly-summary-dialog.tsx`, `toaster.tsx`, `notifications-menu.tsx` and `components/ui/dialog.tsx`. `products-view.tsx` has the button and `app-shell.tsx` the bell and toaster.

## Fix 4a: Fictional brands and refreshed guide screenshots

1. Real retailer and brand names in the seed data, tests, guide copy and docs were replaced with fictional ones (for example the Oakline and Hearthwell brands, and Little Acorn products). Colleague names in the docs became roles. Product IDs, statuses and dates are unchanged, so no product changed status.
2. All nine How it works screenshots in `public/guide/` were retaken from the running app, so they show the fictional brands, the notifications bell, the Notes section, the Exceptions and Studio view switch, and the Active, Launched and Dropped tabs.
3. The "Searching and filtering products" copy now describes what the screenshot shows: Active (2), Launched (0) and Dropped (1), and "Showing 2 of 15 active products". The product page image is taller because of the Notes and Progress cards, so its height and alt text in `components/launch/guide-sections.tsx` were updated.
4. One search test used "OAK", which now also matches the Oakline brand, so it searches "TABLE" instead (`lib/launch/filters.test.ts`). The suite still has 594 tests.
5. The committed test-runner output (`.vitest/json/output.json`) was removed from git and `.vitest/` was added to `.gitignore`. A search of every tracked file, including the lockfile, finds no real brand names, no private packages and no colleague names.

## Fix 4b: Product name and internal wording

1. The prototype is now called Launch Readiness everywhere. The old process name was removed from page titles (How it works, Products, Action Required, About), the README heading and links, the guide copy, the "Added to Launch Readiness" history entries, the Studio CSV file name (`launch-readiness-studio-...csv`) and the weekly summary subject and footer.
2. The three change logs were renamed to `Launch-Readiness-v4-Changelog.md`, `Launch-Readiness-v3.5-Changelog.md` and `Launch-Readiness-v3-Changelog.md`. Links in the README and the How it works page were updated, and the tests that assert the titles, headings, subject and file names were updated to match.
3. The About page no longer names internal systems. It now says there is no connection to any product, stock or asset system, or to the spreadsheet it replaces.
4. Internal jargon in this change log was made generic: "data-governance approval", "a comments column in the spreadsheet", "a lead for each category" and "the wider team".
5. The README and the v3 change log no longer mention private design-system packages. The Interface line now reads "Rebuilt on Tailwind CSS and shadcn/ui", and the v3 package notes say the prototype installs from the public registry only.
6. The filters test product that used a real brand now uses the fictional Hearthwell brand. No assertion referred to the old brand.
7. `*.tsbuildinfo` was added to `.gitignore`.
8. Tests: type-check is clean and all 594 tests pass across 38 files. No product status or date changed.

## Fix 4c: Single source of truth for the readiness model

1. New `lib/launch/readiness-config.ts` is now the single source of truth for the readiness model: the 31 information fields and which 13 are mandatory, the values that count as a data error (`#N/A`, `#REF!`) or not applicable (`N/A`), and the SLA settings (20 working days by default, 25 for a Guest bed).
2. New pure modules read from that config: `lib/launch/working-days.ts` (weekday arithmetic), `lib/launch/completeness.ts` (which mandatory fields are missing), `lib/launch/sla.ts` (the completion and projection dates) and `lib/launch/readiness-model.ts` (status, flags and sort, replacing the scattered logic this change log previously described across `readiness.ts` and `information.ts`).
3. A new seed product, the Oakline Fold-Away Guest Bed (`1912345`, Furniture), has every activity done and every mandatory field present, so it is Ready and uses the 25 working day SLA. It has its own Studio brief and information answers; no other product's status, date or flag changed.
4. One existing date moved by a day: the Hearthwell 3-Seater Garden Sofa Set's launch date (`1467890`) changed from a Saturday to the nearest working day so the launch countdown lines up with the working-day rules. Its status and flags are otherwise unchanged.
5. New files: `lib/launch/readiness-config.ts`, `working-days.ts`, `completeness.ts`, `sla.ts`, `readiness-model.ts`, and their test files. `readiness.ts` and `information.ts` are unchanged and still used by the UI; the new modules do not yet replace them there.
6. Tests: type-check is clean and all 672 tests pass across 42 files, including a check that the seed data covers every readiness status and flag at least once.

## Change 5: Screens rebuilt on the SLA model

1. **Three statuses everywhere.** Every screen now shows On Track, Information Incomplete or Expectation At Risk, calculated from the mandatory information, the SLA working days and the Proposed Launch Date. One status badge per row. Files: `lib/launch/readiness-model.ts`, `lib/launch/readiness.ts`, `components/launch/status.tsx`.
2. **Products table.** Columns are Cat No., Product (title wraps to two lines, brand chip below), PIM Date, Stock Ready Date, Proposed Launch Date (with "Launch in n working days"), SLA Projection Date (tooltip shows the SLA length used), Additional Checks and Status. Date Changed and data errors show inline. No extra columns were added. Files: `components/launch/products-table.tsx`, `components/launch/products-view.tsx`.
3. **Summary cards.** Three status cards (At Risk, Information Incomplete, On Track) add up to the active total. Smaller "Also flagged" cards show Date Changed (blue) and Stock lands after launch (orange). Every card is a clickable filter. File: `components/launch/summary-cards.tsx`.
4. **Product page.** A banner explains the cause in one sentence, followed by a full-width date timeline, field sections (Product identity open by default, Photography collapsed and marked not mandatory), "Mandatory" tags shown only when the field is missing, and the notes log. Files: `components/launch/product-detail-view.tsx`, `launch-timeline.tsx`, `product-information.tsx`.
5. **Roles.** The header switches between Downstream team (read-only, the default) and Commercial / Range Planning (can edit fields and the Proposed Launch Date). Downstream can remind Commercial about incomplete products (simulated: confirm, toast, notification), and moving a launch date notifies Downstream (simulated). Files: `components/launch/role-switcher.tsx`, `remind-commercial.tsx`, `launch-date-editor.tsx`, `lib/auth/permissions.ts`, `lib/launch/edit-product.ts`.
6. **Activity pages removed.** The activity pages and workflow are gone. Action Required stays and lists only the At Risk and Information Incomplete exceptions.
7. **Kept from earlier in version 4.** Critical path filter and summary strip, search by critical path, Active, Launched and Dropped tabs, Studio view with CSV export, notes log and weekly summary preview, now driven by the new statuses.
8. **Docs.** The How it works page, About page, README and this change log describe the new model.
9. **Mobile header fix.** The role switcher and action buttons no longer push the page wider than the screen on phones; they wrap onto their own rows. File: `components/launch/app-shell.tsx`.
10. **Tests.** Screen, rule, store, seed scenario and documentation tests were rewritten for the new model: 428 automated tests across 34 files, all passing. The browser navigation test no longer expects activity pages; it could not be run in this environment because the browser's system libraries are missing.

## Fix 5a: Wording and documentation clean-up

1. The history entry on every seed product that read "Added to the AW26 PH1 plan." now reads "Added to the tracker." (`lib/launch/data.ts`). No product status or date changed.
2. "Data governance approval" is hyphenated as "data-governance approval" throughout this change log.
3. The How it works contents list said "The idea in six steps" while the section says three; the label now matches. File: `lib/launch/guide-content.ts`.
4. How it works has two new sections. "Flags and placeholders" explains Date Changed, Stock lands after launch, the placeholder SLA length and the working-day limitation. "How the thinking changed" summarises version 1, version 3 and version 4. Both are in the page contents. Files: `components/launch/how-it-works-sections.tsx`, `app/how-it-works/page.tsx`, `lib/launch/guide-content.ts`.
5. The README has matching "Statuses, flags and placeholders" and "How the thinking changed" sections, and its product page row now links to a real seed product (`/products/4567890`).
6. Tests: type-check is clean and all 428 tests pass across 34 files.

## Fix 5b: Tests for the new How it works sections

1. Added tests for the two new How it works sections. "Flags and placeholders" is checked for both flags (Date Changed with its seven-day window, Stock lands after launch), the statement that flags never change the status, completeness or SLA, and the placeholder SLA length (the default and the 25 working days for a Guest bed) with the working-day and fictional-data notes. "How the thinking changed" is checked for version 1, version 3 and version 4 in order. File: `components/launch/how-it-works-sections.test.tsx`, which grows from 12 to 15 tests.
2. The README test table, the per-file test table on How it works and this change log now read 431 automated tests across 34 files (up from 428). Files: `README.md`, `lib/launch/guide-content.ts`.
3. The README and How it works descriptions of `how-it-works-sections.test.tsx` now name the sections it covers, replacing wording that referred to content that no longer exists.
4. Tests: type-check is clean and all 431 tests pass across 34 files.

## Fix 6: Stock Ready Date on every product, and a rewritten guide

1. **Stock Ready Date on every seed product.** Each product now has one. It defaults to 7 calendar days before the Proposed Launch Date. Two products are seeded to show "Stock lands after launch" (the Little Acorn Wooden Play Kitchen is also Information Incomplete, and another is At Risk). #N/A appears only on the Little Acorn Remote Control Racing Car, which is a deliberate data-error example. File: `lib/launch/data.ts`.
2. **Type comment.** The comment on the Stock Ready Date field now says it feeds the "Stock lands after launch" flag and the product timeline, but never the SLA or the status. File: `lib/launch/types.ts`.
3. **How it works rewritten for the SLA model.** Every section, caption and alt text now describes three status cards with the flagged counts, the Products columns (Cat No., Product, PIM Date, Stock Ready Date, Proposed Launch Date, SLA Projection Date, Additional Checks, Status), the product page (cause banner, date timeline, field sections, notes), Action Required as exceptions only, the two roles with Remind Commercial, the Studio view and the weekly summary. All mentions of activities, requirements, work states, Ready and Action Required statuses and the 10-day rule are removed. Two new sections, "Two roles, and Remind Commercial" and "Studio view and weekly summary", are in the page contents. Files: `components/launch/guide-sections.tsx`, `components/launch/how-it-works-sections.tsx`, `app/how-it-works/page.tsx`, `lib/launch/guide-content.ts`.
4. **Screenshots retaken.** All seven images in `public/guide/` were captured from the current build at 1280 x 800 (the product page at full height, the mobile view at 390 wide, `overview-dark.png` in dark mode) with the Next.js dev indicator hidden. `activity-page.png` and `provide-information.png` are deleted because nothing uses them.
5. **README** wording and tables updated to match.
6. **Tests.** Three How it works tests were updated for the new wording and the eight-step walkthrough. Type-check is clean and all 431 tests pass across 34 files.

## Fix 7: Optional empty fields no longer look like problems

1. **Product page field list.** An empty mandatory field keeps the amber "Missing" badge and the "(mandatory)" tag. An empty optional field now shows "Not provided" as plain muted grey text, with no badge and no amber. An optional field holding #N/A or #REF! keeps the "Data error" badge. File: `components/launch/product-information.tsx`.
2. **Section headers.** Headers count only mandatory gaps, for example "1 mandatory missing". A section whose mandatory fields are all in reads "Complete" even when optional fields are empty. A section with no mandatory fields (Photography and digital) shows no badge, because "Complete" would be misleading there. File: `components/launch/product-information.tsx`.
3. **Same meaning everywhere.** The Studio view already shows "Not provided" as muted text and data errors as errors, and the Action Required list and weekly summary already count only mandatory gaps, so they needed no change. No status, completeness or SLA calculation changed.
4. **Guide and docs.** The product page description on How it works, the README test tables and the per-file test table now match. Files: `components/launch/guide-sections.tsx`, `lib/launch/guide-content.ts`, `README.md`.
5. **Tests.** Six new tests in `product-detail-view.test.tsx` cover the Missing badge, plain Not provided, no Missing when only optional fields are empty, the Data error badge on an optional field, Complete on a section with optional gaps and no badge on a section with no mandatory fields. The Little Acorn Wooden Play Kitchen (5678901) was checked in the browser on desktop and mobile. 437 automated tests pass across 34 files.

## Roadmap: later, not part of version 4

- Job ID, as an optional field entered by the studio when a product is ready to brief.
- Per-category or per-team views, once a lead is named for each category.
- A real export and a real weekly email. Both depend on data-governance approval.
- Commercial review. Commercial stays out until the prototype is further along.

## Validation

- The recording is being shared with the wider team. Ask for a lead for each category.
- Keep Commercial out of the next round, as suggested.

## Screens under test

- Products: the critical path summary (shown, hidden, counts, main and other dates), search by name, product ID, brand, range and critical path, every filter (range, brand, critical path, status, category, information), the Active, Launched and Dropped tabs, combined filters, the empty state, and clearing filters.
- Products, Studio view: the view switch in both roles, the Studio columns, Not provided and data errors, filters with chips and Clear all, Group by style, the hidden status cards, the critical path strip, and the CSV export (rows, file name and note).
- Products, weekly summary preview: the button in both roles, scope, subject and headline, the Needs attention lists, Changed this week, on track as a count only, linked Cat Nos, Copy text, the simulated send with its toast and notification, and that no status changes.
- Product page notes: the title and count, newest first, author, role and date, adding a note as each role, the 500-character limit and counter, empty notes refused, the permanent-log caption, reset, and that notes never change a status.
- All other screens are tested as in version 3.5: Overview, Action Required, the product page with its information form, the activity page, the app shell and the whole How it works page.

## Test tooling

- No new tools. Vitest with Testing Library covers screens and components, and Playwright covers the main journeys on a desktop and a mobile viewport. Run browser tests with `pnpm test:e2e`.

## Quality

- 437 automated tests across 34 files, all passing. The weekly summary adds 22: `weekly-summary.test.ts` 16 and `weekly-summary-dialog.test.tsx` 6. The Studio view adds 35: `studio.test.ts` 18 and `studio-view.test.tsx` 17. The Products view test grew from 10 to 25 tests for the filter bar, tabs and critical path summary, a new `critical-path.test.ts` adds 11, and the notes log adds 28 (`product-notes.test.ts` 6, `seed-notes.test.ts` 6, `product-notes.test.tsx` 11, plus 3 in the store reducer tests and 2 in the auth tests). The readiness model adds 77 across four new files: `working-days.test.ts` 13, `completeness.test.ts` 20, `sla.test.ts` 9 and `readiness-model.test.ts` 35.
- Browser tests (Playwright, run with `pnpm test:e2e`): 8 specs, 16 runs across a desktop and a mobile viewport.
- About 99 percent statement coverage of the business rules and auth (`lib/**`).

## Known limitations

- Prototype only. Not approved for deployment to production infrastructure.
- Data is synthetic and resets on refresh or when Reset demo data is chosen.
- No real sign-in or backend. The weekly summary send and its notification are simulated, and no email is ever sent.
- The At Risk definition is a placeholder.
- The critical path summary shows on Products only. The Overview cards still count every product.
- Ranges and critical paths are made-up demo values, not real season names for any retailer.
- Browser tests need Chromium installed (`pnpm exec playwright install chromium`) and are not run as part of `pnpm test`.
- Visual appearance is still checked by hand in the browser.

## What to check after upgrading

1. Open Products and confirm the filter bar shows Search, Range, Brand and Critical Path.
2. Choose a critical path such as AW26 PH2 and confirm the table, the tab counts and the "Showing X of Y" line all update.
3. Type a critical path name into the search box and confirm the same products appear.
4. Choose AW26 PH2 and confirm the summary strip shows its active lines, a main launch date and "+1 other date", and that the cards show that path's own counts. Clear the filter and confirm the strip disappears.
5. Open a product such as 1234567 and confirm a "Notes (2)" section sits above the information sections. Add a note, confirm it appears at the top with its role and time, then choose Reset demo data and confirm it is gone.
6. On Products, choose "Preview weekly summary", check the subject and headline, then choose "Send (simulated)" and confirm a toast appears and the bell in the header shows one notification.
7. Open How it works and confirm the top button says "Download the v4 change log (.md)", and that Change log history lists versions 3.5 and 3.
8. Run `pnpm test` and confirm every test passes.
