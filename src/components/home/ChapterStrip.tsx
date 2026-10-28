/**
 * Closing story: full-bleed scroll-driven chapters.
 *
 * A tall wrapper with a sticky viewport. Vertical scrolling crossfades a
 * sequence of full-screen photographs (solar → hot water → comfort → install
 * day → afterwards → dusk invitation); each photo carries its own writing,
 * which fades and lifts as the next scene takes over. Photos slowly push in
 * (Ken Burns) and drift so the frame always feels alive. One rAF loop writes
 * styles directly — no React state per frame, no WebGL.
 *
 * Narrow screens and reduced-motion visitors get the same chapters stacked
 * vertically with ordinary in-flow layout (decided in JS via matchMedia, not
 * CSS overrides, so a stale pinned layout can never strand content).
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Phone } from "lucide-react";

import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

import solarTiledRoof from "@/assets/solar-tiled-roof.asset.json";
import heatpumpInstall from "@/assets/heatpump-install.asset.json";
import kitchen from "@/assets/kitchen.asset.json";
import solarInstaller from "@/assets/solar-installer.asset.json";
import houseDusk from "@/assets/house-dusk.asset.json";
import houseDuskWarm from "@/assets/house-dusk-warm.asset.json";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

type Chapter = {
  id: string;
  num: string;
  label: string;
  kicker: string;
  title: string;
  copy: string;
  points: string[];
  cta: string;
  to: string;
  image: string;
  imageAlt: string;
  origin: string;
};

const CHAPTERS: Chapter[] = [
  {
    id: "solar",
    num: "01",
    label: "Solar",
    kicker: "Roof first",
    title: "Panels that suit the roof you actually have",
    copy: "Before anything is quoted, the roof is read: which way it faces, what shades it through the day, and where the array can sit clean. That work decides how much daylight you'll actually capture.",
    points: ["Orientation, pitch and shading assessed", "Panel and inverter options explained", "Output estimated against your usage"],
    cta: "See what solar involves",
    to: "/solar",
    image: solarTiledRoof.url,
    imageAlt: "Solar panels mounted across a tiled Australian roof",
    origin: "55% 40%",
  },
  {
    id: "hotwater",
    num: "02",
    label: "Hot water",
    kicker: "The quiet consumer",
    title: "Hot water that stops being the big bill",
    copy: "Water heating runs in the background all day, so it carries a surprising share of a household bill. A heat pump moves warmth from the air into your tank instead of burning energy to make it.",
    points: ["Heat pump, gas or hybrid compared", "Tank sized to real household demand", "Sited for access, noise and drainage"],
    cta: "Explore hot water options",
    to: "/heat-pumps",
    image: heatpumpInstall.url,
    imageAlt: "A heat pump hot water system being installed at a home",
    origin: "50% 55%",
  },
  {
    id: "comfort",
    num: "03",
    label: "Comfort",
    kicker: "The rooms you use",
    title: "Everyday rooms, kept the way you like them",
    copy: "A kitchen that holds heat in summer, a bedroom that's usable on a cold morning. Heating and cooling is sized room by room, so the system matches how the house is really lived in.",
    points: ["Load worked out per room, not per house", "Zoned control for the spaces you use", "Running cost modelled before you commit"],
    cta: "Look at heating and cooling",
    to: "/air-conditioning",
    image: kitchen.url,
    imageAlt: "A bright, modern kitchen in a family home",
    origin: "50% 45%",
  },
  {
    id: "install",
    num: "04",
    label: "Install day",
    kicker: "Done properly",
    title: "A tidy installation, properly documented",
    copy: "The crew arrives with the plan you agreed. Paths are protected, penetrations sealed, and the paperwork that proves the work is compliant is left with you — not chased later.",
    points: ["Roof, walls and floors protected on the day", "Compliance and safety certificates issued", "A walkthrough of the finished system"],
    cta: "Read how we work",
    to: "/about",
    image: solarInstaller.url,
    imageAlt: "An installer fitting solar panels on a roof",
    origin: "60% 35%",
  },
  {
    id: "after",
    num: "05",
    label: "Afterwards",
    kicker: "Past handover",
    title: "Still here once the paperwork is filed",
    copy: "Systems settle in, and questions come after the truck has gone. Checking in on how the equipment is performing, and being reachable when something looks off, is part of the job.",
    points: ["Performance checked after go-live", "Warranty and service help from one contact", "Local crews in Victoria and NSW"],
    cta: "Talk to us about your home",
    to: "/contact",
    image: houseDusk.url,
    imageAlt: "A home glowing warmly as evening settles",
    origin: "50% 50%",
  },
];

const INVITATION = {
  label: "Next chapter",
  title: ["Your home. A brighter", "next chapter."],
  copy: "Tell us what you're planning. Let's explore the right next step — one upgrade or several.",
  image: houseDuskWarm.url,
  imageAlt: "A family home glowing warmly at dusk",
  origin: "50% 60%",
};

const SCENES = [...CHAPTERS, INVITATION];
const N = SCENES.length;

export function ChapterStrip() {
  const [staticMode, setStaticMode] = useState(false);
  const [active, setActive] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 767px)");
    const update = () => setStaticMode(motion.matches || narrow.matches);
    update();
    motion.addEventListener("change", update);
    narrow.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      narrow.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (staticMode) return;
    let raf = 0;
    let smooth = 0;
    let lastActive = -1;

    const tick = () => {
      const wrap = wrapperRef.current;
      if (wrap) {
        const r = wrap.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        const target = total > 0 ? clamp(-r.top / total) : 0;
        smooth += (target - smooth) * 0.12;
        if (Math.abs(target - smooth) < 0.0002) smooth = target;

        const s = smooth * (N - 1);
        for (let i = 0; i < N; i++) {
          const d = s - i;
          const layer = layerRefs.current[i];
          if (layer) {
            const o = clamp(1 - Math.abs(d) * 1.3);
            layer.style.opacity = String(o);
            layer.style.visibility = o <= 0 ? "hidden" : "visible";
          }
          const img = imgRefs.current[i];
          if (img) {
            // local phase: 0 as the scene enters, 1 as it leaves
            const local = clamp((d + 1) / 2);
            const scale = 1.2 - local * 0.12;
            const drift = (local - 0.5) * (i % 2 ? -2.4 : 2.4);
            img.style.transform = `scale(${scale}) translate3d(${drift}%, ${-drift * 0.4}%, 0)`;
          }
          const copy = copyRefs.current[i];
          if (copy) {
            const f = clamp(1 - (Math.abs(d) - 0.16) / 0.34);
            copy.style.opacity = String(f);
            copy.style.transform = `translate3d(0, ${d > 0 ? -(1 - f) * 34 : (1 - f) * 34}px, 0)`;
            copy.style.visibility = f <= 0.01 ? "hidden" : "visible";
            copy.style.pointerEvents = f > 0.5 ? "auto" : "none";
          }
        }
        if (barRef.current) barRef.current.style.transform = `scaleX(${smooth})`;
        const a = Math.round(s);
        if (a !== lastActive) {
          lastActive = a;
          setActive(clamp(a, 0, N - 1));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [staticMode]);

  const jumpTo = (i: number) => {
    const w = wrapperRef.current;
    if (!w) return;
    const top = w.getBoundingClientRect().top + window.scrollY;
    const total = w.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + total * (i / (N - 1)), behavior: "smooth" });
  };

  if (staticMode) return <StaticStory />;

  return (
    <section className="chapter-section relative bg-charcoal text-ivory" aria-label="A closer look, chapter by chapter">
      <div ref={wrapperRef} className="relative h-[480vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* full-bleed photo scenes */}
          {SCENES.map((scene, i) => (
            <div
              key={scene.image}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className="chapter-scene absolute inset-0 overflow-hidden"
              style={i > 0 ? { opacity: 0, visibility: "hidden" } : undefined}
            >
              <img
                ref={(el) => {
                  imgRefs.current[i] = el;
                }}
                src={scene.image}
                alt={scene.imageAlt}
                className="chapter-scene-img h-full w-full object-cover"
                style={{ transform: "scale(1.2)", transformOrigin: scene.origin }}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <div className="absolute inset-0 bg-charcoal/45" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-charcoal/40" />
            </div>
          ))}

          {/* chapter writing, centred over each photo */}
          {CHAPTERS.map((c, i) => (
            <div
              key={c.id}
              ref={(el) => {
                copyRefs.current[i] = el;
              }}
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
            >
              <div className="chapter-text mx-auto w-full max-w-[1440px] px-5 text-center md:px-8">
                <div className="mx-auto max-w-[680px]">
                  <div className="flex items-center justify-center gap-3">
                    <span className="chapter-kicker">{c.kicker}</span>
                    <span className="h-px w-10 bg-ivory/30" />
                    <span className="font-display text-xs font-bold tracking-[0.28em] text-ivory/50">{c.num}</span>
                  </div>
                  <h3 className="mt-5 font-display font-extrabold tracking-tight text-ivory [font-size:clamp(30px,4.6vw,58px)] [text-shadow:0_2px_24px_rgb(7_16_11/45%)]">
                    {c.title}
                  </h3>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/85">{c.copy}</p>
                  <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                    {c.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-ivory/80">
                        <Check className="size-4 shrink-0 text-leaf" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={c.to}
                    className="group mt-8 inline-flex items-center gap-2 border-b border-ivory/30 pb-1 text-sm font-semibold text-ivory transition-colors hover:border-leaf hover:text-leaf"
                  >
                    {c.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* closing invitation over the dusk photo */}
          <div
            ref={(el) => {
              copyRefs.current[N - 1] = el;
            }}
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <div className="chapter-text mx-auto w-full max-w-[1440px] px-5 text-center md:px-8">
              <div className="mx-auto max-w-[680px]">
                <p className="eyebrow text-amber">One home. Three possibilities.</p>
                <h2 className="mt-5 font-display font-extrabold leading-[1.04] tracking-tight text-ivory [font-size:clamp(34px,5.2vw,72px)] [text-shadow:0_2px_24px_rgb(7_16_11/50%)]">
                  {INVITATION.title[0]}
                  <br />
                  {INVITATION.title[1]}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/85">{INVITATION.copy}</p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
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
                </div>
              </div>
            </div>
          </div>

          {/* progress rail + jump labels */}
          <div className="chapter-rail" aria-hidden="false">
            <div className="relative h-px w-full bg-ivory/15">
              <span ref={barRef} className="absolute inset-0 origin-left bg-leaf" style={{ transform: "scaleX(0)" }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-current={active === i ? "step" : undefined}
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
                    active === i ? "text-leaf" : "text-ivory/35 hover:text-ivory/70",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Narrow screens and reduced-motion visitors: the same chapters, stacked. */
function StaticStory() {
  return (
    <section className="chapter-section bg-charcoal px-5 py-16 text-ivory md:px-8" aria-label="A closer look, chapter by chapter">
      <div className="mx-auto max-w-3xl space-y-10">
        {CHAPTERS.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-3xl bg-charcoal/60 shadow-[0_18px_60px_-30px_rgb(0_0_0/70%)] ring-1 ring-ivory/10">
            <div className="chapter-frame">
              <img src={c.image} alt={c.imageAlt} loading="lazy" />
              <span className="chapter-num">{c.num}</span>
            </div>
            <div className="p-6 md:p-8">
              <p className="chapter-kicker">{c.kicker}</p>
              <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ivory">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/75">{c.copy}</p>
              <ul className="mt-5 space-y-2.5">
                {c.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-ivory/80">
                    <Check className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link to={c.to} className="group mt-6 inline-flex items-center gap-2 border-b border-ivory/25 pb-1 text-sm font-semibold text-ivory hover:text-leaf">
                {c.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}

        {/* closing invitation */}
        <article className="overflow-hidden rounded-3xl ring-1 ring-ivory/10">
          <div className="relative">
            <img src={INVITATION.image} alt={INVITATION.imageAlt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <div className="absolute inset-0 bg-charcoal/45" />
          </div>
          <div className="bg-charcoal px-6 py-10 text-center md:px-10">
            <p className="eyebrow text-amber">One home. Three possibilities.</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-ivory md:text-4xl">
              Your home. A brighter next chapter.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ivory/75">{INVITATION.copy}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="inline-flex items-center rounded-full bg-leaf px-7 py-3.5 text-sm font-semibold text-charcoal">
                Get my personalised quote
              </Link>
              <a href={SITE.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-ivory/30 px-7 py-3.5 text-sm font-semibold text-ivory">
                <Phone className="size-4" aria-hidden="true" />
                Call {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
