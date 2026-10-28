import { createFileRoute } from "@tanstack/react-router";

import { QuoteForm } from "@/components/site/QuoteForm";
import { RevealLines, useRevealContainer } from "@/components/site/Reveal";
import { COLD_CALL_NOTICE, SITE } from "@/lib/site";
import { MapPin, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Austar Energy — Request a Personalised Quote" },
      {
        name: "description",
        content:
          "Talk to Austar Energy about solar, heat pump hot water or air conditioning. Request a personalised quote or eligibility review for your property.",
      },
      { property: "og:title", content: "Contact Austar Energy" },
      {
        property: "og:description",
        content: "Tell us what you're planning. Let's explore the right next step for your home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const ref = useRevealContainer<HTMLElement>();
  return (
    <main ref={ref} className="pt-28 md:pt-36">
      <section className="mx-auto max-w-[1440px] px-5 pb-12 md:px-8">
        <p className="eyebrow text-forest/80">Contact</p>
        <RevealLines
          lines={["Your home. A brighter", "next chapter."]}
          className="mt-5 font-display font-extrabold leading-[1.02] tracking-[-0.03em] text-charcoal [font-size:clamp(38px,6vw,84px)]"
        />
        <p className="mt-6 max-w-xl text-base leading-relaxed text-charcoal/75 md:text-lg">
          Tell us what you're planning. Let's explore the possibilities — for one upgrade or several.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 md:grid-cols-12 md:px-8 md:pb-24">
        <div className="md:col-span-5">
          <div className="space-y-5">
            <a
              href={SITE.phoneHref}
              className="neu-raise flex items-center gap-4 p-5 text-charcoal transition-transform hover:-translate-y-0.5"
            >
              <Phone className="size-5 text-forest" aria-hidden="true" />
              <span>
                <span className="block text-xs font-medium text-muted-foreground">Call us</span>
                <span className="font-display text-lg font-bold">{SITE.phoneDisplay}</span>
              </span>
            </a>
            <a
              href={`mailto:${SITE.emailGeneral}`}
              className="neu-raise flex items-center gap-4 p-5 text-charcoal transition-transform hover:-translate-y-0.5"
            >
              <Mail className="size-5 text-forest" aria-hidden="true" />
              <span>
                <span className="block text-xs font-medium text-muted-foreground">General enquiries</span>
                <span className="font-display text-base font-bold">{SITE.emailGeneral}</span>
              </span>
            </a>
            <a
              href={`mailto:${SITE.emailSales}`}
              className="neu-raise flex items-center gap-4 p-5 text-charcoal transition-transform hover:-translate-y-0.5"
            >
              <Mail className="size-5 text-forest" aria-hidden="true" />
              <span>
                <span className="block text-xs font-medium text-muted-foreground">Sales</span>
                <span className="font-display text-base font-bold">{SITE.emailSales}</span>
              </span>
            </a>
            <div className="neu-raise space-y-3 p-5 text-sm text-charcoal/80">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-forest" aria-hidden="true" />
                <span>
                  <strong className="text-charcoal">NSW</strong> — {SITE.addresses.nsw}
                </span>
              </p>
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-forest" aria-hidden="true" />
                <span>
                  <strong className="text-charcoal">VIC</strong> — {SITE.addresses.vic}
                </span>
              </p>
            </div>
          </div>
          <p className="mt-6 rounded-2xl border border-border bg-ivory-bright p-4 text-xs leading-relaxed text-muted-foreground">
            {COLD_CALL_NOTICE}
          </p>
        </div>
        <div className="md:col-span-7">
          <QuoteForm />
        </div>
      </section>
    </main>
  );
}
