import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, X } from "lucide-react";

import { PhotoFrame } from "@/components/site/PhotoFrame";
import { Reveal, RevealLines, useRevealContainer } from "@/components/site/Reveal";
import { OFFERS_NOTICE, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

import houseModern from "@/assets/house-modern.asset.json";
import houseDusk from "@/assets/house-dusk.asset.json";
import solarMacro from "@/assets/solar-macro.asset.json";
import kitchen from "@/assets/kitchen.asset.json";
import solarInstaller from "@/assets/solar-installer.asset.json";
import solarHipRoof from "@/assets/solar-hip-roof.asset.json";
import solarTiledRoof from "@/assets/solar-tiled-roof.asset.json";
import heatpumpUnit from "@/assets/heatpump-unit.asset.json";
import heatpumpInstall from "@/assets/heatpump-install.asset.json";
import acOutdoor from "@/assets/ac-outdoor.asset.json";
import acIndoor from "@/assets/ac-indoor.asset.json";
import bathroom from "@/assets/bathroom.asset.json";
import lounge from "@/assets/lounge.asset.json";
import verandah from "@/assets/verandah.asset.json";
import grevillea from "@/assets/grevillea.asset.json";

/* ============================ A. Editorial bridge ========================== */

export function EditorialBridge() {
  const ref = useRevealContainer<HTMLElement>();
  return (
    <section ref={ref} id="approach" className="relative py-20 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <RevealLines
              lines={["Better energy starts with", "understanding your home."]}
              className="font-display font-extrabold leading-[1.04] tracking-[-0.03em] text-charcoal [font-size:clamp(32px,4.6vw,64px)]"
            />
            <Reveal className="mt-7 max-w-xl text-base leading-relaxed text-charcoal/75 md:text-lg">
              Your roof, your hot water system and the rooms you use every day all shape the right
              upgrade. Explore the possibilities with Austar Energy and take the next step with a
              quote tailored to your property.
            </Reveal>
          </div>
          <div className="flex flex-col gap-5 md:col-span-5">
            <Reveal delay={120}>
              <PhotoFrame
                src={houseModern.url}
                alt="A contemporary Australian home exterior"
                ratio="aspect-[16/10]"
                disclaimer="Illustrative photography"
              />
            </Reveal>
            <div className="grid grid-cols-2 gap-5">
              <Reveal delay={200}>
                <PhotoFrame src={solarMacro.url} alt="Close-up of solar panel cells" ratio="aspect-square" parallax={false} />
              </Reveal>
              <Reveal delay={280} className="mt-8">
                <PhotoFrame src={grevillea.url} alt="Native grevillea in flower" ratio="aspect-square" parallax={false} />
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== B. Service cards =========================== */

const CARDS = [
  {
    to: "/solar",
    num: "01",
    title: "Solar",
    copy: "Put your roof to work. Explore solar installation shaped around your property and energy needs.",
    image: solarHipRoof.url,
    alt: "Solar panels on the tiled roof of a home",
    className: "md:col-span-7",
    ratio: "aspect-[16/9]",
  },
  {
    to: "/heat-pumps",
    num: "02",
    title: "Heat pumps",
    copy: "Rethink everyday hot water. Discover an efficient upgrade suited to your household.",
    image: heatpumpUnit.url,
    alt: "Heat pump hot water unit beside a home",
    className: "md:col-span-5",
    ratio: "aspect-[4/5] md:aspect-[3/4]",
  },
  {
    to: "/air-conditioning",
    num: "03",
    title: "Air conditioning",
    copy: "Comfort for the spaces you live in. Explore installation options for your home or business.",
    image: lounge.url,
    alt: "A comfortable living room interior",
    className: "md:col-span-9",
    ratio: "aspect-[16/9]",
  },
];

export function ServiceCards() {
  return (
    <section id="choices" className="scroll-mt-20 py-10 md:py-16">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <RevealLines
          lines={["Choose where your upgrade begins."]}
          className="max-w-2xl font-display font-extrabold tracking-tight text-charcoal [font-size:clamp(28px,3.6vw,48px)]"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-12">
          {CARDS.map((c) => (
            <Reveal key={c.to} className={c.className}>
              <Link
                to={c.to}
                className="group relative block overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(16,23,19,0.18)]"
              >
                <div className={cn("relative overflow-hidden", c.ratio)}>
                  <img
                    src={c.image}
                    alt={c.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                  {/* moving highlight */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute -inset-x-1/2 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-ivory/10 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="eyebrow text-amber">Chapter {c.num}</p>
                    <h3 className="mt-2 font-display text-2xl font-extrabold text-ivory md:text-3xl">{c.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ivory/80">{c.copy}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-leaf-soft">
                      Explore
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
          <Reveal className="md:col-span-3" delay={120}>
            <Link
              to="/contact"
              className="flex h-full min-h-[220px] flex-col justify-between rounded-3xl bg-forest p-7 text-ivory transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(23,61,43,0.35)]"
            >
              <p className="eyebrow text-leaf-soft">Not sure where to start?</p>
              <div>
                <h3 className="font-display text-xl font-extrabold">Let's talk.</h3>
                <p className="mt-2 text-sm text-ivory/75">
                  Tell us about your home and we'll help you find the sensible first step.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber">
                  Start a conversation
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* =========================== C. Interactive explorer ======================= */

const CLAY_ICONS: Record<string, string> = {
  solar: "M12 3v4M5.6 5.6l2.8 2.8M3 12h4M18.4 5.6l-2.8 2.8M17 12h4",
  hotwater: "M12 3c3.5 4.2 6 7.2 6 10a6 6 0 1 1-12 0c0-2.8 2.5-5.8 6-10Z",
  comfort: "M3 8h10a4 4 0 1 0-4-4M3 13h14a4 4 0 1 1-4 4M3 18h9",
};

const EXPLORER = [
  {
    id: "solar",
    label: "Solar",
    title: "Your roof, working for you.",
    body: "Solar panels turn daylight into electricity your household can use. What suits your place depends on orientation, shading and how you use power through the day.",
    image: solarTiledRoof.url,
    alt: "Solar panels on a tiled roof",
    to: "/solar",
  },
  {
    id: "hotwater",
    label: "Hot water",
    title: "An everyday essential, rethought.",
    body: "A heat pump warms water using heat drawn from the surrounding air, so it needs less electricity to do the same job as a conventional system.",
    image: heatpumpInstall.url,
    alt: "A heat pump hot water installation",
    to: "/heat-pumps",
  },
  {
    id: "comfort",
    label: "Air conditioning",
    title: "Comfort for the rooms you live in.",
    body: "Reverse-cycle systems cool in summer and warm in winter, where the selected product supports it — matched to your rooms and routines.",
    image: acIndoor.url,
    alt: "A wall-mounted split system air conditioner",
    to: "/air-conditioning",
  },
] as const;

export function HomeExplorer() {
  const [active, setActive] = useState<(typeof EXPLORER)[number]["id"]>("solar");
  const current = EXPLORER.find((e) => e.id === active) ?? EXPLORER[0]!;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-forest/80">One home, three possibilities</p>
            <RevealLines
              lines={["Where would you begin?"]}
              className="mt-4 font-display font-extrabold tracking-tight text-charcoal [font-size:clamp(28px,3.4vw,44px)]"
            />
            <div className="mt-8 flex gap-3">
              {EXPLORER.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setActive(e.id)}
                  aria-pressed={active === e.id}
                  className={cn(
                    "neu-press flex flex-1 flex-col items-center gap-2 rounded-2xl px-3 py-4 text-xs font-semibold transition-all",
                    active === e.id ? "text-forest ring-2 ring-leaf" : "text-charcoal/60",
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.2} strokeLinecap="round" className="clay size-9 text-leaf" aria-hidden="true">
                    <path d={CLAY_ICONS[e.id]} stroke="currentColor" />
                  </svg>
                  {e.label}
                </button>
              ))}
            </div>
            <Reveal className="mt-6">
              <h3 className="font-display text-xl font-extrabold text-charcoal">{current.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{current.body}</p>
              <Link
                to={current.to}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-ivory transition-colors hover:bg-forest-deep"
              >
                Explore {current.label.toLowerCase()}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
          <Reveal className="md:col-span-7" delay={120}>
            <PhotoFrame
              key={active}
              src={current.image}
              alt={current.alt}
              ratio="aspect-[16/11]"
              caption="Illustrative photography"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================= D. Journey timeline ========================= */

const STEPS = [
  {
    title: "Tell us about your property",
    body: "A short conversation about where you are, what you have and what you'd like to improve.",
    image: kitchen.url,
  },
  {
    title: "Discuss suitable options",
    body: "We talk through what genuinely suits your property — with the trade-offs explained plainly.",
    image: acOutdoor.url,
  },
  {
    title: "Confirm your quote and installation scope",
    body: "A clear quote, a clear scope, and time to decide. No pressure and no surprises.",
    image: bathroom.url,
  },
  {
    title: "Arrange installation and next steps",
    body: "We schedule the work around your household and stay available for questions afterwards.",
    image: solarInstaller.url,
  },
];

export function ProcessTimeline() {
  const wrapRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const n = STEPS.length;

  useEffect(() => {
    let raf = 0;
    let smooth = 0;
    let last = -1;
    const tick = () => {
      const w = wrapRef.current;
      if (w) {
        const r = w.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        smooth += (target - smooth) * 0.1;
        const pos = smooth * (n - 0.001); // 0..n
        for (let i = 0; i < n; i++) {
          const el = cardRefs.current[i];
          if (!el) continue;
          const d = pos - i; // <0 upcoming, 0..1 current, >1 gone
          let ty = 0, tz = 0, rx = 0, ry = 0, op = 1, sc = 1;
          if (d < 0) {
            const k = Math.min(-d, 3);
            ty = k * 34; tz = -k * 90; rx = -k * 4; op = 1 - k * 0.22;
          } else if (d > 1) {
            op = 0; ty = -520; rx = 55;
          } else {
            const e = Math.max(0, (d - 0.55) / 0.45);
            const ee = e * e;
            ty = -ee * 520; tz = ee * 160; rx = ee * 55; ry = (i % 2 ? -1 : 1) * ee * 14; op = 1 - ee; sc = 1 + ee * 0.05;
            ry += (d - 0.3) * (i % 2 ? 6 : -6) * (1 - e);
          }
          el.style.transform = `translate3d(0,${ty}px,${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${sc})`;
          el.style.opacity = String(Math.max(0, op));
          el.style.zIndex = String(100 - i);
          const txt = el.lastElementChild as HTMLElement | null;
          if (txt) txt.style.opacity = String(d < 0 ? Math.max(0, 1 + d * 3) : 1);
          const img = imgRefs.current[i];
          if (img) img.style.transform = `scale(${1.15 - Math.min(Math.max(d + 1, 0), 2) * 0.05}) translateY(${(d - 0.5) * -12}px)`;
        }
        if (barRef.current) barRef.current.style.transform = `scaleY(${smooth})`;
        const a = Math.min(n - 1, Math.floor(pos));
        if (a !== last) { last = a; setActive(a); }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [n]);

  return (
    <section ref={wrapRef} id="journey" className="relative scroll-mt-20 bg-sage/40" style={{ height: `${n * 90 + 60}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-1/4 size-[520px] rounded-full bg-leaf/20 blur-3xl" />
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-5 md:grid-cols-12 md:gap-12 md:px-8">
          <div className="md:col-span-5">
            <p className="eyebrow text-forest/80">How it works</p>
            <h2 className="mt-3 font-display font-extrabold leading-[1.02] tracking-[-0.03em] text-charcoal [font-size:clamp(28px,4vw,56px)]">
              From first question
              <br />
              to installation.
            </h2>
            <p className="mt-4 hidden max-w-md text-sm leading-relaxed text-charcoal/70 md:block">
              Availability, suitability and any offers are confirmed through a proper assessment of your
              property — these steps set honest expectations rather than promises.
            </p>
            <ol className="relative mt-6 hidden space-y-1 pl-6 md:mt-10 md:block">
              <span className="absolute left-0 top-0 h-full w-px bg-charcoal/15" aria-hidden="true" />
              <span ref={barRef} className="absolute left-0 top-0 h-full w-px origin-top scale-y-0 bg-leaf" aria-hidden="true" />
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className={cn(
                    "flex items-center gap-4 py-2 font-display text-sm font-bold transition-all duration-500",
                    active === i ? "translate-x-2 text-charcoal" : "text-charcoal/35",
                  )}
                >
                  <span className={cn("text-xs tabular-nums", active === i ? "text-leaf" : "")}>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </li>
              ))}
            </ol>
          </div>

          <div className="relative h-[62svh] md:col-span-7 md:h-[520px]" style={{ perspective: "1400px" }}>
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute inset-0 overflow-hidden rounded-[28px] bg-charcoal shadow-[0_40px_80px_-30px_rgba(16,23,19,0.55)] will-change-transform"
                style={{ transformOrigin: "50% 100%" }}
              >
                <img
                  ref={(el) => {
                    imgRefs.current[i] = el;
                  }}
                  src={s.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                <span className="absolute right-6 top-4 font-display text-[clamp(64px,9vw,128px)] font-extrabold leading-none tracking-tighter text-ivory/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                  <p className="eyebrow text-leaf">Step {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ivory md:text-4xl">{s.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/80 md:text-base">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================= E. Gallery ============================== */

const GALLERY = [
  { src: solarHipRoof.url, caption: "Rooftop solar on a family home" },
  { src: heatpumpUnit.url, caption: "Heat pump hot water unit" },
  { src: lounge.url, caption: "A comfortable living space" },
  { src: solarInstaller.url, caption: "Panel installation in progress" },
  { src: bathroom.url, caption: "Morning light, warm water ready" },
  { src: verandah.url, caption: "Indoor-outdoor living" },
  { src: acOutdoor.url, caption: "Split system outdoor unit" },
  { src: kitchen.url, caption: "A kitchen beginning its day" },
];

export function PhotoGallery() {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? null : (o + 1) % GALLERY.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? null : (o - 1 + GALLERY.length) % GALLERY.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <RevealLines
          lines={["Real spaces. Everyday possibilities."]}
          className="font-display font-extrabold tracking-tight text-charcoal [font-size:clamp(28px,3.6vw,48px)]"
        />
        <div className="mt-10 columns-2 gap-4 md:columns-4 [&>figure]:mb-4">
          {GALLERY.map((g, i) => (
            <Reveal key={g.src} delay={i * 50}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block w-full overflow-hidden rounded-2xl"
                aria-label={`View photo: ${g.caption}`}
              >
                <img
                  src={g.src}
                  alt={g.caption}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ aspectRatio: i % 3 === 0 ? "4/5" : "4/3" }}
                />
                <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-charcoal/70 to-transparent p-3 pt-8 text-left text-[11px] font-medium text-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {g.caption}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Illustrative photography — images show typical equipment and homes, not documented Austar
          installations, unless stated otherwise.
        </p>
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/90 p-6 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-ivory/10 text-ivory"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={GALLERY[open]!.src} alt={GALLERY[open]!.caption} className="mask-round max-h-[75vh] w-auto object-contain" />
            <figcaption className="mt-3 flex items-center justify-between text-xs text-ivory/80">
              {GALLERY[open]!.caption}
              <span>
                {open + 1} / {GALLERY.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

/* ============================ F. Eligibility panel ========================= */

export function EligibilityPanel() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="neu-raise grid overflow-hidden md:grid-cols-12">
          <div className="p-8 md:col-span-7 md:p-12">
            <p className="eyebrow text-forest/80">Incentives &amp; eligibility</p>
            <RevealLines
              lines={["A clearer path to", "your next upgrade."]}
              className="mt-4 font-display font-extrabold tracking-tight text-charcoal [font-size:clamp(26px,3vw,40px)]"
            />
            <Reveal className="mt-5 max-w-lg text-sm leading-relaxed text-charcoal/70">
              Government programs and offers change over time, and what applies to your property
              depends on your location, your existing system and the upgrade itself. Rather than
              promising numbers, we review your situation and tell you honestly what's available.
            </Reveal>
            <Reveal delay={120} className="mt-7">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-leaf px-7 py-3.5 text-sm font-semibold text-charcoal transition-all hover:bg-leaf-soft"
              >
                Request an eligibility review
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
          <div className="bg-forest p-8 text-ivory md:col-span-5 md:p-12">
            <p className="eyebrow text-leaf-soft">What we check</p>
            <ul className="mt-5 space-y-4 text-sm">
              {[
                "Your location and service availability",
                "Your property type and existing systems",
                "The upgrade or combination you're considering",
                "Programs and conditions that may apply",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-2xl border border-ivory/15 bg-ivory/5 p-4 text-[11px] leading-relaxed text-ivory/70">
              {OFFERS_NOTICE}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== G. Service areas =========================== */

/** Simplified editorial map: eastern Australia with VIC and NSW highlighted. */
export { ServiceAreas } from "./ServiceAreas";

/* ================================== H. FAQ ================================= */

const FAQS = [
  {
    q: "Which services can I enquire about?",
    a: "Solar installation, heat pump hot water upgrades and air conditioning — for homes, and for business premises too. You can ask about one upgrade or several in the same enquiry.",
  },
  {
    q: "Do you service my postcode?",
    a: "We work across Victoria and New South Wales, but service availability varies by location and upgrade. Share your postcode and we'll confirm what's available for your area.",
  },
  {
    q: "What information helps with a quote?",
    a: "Your postcode, property type, the service you're interested in and any details about existing equipment — for example your current hot water system or roof type.",
  },
  {
    q: "Can I ask about more than one upgrade?",
    a: "Yes. Many households consider solar together with hot water or air conditioning. Mention everything you're considering and we'll cover it in one conversation.",
  },
  {
    q: "How do I find out whether an offer applies?",
    a: "Available offers and eligibility depend on your location, property, existing system and applicable program conditions. Request an eligibility review and we'll check what applies to you.",
  },
  {
    q: "How can I check whether a caller represents Austar Energy?",
    a: "Austar Energy does not conduct cold-call marketing. If someone calls claiming to represent us and you're unsure, hang up and check using the contact details published on this site.",
  },
];

export function FaqSection() {
  const ref = useRevealContainer<HTMLElement>();
  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="mx-auto max-w-[860px] px-5 md:px-8">
        <RevealLines
          lines={["A few things you", "may be wondering."]}
          className="font-display font-extrabold tracking-tight text-charcoal [font-size:clamp(28px,3.6vw,48px)]"
        />
        <div className="mt-10 divide-y divide-border">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 50}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-charcoal">
                  {f.q}
                  <span className="shrink-0 text-xl text-stone transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/70">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============================== I. Final CTA ============================== */

export function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={houseDusk.url}
        alt="A home glowing warmly at dusk"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal/80" />
      <div className="relative mx-auto max-w-[1440px] px-5 py-28 text-center md:px-8 md:py-40">
        <RevealLines
          lines={["Your home. A brighter", "next chapter."]}
          className="font-display font-extrabold tracking-tight text-ivory [font-size:clamp(34px,5vw,72px)]"
        />
        <Reveal className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/80">
          Tell us what you're planning. Let's explore the right next step — one upgrade or several.
        </Reveal>
        <Reveal delay={120} className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center rounded-full bg-leaf px-8 py-4 text-sm font-semibold text-charcoal transition-all hover:bg-leaf-soft hover:shadow-[0_12px_40px_rgba(104,169,67,0.45)]"
          >
            Get my personalised quote
          </Link>
          <a
            href={SITE.phoneHref}
            className="inline-flex items-center gap-2 rounded-full border border-ivory/30 bg-ivory/5 px-8 py-4 text-sm font-semibold text-ivory backdrop-blur transition-colors hover:bg-ivory/15"
          >
            <Phone className="size-4" aria-hidden="true" />
            Call {SITE.phoneDisplay}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
