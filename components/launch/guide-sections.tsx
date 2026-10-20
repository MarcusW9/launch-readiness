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
    body: "Overview, Products, Action Required, and the product page with its information form are now tested as a person would use them: reading the page, filtering, and providing missing information.",
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
    body: "Three tabs sit under the filter bar, each with a count that respects the other filters. The line below reads, for example, \"Showing 16 of 16 active products\".",
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
          alt="The Overview page in light mode. The navigation bar has the four page links, a Remind Commercial button, the Downstream team and Commercial / Range Planning role switch, a notifications bell and the theme toggle. Below it are the blue demo strip and the first status cards."
          caption="The shared frame, shown on the Overview page in light mode."
        />
        <SeenFromTop
          items={[
            <>
              <strong>Navigation bar.</strong> On the left, the name Launch Readiness with the fictional retailer
              Northwind Home beside it. Next to that are four links: Overview, Products, Action Required with the
              number of products needing action in brackets, and How it works. The page you are on has a tinted
              background.
            </>,
            <>
              <strong>Role and tools.</strong> On the right sit the Remind Commercial button, a two-way switch between
              the Downstream team and Commercial / Range Planning roles, a notifications bell and the theme toggle, a
              small moon or sun icon.
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
        &quot;launch in 4 working days&quot; are counted from that date, skipping weekends.
      </p>
    </Section>
  );
}

export function OverviewTour() {
  return (
    <Section
      id="overview-screen"
      title="Screen 1: Overview"
      intro="Your starting point. It answers one question: will each product be ready in time, and what needs me first?"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SeenFromTop
          items={[
            <>
              <strong>Title and description:</strong> &quot;Product Launch Readiness&quot;, with a line saying you can
              track upcoming products, understand launch readiness and see where action is required.
            </>,
            <>
              <strong>Four cards in a row.</strong> Each has a small coloured dot, a label, a big number and a short
              explanation. Total Products is 16, the products still being prepared for launch. Then three status
              cards that add up to that total: At Risk is 3 (red dot, projected to be ready after the launch date),
              Information Incomplete is 3 (amber dot, mandatory information still missing) and On Track is 10 (green
              dot, projected to be ready in time). Each card links to the Products screen filtered to that status.
            </>,
            <>
              <strong>An amber notice:</strong> &quot;6 products need your attention&quot;, saying how many are at risk
              and how many are waiting on mandatory information, with a link to see what is holding each one back.
              That is the 3 plus the 3.
            </>,
            <>
              <strong>Most urgent launches.</strong> A heading with a View all products button, then a table of the
              products launching soonest. Columns are Cat No., Product, PIM Date, Stock Ready Date, Proposed Launch
              Date (with a countdown in working days), SLA Projection Date, Additional Checks and Status.
            </>,
            <>
              <strong>Mandatory information.</strong> Further down, a short panel showing how many mandatory fields
              are complete across all products, because the SLA only starts once every mandatory field is in.
            </>,
          ]}
        />
        <GuideFigure
          src="/guide/overview.png"
          width={1280}
          height={800}
          alt="Overview page: four cards (16 total products, 3 At Risk, 3 Information Incomplete, 10 On Track), an amber notice saying 6 products need attention, and the start of the most urgent launches table with its eight columns."
          caption="The Overview page. The urgent launches table continues below the first screen."
        />
      </div>
      <p>
        <strong>Picking one critical path.</strong> When you choose a critical path on the Products screen, or search
        for its name, a strip appears above the cards. It shows that path&apos;s active lines and main launch date, the
        three status cards for that path alone, and an Also flagged row with two counts: Date Changed and Stock lands
        after launch. Flags are information only. They never change a status.
      </p>
      <p>
        <strong>What to do here:</strong> read the status cards for the big picture, then follow the amber notice to
        see what is holding back each product that is At Risk or Information Incomplete.
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

const PRODUCT_COLUMNS = [
  { name: "Cat No.", meaning: "The product's seven-digit catalogue number." },
  { name: "Product", meaning: "The product name, linked to its product page, with the brand underneath." },
  {
    name: "PIM Date",
    meaning: "The date the product was entered in the product information system. It is when the SLA clock could first start.",
  },
  {
    name: "Stock Ready Date",
    meaning:
      "When stock is expected to be ready. It feeds the Stock lands after launch flag and the product timeline, but never the SLA or the status.",
  },
  { name: "Proposed Launch Date", meaning: "The launch date Commercial has proposed, with a countdown in working days." },
  {
    name: "SLA Projection Date",
    meaning:
      "The date the product is projected to be ready: the day mandatory information was completed plus the SLA in working days. It reads Not started until every mandatory field is complete.",
  },
  {
    name: "Additional Checks",
    meaning: "Flags that sit beside the status without changing it: Date Changed, Stock lands after launch and Data error.",
  },
  {
    name: "Status",
    meaning: "Expectation At Risk, Information Incomplete or On Track. At Risk also says how many working days late the projection is.",
  },
] as const;

export function ProductsTour() {
  return (
    <Section
      id="products-screen"
      title="Screen 2: Products"
      intro="Every product approaching launch in one table, with search and filters to narrow it down."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GuideFigure
          src="/guide/products.png"
          width={1280}
          height={800}
          alt="Products page with an Exceptions view and Studio view switch, a search box, Range, Brand and Critical path filters, a More filters button, the Active, Launched and Dropped tabs and the start of the table."
          caption="The Products page before any search or filter is applied."
        />
        <SeenFromTop
          items={[
            <>
              <strong>Title and description:</strong> &quot;Products&quot;, explaining that At Risk products come
              first, then Information Incomplete, then On Track.
            </>,
            <>
              <strong>View switch.</strong> Exceptions view is the default. Studio view is described further down.
            </>,
            <>
              <strong>Filter bar.</strong> A search box (&quot;Search title, Cat No or critical path&quot;) and three
              drop-downs: Range, Brand and Critical path. A More filters button reveals Category, Status, Launch date
              and Flag.
            </>,
            <>
              <strong>Tabs and count.</strong> Active, Launched and Dropped, each with a count, then a line such as
              &quot;Showing 16 of 16 active products&quot;. A Preview weekly summary button sits at the right.
            </>,
            <>
              <strong>The table.</strong> Eight columns, listed below. A product that is Information Incomplete shows
              how many fields are missing under its status.
            </>,
          ]}
        />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead>What it shows</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRODUCT_COLUMNS.map((column) => (
              <TableRow key={column.name}>
                <TableCell className="font-medium whitespace-nowrap">{column.name}</TableCell>
                <TableCell className="whitespace-normal">{column.meaning}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p>
        Products that have launched or been dropped sit on their own tabs, and their status column shows that
        lifecycle instead of a readiness status, because there is no launch left to protect.
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
      intro="Exceptions only: the products that are At Risk or Information Incomplete, most urgent first. On Track products never appear here."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SeenFromTop
          items={[
            <>
              <strong>Title and description:</strong> &quot;What do you need to worry about?&quot;, noting that products
              are ordered by urgency with what is holding each one back.
            </>,
            <>
              <strong>Groups.</strong> Products are grouped under a status heading with a count, for example
              Expectation At Risk (3), followed by Information Incomplete.
            </>,
            <>
              <strong>One card per product.</strong> The product name on the left and its status label on the right,
              then a line such as &quot;Launch: 16 Nov (launch in 4 working days) · ID 4567890&quot;.
            </>,
            <>
              <strong>The cause, in one sentence.</strong> For an At Risk product it says where the SLA projection
              lands and by how many working days it misses the proposed launch. For an Information Incomplete product
              it names the missing mandatory fields and when they were needed by.
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
          alt="Action Required page showing an Expectation At Risk group of three, with cards for the Hearthwell Ceramic Dinner Set 12pc, the Oakline Oslo Sofa and the Oakline Fold-Away Guest Bed. Each card gives a one-sentence cause and a View product button."
          caption="The Action Required page. The Information Incomplete group continues below."
        />
      </div>
      <p>
        The number in the navigation bar, Action Required (6), is the same count. When a product&apos;s mandatory
        information is completed, or its launch date is moved far enough out, it becomes On Track and drops off this
        page.
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
      intro="One product in detail. It tells you why it has its status, where each date falls, what information is in and what is still missing."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GuideFigure
          src="/guide/product-page.png"
          width={1280}
          height={1530}
          scrollable
          alt="Full product page for the Little Acorn Wooden Play Kitchen: an Information Incomplete status with a Stock lands after launch flag, a Why this status banner, a five-step date timeline, the Product information sections with missing mandatory fields, a Notes log, and a product summary on the right."
          caption="The full product page for the Little Acorn Wooden Play Kitchen."
        />
        <SeenFromTop
          items={[
            <>
              <strong>Breadcrumb and title.</strong> Overview, Products, then the product name as a large heading.
            </>,
            <>
              <strong>Status line.</strong> The status label, any flags such as Stock lands after launch, a countdown
              such as &quot;Launch in 4 working days&quot;, and the proposed launch date. Commercial / Range Planning
              also sees a Change launch date button here.
            </>,
            <>
              <strong>Cause banner.</strong> A coloured notice titled Why this status, in one sentence. Amber for
              Information Incomplete, red for At Risk. It names the missing mandatory fields, or says how many working
              days the SLA projection lands after the proposed launch.
            </>,
            <>
              <strong>Timeline.</strong> Five dated steps in a row: Entered in PIM, Information complete (SLA starts),
              SLA projection, Proposed launch and Stock ready. Each shows its date, or Not started, and a state such as
              Done, Waiting, Planned or Late. Stock ready is shown for context only.
            </>,
            <>
              <strong>Product information (left).</strong> A line such as &quot;11 of 13 mandatory fields complete.&quot;
              Fields are grouped into sections, for example Product identity, Supplier, Variants and setup, and
              Photography and digital. A complete section collapses to one line. A section with gaps lists each field,
              marked mandatory or not, with a Missing label where it is empty.
            </>,
            <>
              <strong>Notes (right).</strong> A &quot;Notes (n)&quot; log, newest first. Each note shows its text,
              author, role and date and time. Both roles can add a note of up to 500 characters. Notes can&apos;t be
              edited or deleted, and they never change a status or the SLA.
            </>,
            <>
              <strong>Product summary (right).</strong> A card with Cat No., Brand, Category, Launch date and the SLA in
              working days.
            </>,
          ]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard title="Why the SLA has not started">
          <p>
            The SLA only starts on the day the last mandatory field is completed. Until then the timeline shows
            Information complete and SLA projection as Not started.
          </p>
        </InfoCard>
        <InfoCard title="Stock Ready Date">
          <p>
            The Stock ready step and the Stock lands after launch flag show when stock arrives relative to launch.
            They are for planning only and never move the SLA projection or the status.
          </p>
        </InfoCard>
        <InfoCard title="Data error">
          <p>
            A product whose dates cannot be read shows a Data error flag and #N/A in the affected column instead of a
            guess. The Little Acorn Remote Control Racing Car is seeded as a deliberate example.
          </p>
        </InfoCard>
      </div>
    </Section>
  );
}

export function RolesGuide() {
  return (
    <Section
      id="roles-and-reminders"
      title="Two roles, and Remind Commercial"
      intro="The switch in the navigation bar changes who you are in the demo. Everyone sees the same products and statuses. Only what you can change differs."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCard title="Downstream team">
          <p>
            Reads everything and adds notes. Mandatory fields and the launch date are read-only. Downstream also has
            the Remind Commercial button, because it is the team waiting on the information.
          </p>
        </InfoCard>
        <InfoCard title="Commercial / Range Planning">
          <p>
            Owns the product information. On a product page, Commercial can fill in missing mandatory fields and use
            Change launch date to propose a new date. Completing the last mandatory field starts the SLA and the
            status recalculates straight away.
          </p>
        </InfoCard>
      </div>
      <p>
        <strong>Remind Commercial.</strong> The button in the navigation bar shows how many products still have missing
        mandatory information, for example Remind Commercial (3). Pressing it asks you to confirm, then sends one
        simulated email to Commercial / Range Planning listing those products, and shows a toast and a notification.
        No email is sent. The notifications bell collects these messages, along with the weekly summary.
      </p>
    </Section>
  );
}

export function StudioAndSummary() {
  return (
    <Section
      id="studio-and-summary"
      title="Studio view and the weekly summary"
      intro="Two extras on the Products screen, for teams who need something other than the exceptions list."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCard title="Studio view">
          <p>
            Switch from Exceptions view to Studio view above the filters. The table lists Active products with their
            style preference, image, cut out, lifestyle and video sources and components. It has its own filters, a
            Group by style toggle and an Export to CSV button. It is a view, not a role, so nobody&apos;s edit rights
            change.
          </p>
        </InfoCard>
        <InfoCard title="Weekly summary">
          <p>
            Preview weekly summary opens an email-style panel. You choose who it goes to, and it shows the counts of
            At Risk, Information Incomplete and On Track products, what needs attention, information needed soon, and
            what changed this week: launch dates moved and products whose stock lands after launch. Copy the text, or
            choose Send (simulated). Nothing is emailed.
          </p>
        </InfoCard>
      </div>
    </Section>
  );
}

const FILTERS = [
  { name: "Search products", values: "Type part of a product name, a Cat No. or a critical path such as AW26 PH2. Matching is not case sensitive." },
  { name: "Range", values: "All ranges, or one range. Products with no range sit under #N/A." },
  { name: "Brand", values: "All brands, or one brand." },
  {
    name: "Critical path",
    values: "All critical paths, or one season. Choosing one adds the critical path summary strip to the Overview and the Products screens.",
  },
  { name: "Category (More filters)", values: "All categories, or one category such as Toys, Furniture or Home textiles." },
  { name: "Status (More filters)", values: "All statuses, or Expectation At Risk, Information Incomplete or On Track." },
  { name: "Launch date (More filters)", values: "Any launch date, or a window such as the next 7 or 30 days." },
  { name: "Flag (More filters)", values: "Any, or only products flagged Date Changed, Stock lands after launch or Data error." },
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
          alt="Products page after typing little in the search box: the Active tab shows 2, Launched 0 and Dropped 1, the count reads Showing 2 of 16 active products, and two Little Acorn products are listed with their dates, flags and statuses."
          caption="Typing little in the search box leaves three Little Acorn products across the tabs."
        />
        <div className="flex flex-col gap-3">
          <p>
            In the picture, the word little has been typed. The tabs now read Active (2), Launched (0) and Dropped (1),
            and the count under the filters reads &quot;Showing 2 of 16 active products&quot;. A small cross appears at
            the right end of the search box to clear it, and a Clear all filters link appears under the filters.
          </p>
          <p>
            One active match is Information Incomplete, with a Stock lands after launch flag and an SLA that has not
            started. The other is On Track, with a Data error flag. The third match is Dropped, so it sits on the
            Dropped tab.
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
          alt="The Overview page on a phone: navigation links wrap onto several lines and the status cards stack one above another."
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
          <strong>Small screens.</strong> The navigation links wrap onto further lines, cards stack into one column
          and wide tables scroll sideways inside their own frame instead of breaking the page.
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
            The SLA model, information tracking, flags, filters and the next-action wording are plain functions with no
            screen code in them. That is why they can be tested thoroughly and reused.
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
