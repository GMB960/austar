import { createFileRoute } from "@tanstack/react-router";

import { ServicePage } from "@/components/site/ServicePage";
import lounge from "@/assets/lounge.asset.json";
import acIndoor from "@/assets/ac-indoor.asset.json";
import acOutdoor from "@/assets/ac-outdoor.asset.json";
import kitchen from "@/assets/kitchen.asset.json";
import { OFFERS_NOTICE } from "@/lib/site";

export const Route = createFileRoute("/air-conditioning")({
  head: () => ({
    meta: [
      { title: "Air Conditioning Installation — Austar Energy | VIC & NSW" },
      {
        name: "description",
        content:
          "Air conditioning installation by Austar Energy — system selection shaped around your rooms, your routines and the changing seasons.",
      },
      { property: "og:title", content: "Air Conditioning — Austar Energy" },
      {
        property: "og:description",
        content: "Comfort, in every season. Air conditioning options for the rooms you live in.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AirConditioningPage,
});

function AirConditioningPage() {
  return (
    <ServicePage
      eyebrow="Air conditioning • Chapter 03"
      headline={["Comfort,", "in every season."]}
      intro="The right air conditioning depends on the rooms you live in, how you use them and the seasons you're preparing for. Reverse-cycle systems can both cool in summer and warm in winter, where the selected product supports it."
      image={lounge.url}
      imageAlt="A comfortable living room with natural daylight"
      imageCaption="A living space made comfortable year-round"
      sections={[
        {
          title: "Which rooms, which routines",
          body: "A bedroom overnight and a living area through a summer afternoon have different needs — the conversation starts there.",
        },
        {
          title: "System selection",
          body: "Split systems, multi-heads and ducted options are compared against your rooms, layout and budget, with the trade-offs explained plainly.",
        },
        {
          title: "Cooling and heating",
          body: "Where the selected product supports reverse-cycle operation, one system can cover summer cooling and winter warmth.",
        },
        {
          title: "Installation and handover",
          body: "Install is scheduled around your household, and we walk you through controls, maintenance and what to expect from the system.",
        },
      ]}
      faq={[
        {
          q: "Should I choose a split or ducted system?",
          a: "It depends on your rooms, ceiling space and how you live. We compare the options for your property rather than recommending one size for everyone.",
        },
        {
          q: "Can one system heat and cool?",
          a: "Reverse-cycle air conditioners can do both, where the selected product supports it. We'll explain what applies to the systems we discuss with you.",
        },
        {
          q: "Can I combine this with a solar enquiry?",
          a: "Yes — comfort and energy questions often go together. Tell us everything you're considering and we'll address it in one conversation.",
        },
        {
          q: "Do you install for business premises?",
          a: "We take enquiries for business premises as well as homes. Mention your property type when you get in touch.",
        },
      ]}
      current="/air-conditioning"
      highlightsTitle="Comfort, planned room by room."
      highlights={[
        { title: "Indoor units that fit the room", body: "Wall-mounted split systems suit individual rooms, while ducted systems serve the whole home through discreet ceiling vents.", image: acIndoor.url, alt: "Wall-mounted indoor air conditioning unit" },
        { title: "Outdoor units placed with care", body: "Outdoor units are positioned for airflow, servicing access and minimal noise near bedrooms and neighbours.", image: acOutdoor.url, alt: "Outdoor air conditioning unit beside a home" },
        { title: "Open-plan living", body: "Kitchens and living areas often need more capacity. We size systems to the space and how sunlight and layout affect it.", image: kitchen.url, alt: "Bright open-plan kitchen and living area" },
      ]}
      offersNotice={OFFERS_NOTICE}
    />
  );
}
