import { createFileRoute } from "@tanstack/react-router";

import { ServicePage } from "@/components/site/ServicePage";
import heatpumpUnit from "@/assets/heatpump-unit.asset.json";
import { OFFERS_NOTICE } from "@/lib/site";

export const Route = createFileRoute("/heat-pumps")({
  head: () => ({
    meta: [
      { title: "Heat Pump Hot Water — Austar Energy | Victoria & NSW" },
      {
        name: "description",
        content:
          "Heat pump hot water upgrades by Austar Energy. Discover an efficient way to cover an everyday essential, for homes across Victoria and NSW.",
      },
      { property: "og:title", content: "Heat Pump Hot Water — Austar Energy" },
      {
        property: "og:description",
        content: "Hot water. A smarter everyday. Heat pump hot water upgrades for your household.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HeatPumpsPage,
});

function HeatPumpsPage() {
  return (
    <ServicePage
      eyebrow="Heat pump hot water • Chapter 02"
      headline={["Hot water.", "A smarter everyday."]}
      intro="Heating water is one of the biggest everyday energy uses in a home. A heat pump system warms water by drawing heat from the surrounding air — a fundamentally more efficient way to cover the task."
      image={heatpumpUnit.url}
      imageAlt="Heat pump hot water unit installed beside a contemporary home"
      imageCaption="A heat pump hot water installation"
      sections={[
        {
          title: "Heat from the surrounding air",
          body: "The unit draws in ambient air and extracts its heat — even on cool days — rather than generating heat directly.",
        },
        {
          title: "Transferred into stored water",
          body: "A refrigerant cycle moves that collected heat into the water held in the storage tank.",
        },
        {
          title: "Ready for everyday use",
          body: "Hot water is stored and ready for showers, laundry and the kitchen — replenished as your household needs it.",
        },
        {
          title: "Electricity runs the system",
          body: "Electricity powers the pump and controls. Because most of the heat comes from the air, less electricity is needed to do the same job.",
        },
      ]}
      faq={[
        {
          q: "Is a heat pump right for my household?",
          a: "It depends on your household size, existing system, available space and current water usage — all things we discuss as part of an assessment rather than guess at.",
        },
        {
          q: "Where does the unit go?",
          a: "Units are typically installed outside, near the existing hot water service. Space, airflow and noise considerations are part of the site assessment.",
        },
        {
          q: "Can I enquire about solar at the same time?",
          a: "Yes. Many households consider them together because hot water is a large share of everyday energy use. Mention both and we'll cover them in one conversation.",
        },
        {
          q: "Could an offer apply to my upgrade?",
          a: "Available offers and eligibility depend on your location, property, existing system and applicable program conditions. We can review what applies to your property.",
        },
      ]}
      offersNotice={OFFERS_NOTICE}
    />
  );
}
