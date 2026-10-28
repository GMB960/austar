import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";

import { PhotoFrame } from "@/components/site/PhotoFrame";
import { Reveal, RevealLines, useRevealContainer } from "@/components/site/Reveal";
import { SITE } from "@/lib/site";

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
      <section className="bg-sage/40 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <RevealLines
            lines={["What the conversation covers."]}
            className="font-display text-3xl font-extrabold tracking-tight text-charcoal md:text-5xl"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sections.map((s, i) => (
              <Reveal key={s.title} delay={i * 80} className="rounded-3xl bg-ivory-bright p-6 shadow-[0_10px_36px_rgba(16,23,19,0.06)]">
                <p className="font-display text-3xl font-extrabold text-leaf">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-lg font-bold text-charcoal">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{s.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 max-w-2xl text-xs leading-relaxed text-muted-foreground">{offersNotice}</Reveal>
        </div>
      </section>

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
    </main>
  );
}
