/**
 * Scroll-driven chapter strip for the closing section.
 *
 * A pinned viewport with a horizontal filmstrip of real photographs. Vertical
 * scrolling moves the strip sideways; each panel carries its own writing.
 * Panels tilt away in 3D as they leave, the photo inside parallaxes against
 * its frame, and the copy fades/lifts in as a panel centres. The last panel
 * is the invitation to talk.
 *
 * One rAF loop writes styles directly (no React state per frame, no WebGL).
 * Narrow screens and reduced-motion visitors get the same panels stacked
 * vertically with ordinary scroll reveals.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Phone } from "lucide-react";

import { Reveal, RevealLines } from "@/components/site/Reveal";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

import solarTiledRoof from "@/assets/solar-tiled-roof.asset.json";
import heatpumpInstall from "@/assets/heatpump-install.asset.json";
import kitchen from "@/assets/kitchen.asset.json";
import solarInstaller from "@/assets/solar-installer.asset.json";
import houseDusk from "@/assets/house-dusk.asset.json";

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
  },
];

const PANELS = CHAPTERS.length + 1; // chapters + closing invitation

export function ChapterStrip() {
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const photoRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLSpanElement>(null);

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
    let narrow = false;

    const tick = () => {
      const wrap = wrapperRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      if (wrap && stage && track) {
        narrow = window.innerWidth < 768;
        if (narrow) {
          if (track.style.transform) {
            track.style.transform = "";
            panelRefs.current.forEach((el) => {
              if (el) {
                el.style.transform = "";
                el.style.opacity = "";
                el.style.visibility = "";
              }
            });
            textRefs.current.forEach((el) => {
              if (el) {
                el.style.opacity = "";
                el.style.transform = "";
                el.style.pointerEvents = "";
              }
            });
          }
        } else {
          const r = wrap.getBoundingClientRect();
          const total = r.height - window.innerHeight;
          const target = total > 0 ? clamp(-r.top / total) : 0;
          smooth += (target - smooth) * 0.11;
          if (Math.abs(target - smooth) < 0.0002) smooth = target;

          const width = stage.clientWidth;
          const p = smooth * (PANELS - 1);
          track.style.transform = `translate3d(${-p * width}px, 0, 0)`;

          for (let i = 0; i < PANELS; i++) {
            const off = i - p;
            const a = Math.abs(off);
            const panel = panelRefs.current[i];
            if (panel) {
              const sink = clamp(a, 0, 1);
              panel.style.transform = `translate3d(${clamp(off, -1.4, 1.4) * 26}px, 0, ${-sink * 190}px) rotateY(${clamp(off, -1.4, 1.4) * -9}deg) scale(${1 - sink * 0.07})`;
              panel.style.opacity = String(1 - sink * 0.72);
              panel.style.visibility = a > 1.7 ? "hidden" : "visible";
            }
            const photo = photoRefs.current[i];
            if (photo) {
              photo.style.transform = `translate3d(${clamp(off, -1.6, 1.6) * -7}%, 0, 0) scale(${1.14 - clamp(a, 0, 1) * 0.06})`;
            }
            const text = textRefs.current[i];
            if (text) {
              const f = clamp(1 - a * 1.7);
              text.style.opacity = String(f);
              text.style.transform = `translate3d(0, ${(1 - f) * 42}px, 0)`;
              text.style.pointerEvents = f > 0.55 ? "auto" : "none";
            }
          }

          if (railRef.current) railRef.current.style.transform = `scaleX(${smooth})`;

          const a = Math.round(p);
          if (a !== lastActive) {
            lastActive = a;
            setActive(clamp(a, 0, PANELS - 1));
          }
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
    const top = w.getBoundingClientRect().top + window.scrollY;
    const total = w.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + total * (i / (PANELS - 1)), behavior: "smooth" });
  };

  return (
    <section
      className={cn("relative bg-charcoal text-ivory", !reduced && "md:h-[480vh]")}
      aria-label="A closer look, chapter by chapter"
    >
      <div
        ref={wrapperRef}
        className={cn("relative", !reduced && "md:h-[480vh]")}
      >
        <div
          ref={stageRef}
          className={cn(
            "chapter-stage",
            !reduced && "md:sticky md:top-0 md:h-[100svh] md:overflow-hidden",
          )}
        >
          <div
            ref={trackRef}
            className="chapter-track flex flex-col md:h-full md:flex-row"
          >
            {CHAPTERS.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className="chapter-panel w-full shrink-0 md:flex md:h-full md:w-screen md:items-center"
                aria-roledescription="slide"
                aria-label={`${c.num} — ${c.label}`}
              >
                <div className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-8 md:py-0">
                  <figure className="chapter-frame">
                    <img
                      ref={(el) => {
                        photoRefs.current[i] = el;
                      }}
                      src={c.image}
                      alt={c.imageAlt}
                      loading="lazy"
                    />
                    <span className="chapter-num">{c.num}</span>
                    <figcaption className="sr-only">{c.label}</figcaption>
                  </figure>

                  <div
                    ref={(el) => {
                      textRefs.current[i] = el;
                    }}
                    className="chapter-text max-w-[560px]"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="chapter-kicker">{c.kicker}</span>
                      <span className="h-px flex-1 bg-ivory/20" />
                      <span className="font-display text-xs font-bold tracking-[0.28em] text-ivory/40">
                        {c.num}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display font-extrabold tracking-tight text-ivory [font-size:clamp(26px,3.1vw,46px)]">
                      {c.title}
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-ivory/75">{c.copy}</p>
                    <ul className="mt-7 space-y-3">
                      {c.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-sm text-ivory/80">
                          <Check className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={c.to}
                      className="group mt-8 inline-flex items-center gap-2 border-b border-ivory/25 pb-1 text-sm font-semibold text-ivory transition-colors hover:border-leaf hover:text-leaf"
                    >
                      {c.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Closing invitation */}
            <div
              ref={(el) => {
                panelRefs.current[PANELS - 1] = el;
              }}
              className="chapter-panel w-full shrink-0 md:flex md:h-full md:w-screen md:items-center"
              aria-label="Get in touch"
            >
              <div className="mx-auto w-full max-w-[1440px] px-5 py-16 text-center md:px-8 md:py-0">
                <div
                  ref={(el) => {
                    textRefs.current[PANELS - 1] = el;
                  }}
                  className="chapter-text mx-auto max-w-[620px]"
                >
                  <h2 className="font-display font-extrabold tracking-tight text-ivory [font-size:clamp(34px,5vw,72px)]">
                    Your home. A brighter
                    <br />
                    next chapter.
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/75">
                    Tell us what you're planning. Let's explore the right next step — one upgrade or several.
                  </p>
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
          </div>

          {/* progress rail + jump labels */}
          <div className="chapter-rail" aria-hidden="true">
            <div className="relative h-px w-full bg-ivory/15">
              <span
                ref={railRef}
                className="absolute inset-0 origin-left bg-leaf"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <div className="mt-3 hidden gap-5 md:flex">
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  tabIndex={-1}
                  onClick={() => jumpTo(i)}
                  className={cn(
                    "text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors",
                    active === i ? "text-leaf" : "text-ivory/35",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Narrow screens / reduced motion: the same chapters, stacked */}
      <div className="md:hidden">
        {CHAPTERS.map((c) => (
          <div key={c.id} className="border-t border-ivory/10 px-5 py-14">
            <Reveal>
              <figure className="overflow-hidden rounded-2xl border border-ivory/15">
                <img src={c.image} alt={c.imageAlt} loading="lazy" className="h-56 w-full object-cover" />
              </figure>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="chapter-kicker">{c.kicker}</span>
                <span className="h-px flex-1 bg-ivory/20" />
                <span className="font-display text-xs font-bold tracking-[0.28em] text-ivory/40">{c.num}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ivory">{c.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ivory/75">{c.copy}</p>
              <ul className="mt-5 space-y-2.5">
                {c.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-ivory/80">
                    <Check className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                to={c.to}
                className="mt-6 inline-flex items-center gap-2 border-b border-ivory/25 pb-1 text-sm font-semibold text-ivory hover:border-leaf hover:text-leaf"
              >
                {c.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        ))}
        <div className="border-t border-ivory/10 px-5 py-16 text-center">
          <RevealLines
            lines={["Your home. A brighter", "next chapter."]}
            className="font-display font-extrabold tracking-tight text-ivory [font-size:clamp(30px,9vw,44px)]"
          />
          <Reveal className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ivory/75">
            Tell us what you're planning. Let's explore the right next step — one upgrade or several.
          </Reveal>
          <Reveal delay={120} className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full bg-leaf px-7 py-3.5 text-sm font-semibold text-charcoal"
            >
              Get my personalised quote
            </Link>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-ivory/30 bg-ivory/5 px-7 py-3.5 text-sm font-semibold text-ivory"
            >
              <Phone className="size-4" aria-hidden="true" />
              Call {SITE.phoneDisplay}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
