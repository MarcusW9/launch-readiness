import type { Metadata } from "next";
import { DownloadButton } from "@/components/launch/download-button";
import {
  ActionRequiredTour,
  ActivityPageTour,
  ChangelogHistory,
  GuideContents,
  OverviewTour,
  PageAnatomy,
  ProductPageTour,
  ProductsTour,
  ProvideInformationTour,
  SearchAndFilter,
  TestsGuide,
  ThemeAndDevices,
  UnderTheHood,
  WhatsNewInLatest,
  WorkStatesGuide,
} from "@/components/launch/guide-sections";
import {
  ActivityGuide,
  Limits,
  ReadinessStatuses,
  TheModel,
  Walkthrough,
  WhatItIs,
} from "@/components/launch/how-it-works-sections";
import { LinkButton } from "@/components/launch/link-button";
import { Page, PageHeading } from "@/components/launch/page-frame";
import { LATEST_RELEASE } from "@/lib/launch/guide-content";

export const metadata: Metadata = {
  title: "How it works | Launch Readiness",
  description:
    "A complete guide to Launch Readiness: what it does, how product readiness is worked out, a screen-by-screen tour with screenshots, and what changed in version 4.",
};

export default function HowItWorksPage() {
  return (
    <Page>
      <PageHeading
        title="How this works"
        description="A complete guide to Launch Readiness. It explains every screen in words and pictures, so you can follow it even if you have never seen the product."
      >
        <div className="flex flex-wrap items-center gap-3">
          <DownloadButton href={LATEST_RELEASE.href} fileName={LATEST_RELEASE.fileName}>
            Download the v{LATEST_RELEASE.version} change log (.md)
          </DownloadButton>
          <LinkButton href="#changelog-history" variant="ghost" size="sm">
            Past versions
          </LinkButton>
        </div>
      </PageHeading>
      <GuideContents />
      <WhatsNewInLatest />
      <WhatItIs />
      <TheModel />
      <ReadinessStatuses />
      <PageAnatomy />
      <OverviewTour />
      <ProductsTour />
      <ActionRequiredTour />
      <ProductPageTour />
      <ProvideInformationTour />
      <ActivityGuide />
      <WorkStatesGuide />
      <ActivityPageTour />
      <SearchAndFilter />
      <ThemeAndDevices />
      <Walkthrough />
      <UnderTheHood />
      <TestsGuide />
      <Limits />
      <ChangelogHistory />
    </Page>
  );
}
