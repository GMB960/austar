import { createFileRoute } from "@tanstack/react-router";

import { ServicePage } from "@/components/site/ServicePage";
import solarHipRoof from "@/assets/solar-hip-roof.asset.json";
import { OFFERS_NOTICE } from "@/lib/site";

export const Route = createFileRoute("/solar")({
  head: () => ({
    meta: [
      { title: "Solar Installation — Austar Energy | Victoria & NSW" },
      {
        name: "description",
        content:
          "Explore solar installation with Austar Energy — tailored consultation, property assessment and system planning for homes across Victoria and NSW.",
      },
      { property: "og:title", content: "Solar Installation — Austar Energy" },
      {
        property: "og:description",
        content: "Make more of the energy above you. Solar installation shaped around your property.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SolarPage,
});

function SolarPage() {
  return (
    <ServicePage
      eyebrow="Solar • Chapter 01"
      headline={["Make more of the", "energy above you."]}
      intro="A solar system works best when it is planned around your roof, your shading and the way your household actually uses electricity. That planning starts with a conversation."
      image={solarHipRoof.url}
      imageAlt="Solar panels installed on the tiled roof of a suburban home"
      imageCaption="Rooftop solar on a family home"
      sections={[
        {
          title: "Tell us about your property",
          body: "Where you are, what kind of roof you have and how your household uses electricity through the day.",
        },
        {
          title: "Property assessment",
          body: "Orientation, shading, roof condition and switchboard details shape what a sensible system looks like for you.",
        },
        {
          title: "System planning",
          body: "Panel and inverter options are discussed against your usage patterns, with honest explanation of the trade-offs.",
        },
        {
          title: "Installation and support",
          body: "Once the design is confirmed, installation is arranged and we remain available for questions and service afterwards.",
        },
      ]}
      faq={[
        {
          q: "Do you service my area?",
          a: "We work across Victoria and New South Wales. Service availability varies by location, so we confirm availability for your postcode when you enquire.",
        },
        {
          q: "How much could I save?",
          a: "Savings depend on your roof, your system and the way you use electricity. We won't quote figures without a proper assessment of your property.",
        },
        {
          q: "Could an offer or rebate apply?",
          a: "Available offers and eligibility depend on your location, property, existing system and applicable program conditions. We can review what applies to you.",
        },
        {
          q: "Can I also ask about hot water or air conditioning?",
          a: "Absolutely — many enquiries cover more than one upgrade. Mention everything you're considering and we'll address it in the same conversation.",
        },
      ]}
      offersNotice={OFFERS_NOTICE}
    />
  );
}
