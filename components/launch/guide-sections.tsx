import { ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadButton } from "@/components/launch/download-button";
import { GuideFigure, SeenFromTop } from "@/components/launch/guide-figure";
import { InfoCard, Section } from "@/components/launch/how-it-works-sections";
import { LinkButton } from "@/components/launch/link-button";
import { ARCHIVED_RELEASES, GUIDE_CONTENTS, LATEST_RELEASE, TEST_FILES, TEST_TOTALS } from "@/lib/launch/guide-content";

export function GuideContents() {
  return (
    <nav aria-label="On this page" className="rounded-lg border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">On this page</h2>
      <ol className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-1.5 p-0 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {GUIDE_CONTENTS.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`} className="text-primary underline-offset-4 hover:underline">
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

const V3_CHANGES = [
  {
    title: "A new, lighter interface",
    body: "Every screen is rebuilt with Tailwind CSS and shadcn/ui components, so the prototype installs and runs from the public registry alone.",
  },
  {
    title: "Light and dark mode",
    body: "A toggle at the top right of every page switches between a light and a dark theme. It follows your device setting the first time you visit and remembers your choice after that.",
  },
  {
    title: "Information as its own idea",
    body: "Products now show which pieces of information are available, which are missing and which do not apply, and you can provide a missing item without leaving the page. Missing information is flagged in tables, the overview and a new filter.",
  },
  {
    title: "A single source for product data",
    body: "Every page reads products through one asynchronous repository. Today it serves fictional demo data, and it is the one place a real data source would plug in later.",
  },
  {
    title: "Sign-in architecture, with no sign-in",
    body: "A session and permissions layer is in place and wired into the page header, but it only supplies a built-in demo user. There is deliberately no login screen yet.",
  },
  {
    title: "A proper test suite",
    body: "191 automated tests across 10 files protected the readiness rules, the filters, the information logic and the end-to-end journeys, with about 99 percent of the business logic covered.",
  },
];

const V35_CHANGES = [
  {
    title: "Every screen is tested",
    body: "Overview, Products, Action Required, the product page with its information form, and the activity page are now tested as a person would use them: reading the page, filtering, and providing missing information.",
  },
  {
    title: "Components and sign-in are tested",
    body: "The theme toggle, status pills, downloads, screenshots, the products table, the shared store and the demo session now have their own tests, and the sign-in seam is checked for unknown or missing users.",
  },
  {
    title: "Documentation that checks itself",
    body: "A test compares this guide, the README and the change log with the real project. If a test file, a count, a screenshot or a product ID drifts out of step, the build fails.",
  },
  {
    title: "A wording fix on Overview",
    body: "When exactly one product needs attention, the banner now reads \"1 product needs your attention\" instead of \"1 products\".",
  },
  {
    title: "Change log history",
    body: "This page now leads with the latest change log. Earlier versions are tucked away in an expandable history further down, and each can still be downloaded.",
  },
  {
    title: "A bigger, broader suite",
    body: "481 automated tests across 30 files, up from 191 across 10 in version 3.",
  },
];

const V4_CHANGES = [
  {
    title: "A filter bar on Products",
    body: "Products now opens with a search box and Range, Brand and Critical Path dropdowns, so teams can look at one season at a time. Products with no range or critical path sit under #N/A.",
  },
  {
    title: "Search finds critical paths",
    body: "Typing a critical path name such as AW26 PH2 into the search box finds the products in that season, as well as matching names, product IDs, brands and ranges.",
  },
  {
    title: "Active, Launched and Dropped tabs",
    body: "Three tabs sit under the filter bar, each with a count that respects the other filters. The line below reads, for example, \"Showing 22 of 22 active products\".",
  },
  {
    title: "A critical path summary",
    body: "Pick one critical path, in the filter or by searching for it, and a strip above the cards shows its active lines and main launch date. A tooltip lists any other dates. The cards recalculate for that path alone.",
  },
  {
    title: "The main screen stays simple",
    body: "Feedback was clear that the spreadsheet should not come back onto the main screen. The older detailed filters sit behind a More filters button, and extra detail belongs on the product page or in role views.",
  },
  {
    title: "A notes log on each product",
    body: "The product page has a Notes section above the information sections. Commercial / Range Planning and the Downstream team can both add notes of up to 500 characters. Notes show newest first with author, role and time, and cannot be edited or deleted. They never change a status.",
  },
  {
    title: "A Studio view with CSV export",
    body: "A switch above the Products table moves between the Exceptions view and a Studio view. The Studio table shows Active products with their style preference, image, cut out, lifestyle and video sources and components, with its own filters, a Group by style toggle and an Export to CSV button. It is a view, not a role, so edit rights do not change.",
  },
  {
    title: "A weekly summary email preview",
    body: "A Preview weekly summary button in the Exceptions view opens an email-style panel with at risk, information incomplete and on track counts, what needs attention and what changed this week. Copy the text or choose Send (simulated), which shows a toast and a notification. No email is sent. Job ID, per-category views and a real export and email are later.",
  },
  {
    title: "Tests kept in step",
    body: `${TEST_TOTALS.tests} automated tests across ${TEST_TOTALS.files} files, up from 481 across 30 in version 3.5. The Products screen now has 25 tests of its own.`,
  },
];

const ARCHIVE_HIGHLIGHTS: Record<string, readonly { title: string; body: string }[]> = {
  "3.5": V35_CHANGES,
  "3": V3_CHANGES,
};

export function WhatsNewInLatest() {
  return (
    <Section
      id="whats-new"
      title={`What is new in ${LATEST_RELEASE.label.toLowerCase()}`}
      intro="Version 4 is the first version shaped by feedback from a show-and-tell. So far it adds a filter bar, tabs and a critical path summary to Products. The change log is a work in progress and lists what is still to come."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {V4_CHANGES.map((change) => (
          <InfoCard key={change.title} title={change.title}>
            <p>{change.body}</p>
          </InfoCard>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <DownloadButton href={LATEST_RELEASE.href} fileName={LATEST_RELEASE.fileName}>
          Download the full v{LATEST_RELEASE.version} change log (.md)
        </DownloadButton>
        <p className="text-sm text-muted-foreground">
          A plain text Markdown file listing every change, grouped by area, with notes on what to check.
        </p>
      </div>
    </Section>
  );
}

export function ChangelogHistory() {
  return (
    <Section
      id="changelog-history"
      title="Change log history"
      intro="Earlier versions are kept here for reference. Open one to see a short summary, or download its full change log."
    >
      <div className="flex flex-col gap-3">
        {ARCHIVED_RELEASES.map((release) => (
          <details key={release.version} className="group rounded-lg border bg-card">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <ChevronRight
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold">{release.label}</span>
                <span className="text-sm text-muted-foreground">{release.headline}</span>
              </span>
              <span className="ml-auto shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                Archived
              </span>
            </summary>
            <div className="flex flex-col gap-4 border-t p-4">
              <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
                {(ARCHIVE_HIGHLIGHTS[release.version] ?? []).map((change) => (
                  <li key={change.title} className="text-sm">
                    <p className="font-medium">{change.title}</p>
                    <p className="text-muted-foreground">{change.body}</p>
                  </li>
                ))}
              </ul>
              <div>
                <DownloadButton href={release.href} fileName={release.fileName} variant="outline" size="sm">
                  Download the {release.label.toLowerCase()} change log (.md)
                </DownloadButton>
              </div>
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function PageAnatomy() {
  return (
    <Section
      id="page-layout"
      title="How every page is laid out"
      intro="Every screen shares the same frame, so once you know it you know where to look on all of them."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GuideFigure
          src="/guide/overview.png"
          width={1280}
          height={800}
          alt="The Overview page in light mode, showing the navigation bar, a blue demo strip and the first summary cards."
          caption="The shared frame, shown on the Overview page in light mode."
        />
        <SeenFromTop
          items={[
            <>
              <strong>Navigation bar.</strong> On the left, the name Launch Readiness with the fictional retailer
              Northwind Home beside it. Next to that are four links: Overview, Products, Action Required with the
              number of products needing action in brackets, and How it works. The page you are on has a tinted
              background. On the far right sits the name of the demo user and the theme toggle, a small moon or sun
              icon.
            </>,
            <>
              <strong>Prototype strip.</strong> A pale blue band reading &quot;Portfolio prototype using synthetic
              demo data. Demo date: 10 Nov 2026.&quot; On its right is a Reset demo data button that puts every
              product back to its starting point.
            </>,
            <>
              <strong>Page content.</strong> A large title, a one-line description, then the content of that screen.
              Pages with a parent show a breadcrumb trail above the title, such as Overview, Products, then the
              product name.
            </>,
            <>
              <strong>Footer.</strong> Links to How it works and About this prototype, followed by a reminder that
              all data is fictional.
            </>,
          ]}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        The demo date is fixed at 10 Nov 2026 so the sample launch dates never go out of date. Phrases such as
        &quot;in 4 days&quot; are counted from that date.
      </p>
    </Section>
  );
}

export function OverviewTour() {
  return (
    <Section
      id="overview-screen"
      title="Screen 1: Overview"
      intro="Your starting point. It answers one question: how are we doing overall, and what needs me first?"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SeenFromTop
          items={[
            <>
              <strong>Title and description:</strong> &quot;Product Launch Readiness&quot;, with a line saying you can
              track upcoming products and see where action is required.
            </>,
            <>
              <strong>Four summary cards in a row.</strong> Each has a small coloured dot, a label, a big number and a
              short explanation. Total Products is 15 (those still being prepared for launch). Ready is 4 (green dot, all
              required activities complete). Action Required is 8 (amber dot). At Risk is 3 (red dot, outstanding work
              and launching within 10 days). These three always add up to the total.
            </>,
            <>
              <strong>An amber notice:</strong> &quot;11 products need your attention&quot;, with a link to see what is
              holding each one back. That is the 8 plus the 3.
            </>,
            <>
              <strong>A blue notice:</strong> &quot;6 products are missing required information&quot;, noting that 14
              pieces of information still need someone to provide them, with a link to those products.
            </>,
            <>
              <strong>Most urgent launches.</strong> A heading with a View all products button, then a table of the
              products launching soonest. Columns are Product (with its ID underneath), Category, Launch date (with a
              countdown), Imagery, Content, Variants, Compliance and Status. Each activity cell shows an icon and a word
              such as Complete, In Progress or Blocked.
            </>,
          ]}
        />
        <GuideFigure
          src="/guide/overview.png"
          width={1280}
          height={800}
          alt="Overview page: four summary cards (15 total, 4 ready, 8 action required, 3 at risk), an amber and a blue notice, and the start of the most urgent launches table."
          caption="The Overview page. The urgent launches table continues below the first screen."
        />
      </div>
      <p>
        <strong>What to do here:</strong> read the four cards for the big picture, follow the amber notice to start
        fixing the riskiest products, or follow the blue notice if your job is supplying missing information.
      </p>
      <div>
        <LinkButton href="/" variant="outline" size="sm">
          Open the overview
          <ChevronRight aria-hidden />
        </LinkButton>
      </div>
    </Section>
  );
}

export function ProductsTour() {
  return (
    <Section
      id="products-screen"
      title="Screen 2: Products"
      intro="Every product in one table, with search and filters to narrow it down."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GuideFigure
          src="/guide/products.png"
          width={1280}
          height={800}
          alt="Products page with a search box, five filter drop-downs and the start of a table of 18 products."
          caption="The Products page before any search or filter is applied."
        />
        <SeenFromTop
          items={[
            <>
              <strong>Title and description:</strong> &quot;Products&quot;, explaining that products are listed with the
              most urgent first.
            </>,
            <>
              <strong>Search box.</strong> A full-width field labelled Search products, with a magnifying glass and the
              hint &quot;Search by name, product ID or brand&quot;.
            </>,
            <>
              <strong>Five drop-down filters</strong> laid out in a grid: Category, Status, Launch date, Outstanding work
              and Information. Each starts on its &quot;all&quot; choice, such as All categories.
            </>,
            <>
              <strong>A result count:</strong> &quot;Showing 18 of 18 products&quot;. It updates as you filter.
            </>,
            <>
              <strong>The table.</strong> The same columns as the Overview. A product with missing information shows a
              small warning line under its status, such as &quot;2 information missing&quot;. Product names are links
              to the product page.
            </>,
          ]}
        />
      </div>
      <p>
        Products that are no longer being prepared appear here too, with a grey status of Live, Offsale or Dropped
        instead of a readiness status. Their activity cells read Not applicable because there is no work left to do.
      </p>
      <div>
        <LinkButton href="/products" variant="outline" size="sm">
          Open products
          <ChevronRight aria-hidden />
        </LinkButton>
      </div>
    </Section>
  );
}

export function ActionRequiredTour() {
  return (
    <Section
      id="action-screen"
      title="Screen 3: Action Required"
      intro="Only the products that are not ready, most urgent first. This is the page to work through each morning."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SeenFromTop
          items={[
            <>
              <strong>Title and description:</strong> &quot;What do you need to worry about?&quot;
            </>,
            <>
              <strong>Groups.</strong> Products are grouped under a coloured status label with a count, for example the
              red At Risk label followed by &quot;3 products&quot;. The Action Required group follows below it.
            </>,
            <>
              <strong>One card per product.</strong> The product name on the left and its status label on the right,
              then a line such as &quot;Launch: 14 Nov (in 4 days) · ID 5678901&quot;.
            </>,
            <>
              <strong>Work outstanding.</strong> Inside each card, a list of grey rows. Each row describes one problem in
              plain words, for example &quot;Studio Imagery blocked: Waiting on samples&quot;. Under it is who needs to
              act, such as &quot;Needed from: Studio team&quot;, and on the right the activity&apos;s status.
            </>,
            <>
              <strong>View product.</strong> A button at the bottom of the card opens the product page.
            </>,
          ]}
        />
        <GuideFigure
          src="/guide/action-required.png"
          width={1280}
          height={800}
          alt="Action Required page showing an At Risk group with cards for Hearthwell Fairy Light Curtain and Little Acorn Wooden Play Kitchen, each listing the work outstanding."
          caption="The Action Required page. More groups and cards continue below."
        />
      </div>
      <p>
        The number in the navigation bar, Action Required (11), is the same count. As products are finished it goes
        down, and a finished product drops off this page.
      </p>
      <div>
        <LinkButton href="/action-required" variant="outline" size="sm">
          Open action required
          <ChevronRight aria-hidden />
        </LinkButton>
      </div>
    </Section>
  );
}

export function ProductPageTour() {
  return (
    <Section
      id="product-screen"
      title="Screen 4: A product page"
      intro="One product in detail. It tells you what is stopping it, what we know, what we still need and what work applies."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GuideFigure
          src="/guide/product-page.png"
          width={1280}
          height={3643}
          scrollable
          alt="Full product page for the Little Acorn Wooden Play Kitchen: a red blocker notice, a Notes section, an Information section with available and missing items, a Requirements list, and a product summary and progress panel on the right."
          caption="The full product page for the Little Acorn Wooden Play Kitchen."
        />
        <SeenFromTop
          items={[
            <>
              <strong>Breadcrumb and title.</strong> Overview, Products, then the product name as a large heading.
            </>,
            <>
              <strong>Status line.</strong> The status label, such as At Risk, then &quot;Launch date: 14 Nov 2026 (in 4
              days)&quot;.
            </>,
            <>
              <strong>A coloured notice</strong> titled &quot;What is stopping this product from being ready?&quot; listing
              each problem as a link. The colour matches the status, red for At Risk. If the product is ready, a green
              notice says so instead.
            </>,
            <>
              <strong>Notes (left).</strong> A &quot;Notes (n)&quot; log, newest first, above the information sections.
              Each note shows its text, author, role and date and time. Commercial / Range Planning and the Downstream
              team can both add a note of up to 500 characters. Notes can&apos;t be edited or deleted, and they never
              change a status, the completeness figures or the SLA.
            </>,
            <>
              <strong>Information section (left).</strong> A sentence such as &quot;10 of 12 pieces of required
              information are available. 2 still need someone to provide them.&quot; Beneath it are two columns:
              Available and Missing. A third group lower down is Not required for this product.
            </>,
            <>
              <strong>Requirements section (left, below).</strong> One card for each of the six launch activities.
              Activities that do not apply are shown greyed with the reason.
            </>,
            <>
              <strong>Product summary (right).</strong> A card with rows for Product ID, Brand, Category, Launch date, Own
              brand, Imagery, Variants and Compliance.
            </>,
            <>
              <strong>Progress (right).</strong> Two thin bars: required activities complete, and required information
              available.
            </>,
          ]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="Available information">
          <p>
            Each item shows its name in green with a tick, its value, and where it came from: either &quot;Existing
            product data&quot; or &quot;Provided by the team&quot;.
          </p>
        </InfoCard>
        <InfoCard title="Missing information">
          <p>
            Each missing item is a small card with an amber warning, an Impact line saying which activity needs it, and
            a button to provide it.
          </p>
        </InfoCard>
        <InfoCard title="Requirement cards">
          <p>
            Every card shows the activity name and status, then why it applies, how much information is ready, any
            missing items, the next action and the owning team. Select a card to open the activity.
          </p>
        </InfoCard>
      </div>
    </Section>
  );
}

const FILTERS = [
  { name: "Search products", values: "Type part of a product name, a product ID or a brand. Matching is not case sensitive." },
  { name: "Category", values: "All categories, or one category such as Toys, Furniture or Home textiles." },
  { name: "Status", values: "All statuses, or Ready, Action Required, At Risk, Live, Dropped or Offsale." },
  {
    name: "Launch date",
    values: "Any launch date, Next 7 days, Next 14 days, Next 30 days or More than 30 days away.",
  },
  {
    name: "Outstanding work",
    values: "Any activity, or only products with Imagery, Content, Variants, Compliance or Product Setup outstanding.",
  },
  { name: "Information", values: "Any information, or only products that have missing information." },
] as const;

export function SearchAndFilter() {
  return (
    <Section
      id="search-and-filter"
      title="Searching and filtering products"
      intro="Filters combine, so you can narrow down in steps. Everything updates as you choose."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GuideFigure
          src="/guide/products-filtered.png"
          width={1280}
          height={800}
          alt="Products page after typing little in the search box: the Active tab shows 2, Launched shows 0 and Dropped shows 1, the count reads Showing 2 of 15 active products, and two Little Acorn products are listed."
          caption="Typing little in the search box leaves three Little Acorn products across the tabs."
        />
        <div className="flex flex-col gap-3">
          <p>
            In the picture, the word little has been typed. The tabs now read Active (2), Launched (0) and Dropped (1),
            and the count under the filters reads &quot;Showing 2 of 15 active products&quot;. A small cross appears at
            the right end of the search box to clear it, and a Clear all filters link appears under the filters.
          </p>
          <p>
            Notice that one active match is Ready (green) and the other is At Risk with two pieces of information missing.
            The third match is Dropped (grey), with every activity marked Not applicable, so it sits on the Dropped tab.
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Control</TableHead>
              <TableHead>Choices</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FILTERS.map((filter) => (
              <TableRow key={filter.name}>
                <TableCell className="font-medium whitespace-nowrap">{filter.name}</TableCell>
                <TableCell className="whitespace-normal">{filter.values}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  );
}

export function ThemeAndDevices() {
  return (
    <Section
      id="theme-and-devices"
      title="Light mode, dark mode and small screens"
      intro="The prototype adapts to how and where you read it."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <GuideFigure
          src="/guide/overview-dark.png"
          width={1280}
          height={800}
          alt="The Overview page in dark mode: a near-black background with light text, and the same cards and notices in softer colours."
          caption="The same Overview page in dark mode."
        />
        <GuideFigure
          src="/guide/overview-mobile.png"
          width={390}
          height={844}
          alt="The Overview page on a phone: navigation links wrap onto two lines and the summary cards stack one above another."
          caption="On a phone the cards stack into one column."
        />
      </div>
      <ul className="m-0 flex list-disc flex-col gap-2 pl-5 leading-relaxed">
        <li>
          <strong>Theme toggle.</strong> The round icon button at the far right of the navigation bar shows a moon in
          light mode and a sun in dark mode. Press it to switch. The first time you visit, it matches your device
          setting. After that it remembers your choice.
        </li>
        <li>
          <strong>Colour is never the only signal.</strong> Every status pill also carries an icon and a word, so the
          meaning survives for people who cannot tell red from green.
        </li>
        <li>
          <strong>Small screens.</strong> The navigation links wrap onto a second line, cards stack into one column and
          wide tables scroll sideways inside their own frame instead of breaking the page.
        </li>
      </ul>
    </Section>
  );
}

export function UnderTheHood() {
  return (
    <Section
      id="under-the-hood"
      title="Under the hood, for the people who will build on this"
      intro="You do not need this section to use the prototype. It explains how the pieces are arranged so engineering can extend it safely."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="Data comes through one door">
          <p>
            Pages never read the demo data directly. They ask a product repository, which is asynchronous so a real API
            or database can replace it later. Only that one setting needs to change, not the screens.
          </p>
          <p className="text-sm text-muted-foreground">
            Connecting a real source needs Engineering and InfoSec approval. Nothing is connected today.
          </p>
        </InfoCard>
        <InfoCard title="Sign-in has a place, but is off">
          <p>
            A session provider and a short list of permissions, such as being allowed to reset the demo data, are built
            in. A built-in demo user fills the gap. A real identity provider would replace that one provider.
          </p>
          <p className="text-sm text-muted-foreground">There is no login screen and no real account.</p>
        </InfoCard>
        <InfoCard title="Rules live apart from screens">
          <p>
            Readiness, activity rules, information tracking, filters and the next-action wording are plain functions
            with no screen code in them. That is why they can be tested thoroughly and reused.
          </p>
        </InfoCard>
      </div>
    </Section>
  );
}

export function TestsGuide() {
  return (
    <Section
      id="tests"
      title="How we know it works"
      intro={`${TEST_TOTALS.tests} automated tests run in about a second and all pass. They check the business rules rather than how pages look.`}
    >
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test file</TableHead>
              <TableHead className="text-right">Tests</TableHead>
              <TableHead>What it protects</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TEST_FILES.map((file) => (
              <TableRow key={file.file}>
                <TableCell className="font-mono text-xs whitespace-nowrap">{file.file}</TableCell>
                <TableCell className="text-right tabular-nums">{file.tests}</TableCell>
                <TableCell className="whitespace-normal">{file.protects}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        Coverage of the business rules is about {TEST_TOTALS.coverage} percent of statements, and the build fails if it
        drops below 95 percent.
      </p>
    </Section>
  );
}
