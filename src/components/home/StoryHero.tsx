/**
 * Hero + pinned photo story. Real photography, scroll-scrubbed.
 *
 * A tall wrapper with a sticky viewport. Scroll progress drives a sequence
 * of full-bleed photos (house → solar → hot water → comfort → dusk): each
 * scene opens with a circular reveal, slowly pushes in (Ken Burns) and its
 * chapter copy slides in. Native scrolling, damped progress, no hijacking.
 * Reduced motion: ordinary vertical chapters.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, Check } from "lucide-react";

import houseModern from "@/assets/house-modern.asset.json";
import houseDuskWarm from "@/assets/house-dusk-warm.asset.json";
import solarHipRoof from "@/assets/solar-hip-roof.asset.json";
import heatpumpUnit from "@/assets/heatpump-unit.asset.json";
import lounge from "@/assets/lounge.asset.json";

export const HERO_COPY = {
  eyebrow: "Solar • Hot water • Air conditioning",
  headline: ["Every home has", "an energy story."],
  support: "Follow a day of possibilities with Austar Energy — solar, heat pump hot water and air conditioning for homes across Victoria and NSW.",
  primary: "Explore your home's possibilities",
  secondary: "Get a personalised quote",
  scrollCue: "Scroll — it starts with a little sunlight.",
};

const CHAPTERS = [
  {
    id: "solar",
    num: "01",
    label: "Solar",
    kicker: "The sun arrives.",
    title: "What could your daylight do?",
    copy: "Rooftop panels turn daylight into electricity your home can use — planned around your roof, its shading and the way you use power.",
    points: ["Designed for your roof and orientation", "Quality panels and inverters", "Optional battery-ready setups"],
    cta: "Explore solar",
    to: "/solar",
    image: solarHipRoof.url,
    imageAlt: "Solar panels installed on the roof of a modern home",
    origin: "62% 30%",
  },
  {
    id: "hotwater",
    num: "02",
    label: "Hot water",
    kicker: "Then the day gets moving.",
    title: "Everyday routines. A different way to heat water.",
    copy: "A heat pump draws warmth from the surrounding air and moves it into stored water — an efficient way to cover an everyday essential.",
    points: ["Works from ambient air, day or night", "Sized to your household", "Eligibility for incentives checked for you"],
    cta: "Explore hot water",
    to: "/heat-pumps",
    image: heatpumpUnit.url,
    imageAlt: "Heat pump hot water unit installed beside a home",
    origin: "50% 55%",
  },
  {
    id: "comfort",
    num: "03",
    label: "Indoor comfort",
    kicker: "Comfort follows you home.",
    title: "Outside changes. Make yourself comfortable.",
    copy: "Reverse-cycle air conditioning keeps the rooms you live in comfortable as the seasons change — cooling in summer, heating in winter.",
    points: ["Split and multi-room systems", "Quiet, efficient reverse-cycle", "Placed for the rooms you actually use"],
    cta: "Explore air conditioning",
    to: "/air-conditioning",
    image: lounge.url,
    imageAlt: "Bright, comfortable modern living room",
    origin: "60% 35%",
  },
] as const;

/** Scene start points on the 0–1 story progress (hero, 3 chapters, dusk). */
const STARTS = [0, 0.16, 0.38, 0.6, 0.84, 1.0001];
const REVEAL = 0.07;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function StoryHero({ children }: { children?: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let smooth = 0;
    let lastActive = -1;
    const tick = () => {
      const w = wrapperRef.current;
      if (w) {
        const r = w.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const target = total > 0 ? clamp(-r.top / total) : 0;
        smooth += (target - smooth) * 0.12;
        if (Math.abs(target - smooth) < 0.0002) smooth = target;
        const p = smooth;

        for (let i = 0; i < 5; i++) {
          const start = STARTS[i] ?? 0;
          const end = STARTS[i + 1] ?? 1;
          const layer = layerRefs.current[i];
          const img = imgRefs.current[i];
          // circular reveal as each scene enters
          if (layer && i > 0) {
            const t = ease(clamp((p - (start - REVEAL)) / REVEAL));
            layer.style.clipPath = `circle(${t * 150}% at ${i % 2 ? "72% 40%" : "30% 55%"})`;
            layer.style.visibility = t <= 0 ? "hidden" : "visible";
          }
          // slow push-in across the scene's life
          if (img) {
            const local = clamp((p - (start - REVEAL)) / (end - start + REVEAL));
            const scale = 1.28 - local * 0.2;
            const drift = (local - 0.5) * (i % 2 ? -3 : 3);
            img.style.transform = `scale(${scale}) translate3d(${drift}%, ${-drift * 0.5}%, 0)`;
          }
          // copy
          const copy = copyRefs.current[i];
          if (copy) {
            const fin = i === 0 ? 1 : clamp((p - start) / 0.04);
            const fout = i === 4 ? 1 : 1 - clamp((p - (end - 0.05)) / 0.04);
            const f = fin * fout;
            copy.style.opacity = String(f);
            copy.style.transform = `translate3d(0, ${(1 - fin) * 48 - (1 - fout) * 48}px, 0)`;
            copy.style.visibility = f <= 0.01 ? "hidden" : "visible";
            copy.style.pointerEvents = f > 0.5 ? "auto" : "none";
          }
        }
        if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
        let a = 0;
        for (let i = 0; i < 5; i++) if (p >= (STARTS[i] ?? 0) - 0.02) a = i;
        if (a !== lastActive) {
          lastActive = a;
          setActive(a);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const jumpTo = (i: number) => {
    const w = wrapperRef.current;
    if (!w) return;
    const total = w.offsetHeight - window.innerHeight;
    const top = w.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + total * ((STARTS[i] ?? 0) + (i ? 0.03 : 0)), behavior: "smooth" });
  };

  if (reduced) {
    return (
      <>
        <section className="relative h-[92svh] min-h-[560px] overflow-hidden">
          <img src={houseModern.url} alt="Modern Australian home" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-r from-ivory/90 via-ivory/50 to-transparent" />
          <div className="relative z-10 flex h-full items-center pt-16 pb-6 md:pt-20">
            <HeroCopy />
          </div>
        </section>
        <StaticChapters />
        {children}
      </>
    );
  }

  const sceneImages = [houseModern.url, ...CHAPTERS.map((c) => c.image), houseDuskWarm.url];
  const sceneAlts = ["Modern Australian home in daylight", ...CHAPTERS.map((c) => c.imageAlt), "The same home glowing at dusk"];

  return (
    <>
      <div ref={wrapperRef} className="relative h-[520vh]" aria-label="Austar Energy story">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-charcoal">
          {/* photo layers */}
          {sceneImages.map((src, i) => (
            <div
              key={src}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className="absolute inset-0 overflow-hidden will-change-[clip-path]"
              style={i > 0 ? { clipPath: "circle(0% at 50% 50%)", visibility: "hidden" } : undefined}
            >
              <img
                ref={(el) => {
                  imgRefs.current[i] = el;
                }}
                src={src}
                alt={sceneAlts[i]}
                className="h-full w-full object-cover will-change-transform"
                style={{ transform: "scale(1.28)", transformOrigin: i > 0 && i < 4 ? CHAPTERS[i - 1]?.origin : "50% 50%" }}
                fetchPriority={i === 0 ? "high" : "auto"}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <div
                className={
                  i === 0
                    ? "absolute inset-0 bg-gradient-to-r from-ivory/90 via-ivory/45 to-transparent"
                    : "absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/45 to-charcoal/5"
                }
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-charcoal/50 to-transparent" />
            </div>
          ))}

          {/* hero copy */}
          <div
            ref={(el) => {
              copyRefs.current[0] = el;
            }}
            className="absolute inset-0 z-10 flex items-center pt-16 pb-6 md:pt-20"
          >
            <HeroCopy />
          </div>

          {/* chapter copy */}
          {CHAPTERS.map((c, idx) => (
            <div
              key={c.id}
              ref={(el) => {
                copyRefs.current[idx + 1] = el;
              }}
              className="absolute inset-0 z-10 flex items-center"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8">
                <div className="max-w-[560px] text-ivory">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-[clamp(64px,10vw,140px)] font-extrabold leading-none tracking-tighter text-ivory/15">
                      {c.num}
                    </span>
                    <span className="eyebrow text-leaf">{c.label}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-amber">{c.kicker}</p>
                  <h2 className="mt-3 font-display text-[clamp(30px,4.4vw,56px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                    {c.title}
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-ivory/80">{c.copy}</p>
                  <ul className="mt-6 space-y-2.5">
                    {c.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-3 text-sm text-ivory/90">
                        <span className="grid size-5 place-items-center rounded-full bg-leaf/90 text-charcoal">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to={c.to} className="inline-flex items-center rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-leaf-soft">
                      {c.cta}
                    </Link>
                    <Link to="/contact" className="inline-flex items-center rounded-full border border-ivory/30 px-6 py-3 text-sm font-semibold text-ivory backdrop-blur transition-colors hover:border-ivory/60">
                      Get a quote
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* ending */}
          <div
            ref={(el) => {
              copyRefs.current[4] = el;
            }}
            className="absolute inset-0 z-10 flex items-center"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8">
              <div className="max-w-[600px] text-ivory">
                <p className="eyebrow text-amber">One home. Three possibilities.</p>
                <h2 className="mt-4 font-display text-[clamp(32px,5vw,64px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                  Different upgrades. One more comfortable home.
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-ivory/80">
                  Choose where your upgrade begins — or ask us what suits your place.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/" hash="choices" className="inline-flex items-center rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-charcoal">
                    Choose my upgrade
                  </Link>
                  <Link to="/contact" className="inline-flex items-center rounded-full border border-ivory/30 px-6 py-3 text-sm font-semibold text-ivory">
                    Get a personalised quote
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* chapter rail */}
          <nav aria-label="Story chapters" className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 md:right-8 md:flex">
            <div className="relative mr-4 w-px bg-ivory/25">
              <span ref={barRef} className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-leaf" />
            </div>
            <ol className="flex flex-col gap-6">
              {["Home", ...CHAPTERS.map((c) => c.label), "Dusk"].map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-current={active === i ? "step" : undefined}
                    className={`glass flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
                      active === i ? "scale-105 text-charcoal" : "text-charcoal/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${active === i ? "bg-leaf" : "bg-charcoal/30"}`} />
                    {label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {/* mobile progress */}
          <div className="absolute inset-x-5 bottom-6 z-20 flex gap-1.5 md:hidden">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${active >= i ? "bg-leaf" : "bg-ivory/30"}`} />
            ))}
          </div>
        </div>
      </div>
      {children}
    </>
  );
}

function HeroCopy() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8">
      <div className="max-w-[860px]">
        <p className="eyebrow text-forest/80">{HERO_COPY.eyebrow}</p>
        <h1 className="mt-5 font-display font-extrabold leading-[0.98] tracking-[-0.035em] text-charcoal [font-size:clamp(42px,9vw,60px)] md:[font-size:clamp(60px,6.6vw,96px)]">
          {HERO_COPY.headline.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span className="block [transform:translateY(110%)] animate-[heroRise_0.9s_cubic-bezier(0.22,1,0.36,1)_forwards]">{line}</span>
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal/80 md:text-lg">{HERO_COPY.support}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/" hash="choices" className="inline-flex items-center rounded-full bg-leaf px-7 py-3.5 text-sm font-semibold text-charcoal transition-all duration-200 hover:bg-leaf-soft">
            {HERO_COPY.primary}
          </Link>
          <Link to="/contact" className="inline-flex items-center rounded-full border border-charcoal/20 bg-ivory-bright/70 px-7 py-3.5 text-sm font-semibold text-charcoal backdrop-blur transition-colors hover:border-charcoal/40">
            {HERO_COPY.secondary}
          </Link>
        </div>
        <p className="mt-10 flex items-center gap-2 text-xs font-medium text-charcoal/70">
          <ArrowDown className="size-3.5 animate-bounce" aria-hidden="true" />
          {HERO_COPY.scrollCue}
        </p>
      </div>
    </div>
  );
}

function StaticChapters() {
  return (
    <div className="space-y-6 bg-ivory px-5 py-14">
      {CHAPTERS.map((c) => (
        <section key={c.id} className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-ivory-bright shadow-[0_10px_40px_rgba(16,23,19,0.08)]">
          <img src={c.image} alt={c.imageAlt} loading="lazy" className="aspect-[16/9] w-full object-cover" />
          <div className="p-6">
            <p className="eyebrow text-forest/80">Chapter {c.num} — {c.label}</p>
            <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-charcoal">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{c.copy}</p>
            <Link to={c.to} className="mt-4 inline-flex items-center rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-ivory">
              {c.cta}
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
