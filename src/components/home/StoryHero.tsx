/**
 * Hero + pinned three-chapter story. One canvas, one wrapper.
 *
 * Desktop: a ~430vh wrapper with a sticky viewport. Scroll progress drives
 * the camera, lighting, energy paths and chapter copy. Native scrolling,
 * no scroll hijacking; progress is damped for a scrub feel.
 *
 * Mobile / reduced motion / no WebGL: static poster + the three chapters
 * as ordinary vertical sections, so the story never blocks content.
 */
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";

import houseModern from "@/assets/house-modern.asset.json";
import solarHipRoof from "@/assets/solar-hip-roof.asset.json";
import heatpumpUnit from "@/assets/heatpump-unit.asset.json";
import lounge from "@/assets/lounge.asset.json";
import type { HotspotId, StoryCanvasProps } from "./StoryCanvas";

export const HERO_COPY = {
  eyebrow: "Solar • Hot water • Air conditioning",
  headline: ["Every home has", "an energy story."],
  support: "Follow a day of possibilities with Austar Energy — solar, heat pump hot water and air conditioning for homes across Victoria and NSW.",
  primary: "Explore your home's possibilities",
  secondary: "Get a personalised quote",
  scrollCue: "It starts with a little sunlight.",
};

const CHAPTERS = [
  {
    id: "solar",
    num: "01",
    kicker: "The sun arrives.",
    title: "What could your daylight do?",
    copy: "Explore solar installation shaped around your property and the way you use electricity.",
    cta: "Explore the solar chapter",
    to: "/solar",
    image: solarHipRoof.url,
    imageAlt: "Solar panels installed on the tiled roof of a house",
  },
  {
    id: "hotwater",
    num: "02",
    kicker: "Then the day gets moving.",
    title: "Everyday routines. A different way to heat water.",
    copy: "Discover heat pump hot water options suited to your household and everyday needs.",
    cta: "Explore the hot water chapter",
    to: "/heat-pumps",
    image: heatpumpUnit.url,
    imageAlt: "Heat pump hot water unit installed beside a home",
  },
  {
    id: "comfort",
    num: "03",
    kicker: "Comfort follows you home.",
    title: "Outside changes. Make yourself comfortable.",
    copy: "Explore air conditioning options for the rooms you use and the way you live.",
    cta: "Explore the comfort chapter",
    to: "/air-conditioning",
    image: lounge.url,
    imageAlt: "Warm living room interior with natural daylight",
  },
] as const;

/** Windows of story progress where each chapter copy is on screen. */
const CHAPTER_WINDOWS: [number, number][] = [
  [0.08, 0.32],
  [0.33, 0.57],
  [0.58, 0.8],
];

const END_WINDOW: [number, number] = [0.84, 1];

export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function StoryHero({ children }: { children?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<HotspotId | null>(null);

  const progressRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [StoryCanvas, setStoryCanvas] = useState<ComponentType<StoryCanvasProps> | null>(null);

  useEffect(() => {
    setMounted(true);
    setWebglOk(supportsWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReduced = () => setReduced(mq.matches || document.documentElement.dataset["reducedMotion"] === "user");
    updateReduced();
    mq.addEventListener("change", updateReduced);
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsMobile(mqMobile.matches);
    updateMobile();
    mqMobile.addEventListener("change", updateMobile);
    return () => {
      mq.removeEventListener("change", updateReduced);
      mqMobile.removeEventListener("change", updateMobile);
    };
  }, []);

  const useScene = mounted && webglOk && !reduced;

  useEffect(() => {
    if (!useScene) return;
    let cancelled = false;
    import("./StoryCanvas").then((mod) => {
      if (!cancelled) setStoryCanvas(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [useScene]);

  // scroll progress + DOM chapter visibility (single rAF loop, no re-renders)
  useEffect(() => {
    if (!useScene || isMobile) return;
    let raf = 0;
    const tick = () => {
      const wrapper = wrapperRef.current;
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        progressRef.current = p;
      }
      // hero copy fades out early
      if (heroCopyRef.current) {
        const fade = 1 - Math.min(1, Math.max(0, (progressRef.current - 0.015) / 0.05));
        heroCopyRef.current.style.opacity = String(fade);
        heroCopyRef.current.style.transform = `translateY(${(1 - fade) * -36}px)`;
        heroCopyRef.current.style.visibility = fade <= 0.01 ? "hidden" : "visible";
      }
      // chapters
      CHAPTER_WINDOWS.forEach(([a, b], i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const fade =
          Math.min(1, Math.max(0, (progressRef.current - a) / 0.04)) *
          (1 - Math.min(1, Math.max(0, (progressRef.current - (b - 0.04)) / 0.04)));
        el.style.opacity = String(fade);
        el.style.transform = `translateY(${(1 - fade) * 30}px)`;
        el.style.visibility = fade <= 0.01 ? "hidden" : "visible";
      });
      if (endRef.current) {
        const [a] = END_WINDOW;
        const fade = Math.min(1, Math.max(0, (progressRef.current - a) / 0.05));
        endRef.current.style.opacity = String(fade);
        endRef.current.style.transform = `translateY(${(1 - fade) * 30}px)`;
        endRef.current.style.visibility = fade <= 0.01 ? "hidden" : "visible";
      }
      if (indicatorRef.current) {
        indicatorRef.current.style.width = `${progressRef.current * 100}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [useScene, isMobile]);

  // pause the whole scene when the tab is hidden
  useEffect(() => {
    const onVis = () => {
      document.documentElement.dataset["storyPaused"] = document.hidden ? "1" : "0";
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const desktop = useScene && !isMobile;

  return (
    <div ref={wrapperRef} className={desktop ? "relative h-[430vh]" : "relative"} aria-label="Austar Energy story">
      <div
        ref={viewportRef}
        className={
          desktop
            ? "sticky top-0 h-screen overflow-hidden"
            : "relative h-[92svh] min-h-[560px] overflow-hidden"
        }
      >
        {/* 3D scene (desktop + capable mobile), lazy-loaded after first paint */}
        {useScene && StoryCanvas ? (
          <div className="absolute inset-0" aria-hidden="true">
            <StoryCanvas
              progressRef={progressRef}
              activeHotspot={activeHotspot}
              onSelectHotspot={setActiveHotspot}
              interactive={desktop}
            />
          </div>
        ) : (
          /* poster fallback: always present in initial HTML when scene is off */
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src={houseModern.url}
              alt=""
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/20 to-ivory/40" />
          </div>
        )}

        {/* soft legibility wash behind copy */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ivory/80 via-ivory/30 to-transparent" aria-hidden="true" />

        {/* HERO COPY (always in DOM, never waits for WebGL) */}
        <div
          ref={heroCopyRef}
          className="pointer-events-none absolute inset-0 z-10 flex items-center"
        >
          <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8">
            <div className="max-w-[620px] pointer-events-auto">
              <p className="eyebrow text-forest/80">{HERO_COPY.eyebrow}</p>
              <h1 className="mt-5 font-display font-extrabold leading-[0.98] tracking-[-0.035em] text-charcoal [font-size:clamp(42px,10vw,60px)] md:[font-size:clamp(64px,7.5vw,120px)]">
                {HERO_COPY.headline.map((line) => (
                  <span key={line} className="block overflow-hidden">
                    <span className="block translate-y-full animate-[heroRise_0.9s_cubic-bezier(0.22,1,0.36,1)_forwards]">
                      {line}
                    </span>
                  </span>
                ))}
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal/75 md:text-lg">
                {HERO_COPY.support}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/"
                  hash="choices"
                  className="inline-flex items-center rounded-full bg-leaf px-7 py-3.5 text-sm font-semibold text-charcoal transition-all duration-200 hover:bg-leaf-soft hover:shadow-[0_10px_30px_rgba(104,169,67,0.4)]"
                >
                  {HERO_COPY.primary}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center rounded-full border border-charcoal/20 bg-ivory-bright/70 px-7 py-3.5 text-sm font-semibold text-charcoal backdrop-blur transition-colors hover:border-charcoal/40"
                >
                  {HERO_COPY.secondary}
                </Link>
              </div>
              <p className="mt-6 flex items-center gap-2 text-xs font-medium text-stone">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-leaf" aria-hidden="true" />
                Victoria &amp; New South Wales
              </p>
              <p className="mt-10 hidden items-center gap-2 text-xs text-stone md:flex">
                <ArrowDown className="size-3.5 animate-bounce" aria-hidden="true" />
                {HERO_COPY.scrollCue}
              </p>
            </div>
          </div>
        </div>

        {/* CHAPTER COPY (desktop pinned story only) */}
        {desktop && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="mx-auto h-full max-w-[1440px] px-5 md:px-8">
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.id}
                  ref={(el) => {
                    chapterRefs.current[i] = el;
                  }}
                  className="absolute inset-x-5 bottom-24 max-w-[520px] opacity-0 md:inset-x-8 md:bottom-28"
                  style={{ visibility: "hidden" }}
                  aria-hidden="true"
                >
                  <div className="pointer-events-auto rounded-3xl bg-ivory-bright/80 p-7 shadow-[0_20px_60px_rgba(16,23,19,0.12)] backdrop-blur-md md:p-9">
                    <p className="eyebrow text-forest/80">
                      Chapter {c.num} — {c.kicker}
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-charcoal md:text-[2.1rem]">
                      {c.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-charcoal/75">{c.copy}</p>
                    <div className="mt-5 flex items-center gap-5">
                      <Link
                        to={c.to}
                        className="inline-flex items-center rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-ivory transition-colors hover:bg-forest-deep"
                      >
                        {c.cta}
                      </Link>
                      <img
                        src={c.image}
                        alt={c.imageAlt}
                        loading="lazy"
                        className="h-16 w-24 rounded-xl object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* story ending */}
              <div
                ref={endRef}
                className="absolute inset-x-5 bottom-24 max-w-[560px] opacity-0 md:inset-x-8 md:bottom-28"
                style={{ visibility: "hidden" }}
                aria-hidden="true"
              >
                <div className="pointer-events-auto rounded-3xl bg-charcoal/70 p-7 text-ivory shadow-[0_20px_60px_rgba(16,23,19,0.3)] backdrop-blur-md md:p-9">
                  <p className="eyebrow text-amber">One home. Three possibilities.</p>
                  <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-ivory md:text-[2.1rem]">
                    Different upgrades. One more comfortable home.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/75">
                    Choose where your upgrade begins — or ask us what suits your place.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/"
                      hash="choices"
                      className="inline-flex items-center rounded-full bg-leaf px-5 py-2.5 text-xs font-semibold text-charcoal"
                    >
                      Choose my upgrade
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center rounded-full border border-ivory/30 px-5 py-2.5 text-xs font-semibold text-ivory"
                    >
                      Get a personalised quote
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* chapter indicator + skip link */}
        {desktop && (
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4">
            <span className="glass rounded-full px-4 py-2 text-[11px] font-medium text-charcoal">
              <span className="mr-2 inline-block h-1.5 w-16 overflow-hidden rounded-full bg-charcoal/15 align-middle">
                <span
                  ref={indicatorRef}
                  className="block h-full w-0 rounded-full bg-leaf transition-none"
                  aria-hidden="true"
                />
              </span>
              Follow the energy
              <Link to="/#choices" className="ml-3 font-semibold text-forest underline underline-offset-2">
                Skip to solutions
              </Link>
            </span>
          </div>
        )}
      </div>

      {/* Accessible hotspot equivalents */}
      {useScene && (
        <div className={desktop ? "sr-only" : "mx-auto mt-4 flex max-w-[1440px] flex-wrap gap-2 px-5"}>
          <span className={desktop ? "" : "sr-only"}>Explore parts of the home:</span>
          {(
            [
              ["solar", "Solar"],
              ["hotwater", "Hot water"],
              ["comfort", "Indoor comfort"],
            ] as [HotspotId, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveHotspot((v) => (v === id ? null : id))}
              aria-pressed={activeHotspot === id}
              className="rounded-full border border-border bg-ivory-bright px-4 py-2 text-xs font-semibold"
            >
              {label}
            </button>
          ))}
          {activeHotspot && <HotspotCard id={activeHotspot} />}
        </div>
      )}

      {/* After the pinned story: passed children continue the page.
          On mobile / fallback the three chapters render as normal sections. */}
      {(!desktop || children) && (
        <div className={desktop ? "contents" : ""}>
          {!desktop && <MobileChapters />}
          {children}
        </div>
      )}
    </div>
  );
}

const HOTSPOT_INFO: Record<HotspotId, { title: string; body: string }> = {
  solar: {
    title: "Solar",
    body: "Rooftop panels turn daylight into electricity your home can use. Planned around your roof, your shading and the way you use power.",
  },
  hotwater: {
    title: "Heat pump hot water",
    body: "A heat pump draws warmth from the surrounding air and transfers it into stored water — an efficient way to cover an everyday essential.",
  },
  comfort: {
    title: "Indoor comfort",
    body: "Reverse-cycle air conditioning keeps the rooms you live in comfortable as the seasons change.",
  },
};

function HotspotCard({ id }: { id: HotspotId }) {
  const info = HOTSPOT_INFO[id];
  return (
    <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
      <strong className="text-foreground">{info.title}.</strong> {info.body}
    </p>
  );
}

/** Ordinary vertical chapters for mobile and reduced-motion visitors. */
function MobileChapters() {
  return (
    <div className="space-y-6 bg-ivory px-5 py-14">
      <p className="eyebrow text-forest/80">Follow the energy</p>
      {CHAPTERS.map((c) => (
        <section key={c.id} className="overflow-hidden rounded-3xl bg-ivory-bright shadow-[0_10px_40px_rgba(16,23,19,0.08)]">
          <img src={c.image} alt={c.imageAlt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
          <div className="p-6">
            <p className="eyebrow text-forest/80">
              Chapter {c.num} — {c.kicker}
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-charcoal">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{c.copy}</p>
            <Link
              to={c.to}
              className="mt-4 inline-flex items-center rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-ivory"
            >
              {c.cta}
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
