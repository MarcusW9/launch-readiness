# Launch Readiness: Version 3 change log

> Archived. This is the change log for version 3 as it shipped. It has been superseded by version 3.5 (tests and documentation) and then version 4 (search, filters and tabs on Products). See `Launch-Readiness-v4-Changelog.md` for the latest changes.

Launch Readiness is a portfolio prototype that tracks whether new products are ready to launch. All products, IDs and statuses are fictional (retailer: Northwind Home). The demo date is fixed at 10 Nov 2026.

Version 3 changes how the prototype is built and adds a small number of visible features. The product idea is unchanged: each product has the launch activities it needs, each activity needs certain information, and the activity statuses roll up into one readiness answer.

## Summary

| Area | Change |
| --- | --- |
| Interface | All screens rebuilt with Tailwind CSS and shadcn/ui. |
| Theme | New light and dark mode toggle in the header. |
| Information | Information is tracked separately from work, can be provided in place, and is filterable. |
| Data | All pages read products through one asynchronous repository. |
| Sign-in | Session and permissions architecture added. No login screen. |
| Guide | The How it works page is now a full screen-by-screen guide with screenshots. |
| Quality | 191 automated tests, about 99 percent coverage of business logic. |

## Interface

- The prototype installs from the public registry only.
- Rebuilt the shell, page frame, status pills, summary cards, tables, filters, steps, alerts, tooltips and forms on Tailwind CSS and shadcn/ui.
- Added small wrapper components so screens stay consistent: link-style buttons, labelled selects, labelled progress bars, info tips and status alerts.
- Colour is never the only signal. Every status pill carries an icon and a word.
- Tables fit a 966 px wide preview without clipping the Status column, and scroll sideways inside their own frame on narrow screens.
- Semantic design tokens in `globals.css` now drive every colour, for both themes.

## Theme

- Added a theme toggle (moon in light mode, sun in dark mode) at the far right of the header.
- The first visit follows the device setting. The choice is remembered afterwards.
- The page no longer flashes the wrong theme on load.

## Information model

- Each product page has an Information section listing what is Available, what is Missing and what is Not required for this product.
- Available items show where they came from: existing product data, or provided by the team.
- Missing items show their impact (which activity needs them) and a Provide button that opens a form in place. Save stays disabled until text is entered.
- Providing an item moves it to Available and updates counts, progress bars, requirement cards and the activity work state straight away.
- Activities can now be Unable to start (information missing) or Ready to start, so missing information is never confused with unfinished work.
- The Overview shows how many products are missing information and how many items are outstanding.
- Products with missing information show a line such as "2 information missing" in tables.
- The Products page has a new Information filter (Any information, or only products with missing information).

## Readiness and lifecycle

- Overall status is Ready, Action Required or At Risk. At Risk means work is outstanding and launch is within 10 days (placeholder rule, not yet agreed).
- Products that are Live, Offsale or Dropped are no longer being prepared. They stay in the Products table with a grey status, show Not applicable for activities, and are excluded from the overview counts and the Action Required page.
- Overview counts (Ready, Action Required, At Risk) always add up to Total Products.

## Data layer

- Added an asynchronous product repository. Pages and the store read products through it, never from the demo data directly.
- The root layout loads products on the server and passes them to the client store.
- The repository is the single place a real API or database would be connected. Connecting one needs Engineering and InfoSec approval. Nothing is connected today.

## Sign-in architecture (no sign-in)

- Added `lib/auth` with session types, a permission list, a mock provider, a server helper and a React session context.
- The header shows the demo user from the session. The Reset demo data button is gated by a permission check.
- There is deliberately no login screen, no real account and no cookies.
- Replacing the mock provider with a real identity provider is the intended extension point.

## How it works page

- Added a download button for this change log at the top of the page and in the version 3 section.
- Added a contents list, a plain-language version 3 summary, a description of the shared page layout, and a detailed tour of all five screens with screenshots and a numbered "what you see, from top to bottom" list for each.
- Added sections on providing missing information, work states, searching and filtering, light and dark mode, small screens, the architecture, and the test suite.
- Replaced the old Word guide download, which no longer existed, with this Markdown file.
- Screenshots live in `public/guide/`.

## Quality

- 191 automated tests across 10 files, all passing.
- About 99 percent statement coverage of `lib/launch`, with enforced thresholds of 95 percent statements, 90 percent branches, 95 percent functions and 95 percent lines.
- Tests cover readiness rules, activity applicability, filters, information tracking, copy, the store reducer, whole user journeys, every demo product, the repository seam and the demo session.

## Known limitations

- Prototype only. Not approved for deployment to production infrastructure.
- Data is synthetic and resets on refresh or when Reset demo data is chosen.
- No real sign-in, notifications or backend.
- The At Risk definition is a placeholder.

## What to check after upgrading

1. Open Overview and confirm the four cards add up (15 = 4 + 8 + 3).
2. Open the Little Acorn Wooden Play Kitchen and provide Sample availability. The item should move to Available.
3. Toggle dark mode and refresh. The choice should persist.
4. Open How it works and confirm the screenshots load.
5. Run `pnpm test` and `pnpm build`.
