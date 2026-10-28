import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";

import { TiltCard } from "@/components/site/TiltCard";
import { PhotoFrame } from "@/components/site/PhotoFrame";
import { Reveal, RevealLines, useRevealContainer } from "@/components/site/Reveal";
import { SITE } from "@/lib/site";
import solarThumb from "@/assets/solar-hip-roof.asset.json";
import heatpumpThumb from "@/assets/heatpump-unit.asset.json";
import loungeThumb from "@/assets/lounge.asset.json";

const ALL_SOLUTIONS = [
  { to: "/solar" as const, title: "Solar", blurb: "Put your roof to work with a system planned around your property.", image: solarThumb.url },
  { to: "/heat-pumps" as const, title: "Heat pump hot water", blurb: "An efficient everyday upgrade for one of your home's essentials.", image: heatpumpThumb.url },
  { to: "/air-conditioning" as const, title: "Air conditioning", blurb: "Comfort for the rooms you live in, through every season.", image: loungeThumb.url },
];

export type Highlight = { title: string; body: string; image: string; alt: string };

export type ServicePageProps = {
  eyebrow: string;
  headline: string[];
  intro: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  sections: { title: string; body: string }[];
  faq: { q: string; a: string }[];
  offersNotice: string;
  highlightsTitle?: string;
  highlights?: Highlight[];
  current?: "/solar" | "/heat-pumps" | "/air-conditioning";
};

export function ServicePage({
  eyebrow,
  headline,
  intro,
  image,
  imageAlt,
  imageCaption,
  sections,
  faq,
  offersNotice,
  highlightsTitle = "What to know before you decide.",
  highlights = [],
  current,
}: ServicePageProps) {
  const ref = useRevealContainer<HTMLElement>();

  return (
    <main ref={ref}>
      {/* hero */}
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <div className="mx-auto grid max-w-[1440px] items-end gap-10 px-5 pb-10 md:grid-cols-12 md:px-8 md:pb-16">
          <div className="md:col-span-7">
            <p className="eyebrow text-forest/80">{eyebrow}</p>
            <h1 className="mt-5 font-display font-extrabold leading-[1.02] tracking-[-0.03em] text-charcoal [font-size:clamp(38px,6vw,84px)]">
              {headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-charcoal/75 md:text-lg">{intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-leaf px-7 py-3.5 text-sm font-semibold text-charcoal transition-all hover:bg-leaf-soft"
              >
                Get my personalised quote
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-charcoal/20 px-7 py-3.5 text-sm font-semibold text-charcoal"
              >
                <Phone className="size-4" aria-hidden="true" />
                {SITE.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="md:col-span-5">
            <PhotoFrame src={image} alt={imageAlt} ratio="aspect-[4/3]" caption={imageCaption} disclaimer="Illustrative photography" />
          </div>
        </div>
      </section>

      {/* what the journey covers */}
      <section className="relative overflow-hidden bg-forest-deep py-20 md:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 size-[520px] rounded-full bg-leaf/20 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 size-[460px] rounded-full bg-leaf-bright/10 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(var(--color-ivory-bright)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
          <p className="eyebrow text-leaf-soft">Step by step</p>
          <RevealLines
            lines={["What the conversation covers."]}
            className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ivory-bright md:text-5xl"
          />
          <div className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div aria-hidden="true" className="absolute left-0 right-0 top-[58px] hidden h-px bg-gradient-to-r from-transparent via-leaf/50 to-transparent lg:block" />
            {sections.map((s, i) => (
              <Reveal key={s.title} delay={i * 120} className="h-full">
                <TiltCard className="rounded-[28px] p-px [background:linear-gradient(150deg,color-mix(in_oklab,var(--color-leaf)_70%,transparent),color-mix(in_oklab,var(--color-ivory-bright)_8%,transparent)_45%,color-mix(in_oklab,var(--color-leaf)_25%,transparent))] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[27px] bg-forest-deep/90 p-7 backdrop-blur-xl [transform-style:preserve-3d]">
                    <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-6 font-display text-[120px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_color-mix(in_oklab,var(--color-leaf)_35%,transparent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative flex size-12 items-center justify-center rounded-2xl bg-leaf font-display text-base font-extrabold text-charcoal shadow-[0_10px_30px_-6px_color-mix(in_oklab,var(--color-leaf)_70%,transparent)] [transform:translateZ(40px)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="relative mt-8 font-display text-xl font-bold text-ivory-bright [transform:translateZ(30px)]">{s.title}</h3>
                    <p className="relative mt-3 text-sm leading-relaxed text-ivory-bright/70 [transform:translateZ(18px)]">{s.body}</p>
                    <span aria-hidden="true" className="relative mt-auto block h-1 w-12 rounded-full bg-leaf/60 pt-0 [margin-top:2rem]" />
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 max-w-2xl text-xs leading-relaxed text-ivory-bright/55">{offersNotice}</Reveal>
        </div>
      </section>

      {/* highlights with real photography */}
      {highlights.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8">
            <RevealLines
              lines={[highlightsTitle]}
              className="font-display text-3xl font-extrabold tracking-tight text-charcoal md:text-5xl"
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 90} className="h-full">
                <TiltCard max={7} className="group overflow-hidden rounded-3xl bg-ivory-bright ring-1 ring-charcoal/5 shadow-[0_24px_50px_-18px_rgba(16,23,19,0.25)]">
                  <div className="aspect-[4/3] overflow-hidden bg-sage">
                    <img src={h.image} alt={h.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-charcoal">{h.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{h.body}</p>
                  </div>
                </TiltCard>
                </Reveal>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Illustrative photography</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[860px] px-5 md:px-8">
          <RevealLines
            lines={["A few things you may be wondering."]}
            className="font-display text-2xl font-extrabold tracking-tight text-charcoal md:text-4xl"
          />
          <div className="mt-8 divide-y divide-border">
            {faq.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-charcoal">
                    {f.q}
                    <span className="text-stone transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* other solutions */}
      <section className="bg-sage/40 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <RevealLines
            lines={["Explore other solutions."]}
            className="font-display text-2xl font-extrabold tracking-tight text-charcoal md:text-4xl"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {ALL_SOLUTIONS.filter((s) => s.to !== current).map((s, i) => (
              <Reveal key={s.to} delay={i * 80}>
                <Link to={s.to} className="group flex items-center gap-5 rounded-3xl bg-ivory-bright p-4 shadow-[0_10px_36px_rgba(16,23,19,0.06)] transition-transform hover:-translate-y-1">
                  <span className="mask-round h-24 w-32 shrink-0 overflow-hidden bg-sage">
                    <img src={s.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg font-bold text-charcoal">{s.title}</span>
                    <span className="mt-1 block text-sm text-charcoal/70">{s.blurb}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-forest transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
