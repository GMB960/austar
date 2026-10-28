import { createFileRoute } from "@tanstack/react-router";

import { PhotoFrame } from "@/components/site/PhotoFrame";
import { Reveal, RevealLines, useRevealContainer } from "@/components/site/Reveal";
import { Link } from "@tanstack/react-router";
import houseCottage from "@/assets/house-cottage.asset.json";
import verandah from "@/assets/verandah.asset.json";
import grevillea from "@/assets/grevillea.asset.json";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Austar Energy — Solar, Hot Water & Comfort | VIC & NSW" },
      {
        name: "description",
        content:
          "Austar Energy provides solar, heat pump hot water and air conditioning installation services, with Victoria and NSW as its service regions.",
      },
      { property: "og:title", content: "About Austar Energy" },
      {
        property: "og:description",
        content: "Practical energy upgrades, explained plainly, for homes across Victoria and NSW.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const ref = useRevealContainer<HTMLElement>();
  return (
    <main ref={ref} className="pt-28 md:pt-36">
      <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-8 md:pb-24">
        <p className="eyebrow text-forest/80">About</p>
        <RevealLines
          lines={["Energy upgrades,", "explained plainly."]}
          className="mt-5 max-w-3xl font-display font-extrabold leading-[1.02] tracking-[-0.03em] text-charcoal [font-size:clamp(38px,6vw,84px)]"
        />
        <Reveal className="mt-8 max-w-2xl text-base leading-relaxed text-charcoal/75 md:text-lg">
          <p>
            Austar Energy helps homeowners improve everyday comfort and use energy more efficiently —
            through solar installation, heat pump hot water upgrades and air conditioning. We work
            across {SITE.regions}, and every conversation starts with your property rather than a
            brochure.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-6 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <PhotoFrame
              src={houseCottage.url}
              alt="An Australian family home"
              ratio="aspect-[16/10]"
              disclaimer="Illustrative photography"
            />
          </Reveal>
          <div className="flex flex-col gap-6 md:col-span-5">
            <Reveal delay={100}>
              <PhotoFrame src={verandah.url} alt="A verandah opening onto a garden" ratio="aspect-[4/3]" disclaimer="Illustrative photography" />
            </Reveal>
            <Reveal delay={180} className="rounded-3xl bg-forest p-7 text-ivory">
              <h3 className="font-display text-xl font-bold">Our approach</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/80">
                We take the time to understand your property, discuss the options that genuinely suit
                it, and explain the next step before anything is scheduled. No pressure, no invented
                promises — just a clear path from first question to installed system.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              title: "Understand the property",
              body: "Your roof, your existing hot water system and the rooms you use every day all shape the right upgrade.",
            },
            {
              title: "Discuss suitable options",
              body: "We compare what's available against how you live, and explain the trade-offs in plain language.",
            },
            {
              title: "Explain the next step",
              body: "Quotes, timelines and what happens on installation day — set out before you commit to anything.",
            },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <p className="font-display text-3xl font-extrabold text-leaf">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 font-display text-lg font-bold text-charcoal">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sage/40 py-16 md:py-24">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="max-w-xl">
            <RevealLines
              lines={["Let's find the next step", "for your home."]}
              className="font-display text-2xl font-extrabold tracking-tight text-charcoal md:text-4xl"
            />
            <Reveal className="mt-4 text-sm text-charcoal/70">
              Serving {SITE.regions}. Service availability varies by location and upgrade.
            </Reveal>
          </div>
          <Reveal delay={120}>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full bg-leaf px-7 py-3.5 text-sm font-semibold text-charcoal transition-colors hover:bg-leaf-soft"
            >
              Start the conversation
            </Link>
          </Reveal>
        </div>
      </section>

      <figure className="mask-round mx-auto my-16 max-w-[1100px]">
        <img src={grevillea.url} alt="Native Australian grevillea in flower" className="aspect-[21/9] w-full object-cover" loading="lazy" />
      </figure>
    </main>
  );
}
