import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { StoryHero } from "@/components/home/StoryHero";
import {
  EditorialBridge,
  EligibilityPanel,
  FaqSection,
  FinalCta,
  HomeExplorer,
  PhotoGallery,
  ProcessTimeline,
  ServiceAreas,
  ServiceCards,
} from "@/components/home/HomeSections";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Austar Energy — Solar, Heat Pump Hot Water & Air Conditioning | VIC & NSW",
      },
      {
        name: "description",
        content:
          "Follow a day of possibilities with Austar Energy. Solar, heat pump hot water and air conditioning for homes across Victoria and NSW — request a personalised quote.",
      },
      { property: "og:title", content: "Austar Energy — Every home has an energy story" },
      {
        property: "og:description",
        content:
          "Explore solar, heat pump hot water and air conditioning with Austar Energy, serving Victoria and NSW.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE.name,
          telephone: "+61468013322",
          email: SITE.emailGeneral,
          address: [
            { "@type": "PostalAddress", streetAddress: "Unit 30, 3 Kelso Crescent", addressLocality: "Moorebank", addressRegion: "NSW", postalCode: "2170", addressCountry: "AU" },
            { "@type": "PostalAddress", streetAddress: "175 A'Beckett St", addressLocality: "Melbourne", addressRegion: "VIC", postalCode: "3000", addressCountry: "AU" },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <SiteHeader />
      <StoryHero>
        <EditorialBridge />
        <ServiceCards />
        <HomeExplorer />
        <ProcessTimeline />
        <PhotoGallery />
        <EligibilityPanel />
        <ServiceAreas />
        <FaqSection />
        <FinalCta />
      </StoryHero>
      <SiteFooter />
    </>
  );
}
