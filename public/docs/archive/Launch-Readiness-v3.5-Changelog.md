# Launch Readiness: Version 3.5 change log

> Archived. This is the change log for version 3.5 as it shipped. It has been superseded by version 4, which adds search, filters and tabs to the Products screen. See `Launch-Readiness-v4-Changelog.md` for the latest changes.

Launch Readiness is a portfolio prototype that tracks whether new products are ready to launch. All products, IDs and statuses are fictional (retailer: Northwind Home). The demo date is fixed at 10 Nov 2026.

Version 3.5 builds on version 3 without changing how the product behaves, apart from one wording fix. It makes the prototype safer to change by testing every screen and by keeping the documentation in step with the code. It also adds a change log history to the How it works page.

Everything in version 3 still applies. Its change log is archived and can still be downloaded: `Launch-Readiness-v3-Changelog.md`.

## Summary

| Area | Change |
| --- | --- |
| Screens | Overview, Products, Action Required, the product page with its information form, and the activity page are all tested through the rendered page. |
| Components | Theme toggle, status pills, downloads, screenshots, products table, shared store and demo session now have their own tests. |
| Sign-in seam | Auth tests cover unknown and missing users, permissions and the server helper. |
| Documentation | A test compares the guide, README and change log with the real project, so they cannot drift. |
| Wording | Overview now says "1 product needs your attention" when exactly one product needs attention. |
| Change logs | How it works leads with the latest change log. Older versions sit in an expandable history and can still be downloaded. |
| Quality | 481 automated tests across 30 files (up from 191 across 10 in version 3), plus browser tests of the main journeys on desktop and mobile. |

## Screens under test

- Overview: the four summary cards add up to the total, the attention banner uses the right wording for zero, one and many products, launched products are excluded from the counts, and the links go to the right places.
- Products: search by name, product ID and brand, every filter (status, brand, category, information), combined filters, the empty state, and clearing filters.
- Action Required: only products that need action appear, each shows the next action, and products with missing information show their count.
- Product page: the readiness summary, the Information section (Available, Missing, Not required), and providing a missing item in place. Save stays disabled until text is entered, and saving moves the item to Available and updates the counts.
- Activity page: the workflow stages, the work state and the information card, including the Unable to start and Ready to start states.

These tests render each screen with controlled products rather than the demo data, so a change to the demo data cannot hide a broken screen.

## Components and sign-in under test

- Theme toggle: shows the right icon and label for each theme, and switches the theme when pressed.
- Status pills: every status has an icon and a word, so colour is never the only signal.
- Download button and guide figure: correct link, file name and image description.
- Products table: columns, links, the missing-information line and the empty state.
- Store: the provider wiring, notes, providing information, and resetting demo data.
- Session: the demo user, permissions, and the reset action being hidden without permission.
- Auth: unknown and missing users, the permission list, and the mock provider.

## Documentation that checks itself

- The list of test files and counts on the How it works page, in the README and in this change log is compared with the real files by `lib/launch/docs-consistency.test.ts`.
- The same test checks that the screenshots exist, that product IDs mentioned in the guide are real, and that every downloadable change log exists, is a Markdown file, and is listed in the README.
- Adding a test file without documenting it now fails the build.

## Wording fix

- Overview: the banner now reads "1 product needs your attention" for one product, "N products need your attention" for several, and "Nothing needs attention" for none. Previously it read "1 products".

## Change log history

- The How it works page now leads with the version 3.5 change log: a download button at the top, a "What is new in version 3.5" section and a "Past versions" link.
- A new Change log history section at the bottom lists earlier versions. Each is collapsed by default, shows a short summary when opened, and has its own download button.
- Version 3's change log moved to `public/docs/archive/` and is marked as archived. Its content is as it shipped, including its original test counts.
- Releases are defined once in `lib/launch/guide-content.ts`, so adding a future version means adding one entry and one file.

## Test tooling

- Vitest now runs component tests in a browser-like DOM (jsdom) alongside the existing logic tests in plain Node. A test opts in with a `// @vitest-environment jsdom` comment on its first line.
- Added Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`) and `jsdom` as development dependencies, plus a small setup file.
- Coverage now includes `components/launch`, not just `lib`. The enforced thresholds still apply to `lib/**`: 95 percent statements, 90 percent branches, 95 percent functions and 95 percent lines.
- A shared render helper in `lib/launch/testing/render.tsx` wraps screens with the store and session they need.
- Added Playwright (`@playwright/test`) for browser tests. Eight specs in `e2e/` run on a desktop and a mobile viewport (16 runs) with `pnpm test:e2e`. Set `E2E_BASE_URL` to test an already running server.
- Vitest now also picks up tests under `app/`, so route pages such as How it works can be tested.

## Quality

- 481 automated tests across 30 files, all passing, including the app shell (navigation, live Action Required count and who can reset the demo data) and the whole How it works page.
- Browser tests (Playwright, run with `pnpm test:e2e`): 8 specs, 16 runs across a desktop and a mobile viewport. They cover moving between pages, providing missing information (save and cancel), the activity workflow and resetting the demo data.
- About 99 percent statement coverage of the business rules and auth (`lib/**`).
- About 96 percent statement coverage of components. The five screens, the app shell and the How it works page are tested through the rendered page.

## Known limitations

- Prototype only. Not approved for deployment to production infrastructure.
- Data is synthetic and resets on refresh or when Reset demo data is chosen.
- No real sign-in, notifications or backend.
- The At Risk definition is a placeholder.
- Parts of the filter bar and the Products table are not yet covered by component tests.
- Browser tests need Chromium installed (`pnpm exec playwright install chromium`) and are not run as part of `pnpm test`.
- Visual appearance is still checked by hand in the browser.

## What to check after upgrading

1. Open How it works and confirm the top button says "Download the v3.5 change log (.md)".
2. Scroll to the bottom and open Change log history. Version 3 should be collapsed, open on click, and download its own file.
3. Open Overview and confirm the four cards add up (15 = 4 + 8 + 3).
4. Run `pnpm test` and confirm every test passes.
