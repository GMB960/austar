import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Phone, X } from "lucide-react";

import solarThumb from "@/assets/solar-hip-roof.asset.json";
import heatpumpThumb from "@/assets/heatpump-unit.asset.json";
import loungeThumb from "@/assets/lounge.asset.json";
import { LOGO_URL } from "@/lib/brand";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const SOLUTIONS = [
  {
    to: "/solar" as const,
    title: "Solar",
    blurb: "Put your roof to work with a system planned around your property.",
    image: solarThumb.url,
  },
  {
    to: "/heat-pumps" as const,
    title: "Heat pump hot water",
    blurb: "An efficient everyday upgrade for one of your home's essentials.",
    image: heatpumpThumb.url,
  },
  {
    to: "/air-conditioning" as const,
    title: "Air conditioning",
    blurb: "Comfort for the rooms you live in, through every season.",
    image: loungeThumb.url,
  },
];

/**
 * The header starts full height and flush with the page edge, then settles into
 * a shorter, inset capsule once the visitor scrolls — so it keeps its place at
 * the top of the screen without ever covering the story underneath it.
 */
export function SiteHeader() {
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // One scroll listener drives both the compact state and the reading rail.
  useEffect(() => {
    let frame = 0;

    const sync = () => {
      frame = 0;
      const doc = document.documentElement;
      const room = doc.scrollHeight - window.innerHeight;
      const ratio = room > 0 ? Math.min(1, Math.max(0, window.scrollY / room)) : 0;
      if (railRef.current) railRef.current.style.transform = `scaleX(${ratio})`;
      setCompact(window.scrollY > 24);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSolutionsOpen(false);
  }, [pathname]);

  // Escape closes mobile menu; move focus back to the trigger
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    menuPanelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const settle = "transition duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Reading rail: shows how far through the page you are */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden",
            compact ? "opacity-100" : "opacity-0",
            settle,
          )}
        >
          <div ref={railRef} className="h-full origin-left scale-x-0 bg-leaf" />
        </div>

        {/* Soft scrim keeps the nav legible over a bright or busy photograph */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ivory/85 via-ivory/40 to-transparent",
            compact ? "opacity-0" : "opacity-100",
            settle,
          )}
        />

        <div className={cn("mx-auto max-w-[1440px]", compact ? "px-3 md:px-5" : "px-0", settle)}>
          <div
            className={cn(
              "flex items-center justify-between border transition duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              compact
                ? "h-[52px] rounded-full border-charcoal/10 bg-ivory-bright/90 px-2.5 shadow-[0_10px_34px_rgba(16,23,19,0.12)] backdrop-blur-xl md:h-[54px] md:px-3"
                : "h-16 rounded-none border-transparent bg-transparent px-5 md:h-[72px] md:px-8",
            )}
          >
            <Link
              to="/"
              className="flex shrink-0 items-center"
              aria-label={`${SITE.name} home`}
            >
              <span
                className={cn(
                  "flex items-center ring-1 ring-charcoal/10 transition duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  compact
                    ? "rounded-lg bg-ivory-bright px-2 py-1"
                    : "rounded-xl bg-ivory-bright px-2.5 py-1.5 shadow-[0_4px_14px_rgba(16,23,19,0.07)]",
                )}
              >
                <img
                  src={LOGO_URL}
                  alt={`${SITE.name} logo`}
                  className={cn(
                    "w-auto transition duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    compact ? "h-[22px] md:h-6" : "h-8 md:h-9",
                  )}
                  width={200}
                  height={74}
                />
              </span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Primary" className="hidden items-center md:flex">
              <div
                className="relative"
                onMouseEnter={() => setSolutionsOpen(true)}
                onMouseLeave={() => setSolutionsOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={solutionsOpen}
                  aria-haspopup="true"
                  onClick={() => setSolutionsOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 rounded-full text-sm font-medium transition-colors hover:bg-charcoal/5",
                    compact ? "px-3 py-1.5" : "px-4 py-2",
                  )}
                >
                  Solutions
                  <ChevronDown
                    className={cn("size-4 transition-transform", solutionsOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={cn(
                    "absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3 transition-all duration-200",
                    solutionsOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-1 opacity-0",
                  )}
                >
                  <div className="glass rounded-2xl p-2 shadow-[0_16px_48px_rgba(16,23,19,0.14)]">
                    {SOLUTIONS.map((s) => (
                      <Link
                        key={s.to}
                        to={s.to}
                        className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-charcoal/5"
                      >
                        <span className="mask-round h-14 w-20 shrink-0 bg-sage">
                          <img
                            src={s.image}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            width={80}
                            height={56}
                          />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-foreground">
                            {s.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">{s.blurb}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <HeaderLink to="/" hash="journey" label="Our approach" compact={compact} />
              <HeaderLink to="/about" label="About" compact={compact} />
              <HeaderLink to="/contact" label="Contact" compact={compact} />

              <span
                aria-hidden="true"
                className={cn(
                  "mx-1 h-5 w-px bg-charcoal/12 transition-opacity duration-500",
                  compact ? "opacity-100" : "opacity-0",
                )}
              />

              <Link
                to="/contact"
                className={cn(
                  "ml-2 inline-flex items-center gap-2 rounded-full bg-leaf font-semibold text-charcoal transition-all duration-200 hover:bg-leaf-soft hover:shadow-[0_6px_20px_rgba(104,169,67,0.35)]",
                  compact
                    ? "px-4 py-1.5 text-[13px]"
                    : "px-5 py-2.5 text-sm",
                )}
              >
                Get a free quote
              </Link>
            </nav>

            {/* Mobile trigger */}
            <button
              ref={menuButtonRef}
              type="button"
              className={cn(
                "inline-flex items-center justify-center rounded-full transition duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
                compact ? "size-9 bg-ivory-bright ring-1 ring-charcoal/10" : "glass size-11",
              )}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          ref={menuPanelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-40 flex flex-col bg-ivory md:hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-40 pt-24">
            <p className="eyebrow mb-4 text-stone">Solutions</p>
            <div className="space-y-1">
              {SOLUTIONS.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="flex items-center justify-between rounded-2xl bg-ivory-bright px-5 py-4 text-lg font-semibold text-foreground"
                >
                  {s.title}
                  <span aria-hidden="true" className="text-stone">→</span>
                </Link>
              ))}
            </div>
            <p className="eyebrow mb-4 mt-10 text-stone">Explore</p>
            <div className="space-y-1">
              <Link to="/" className="block rounded-2xl px-5 py-4 text-lg font-semibold text-foreground">
                Home
              </Link>
              <Link
                to="/"
                hash="journey"
                className="block rounded-2xl px-5 py-4 text-lg font-semibold text-foreground"
              >
                Our approach
              </Link>
              <Link to="/about" className="block rounded-2xl px-5 py-4 text-lg font-semibold text-foreground">
                About
              </Link>
              <Link to="/contact" className="block rounded-2xl px-5 py-4 text-lg font-semibold text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal/10 bg-ivory-bright/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-leaf text-sm font-semibold text-charcoal"
          >
            Get a quote
          </Link>
          <a
            href={SITE.phoneHref}
            aria-label={`Call ${SITE.phoneDisplay}`}
            className="neu-press inline-flex size-12 items-center justify-center rounded-full text-forest"
          >
            <Phone className="size-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  );
}

function HeaderLink({
  to,
  hash,
  label,
  compact,
}: {
  to: string;
  hash?: string;
  label: string;
  compact: boolean;
}) {
  return (
    <Link
      to={to}
      {...(hash ? { hash } : {})}
      className={cn(
        "rounded-full text-sm font-medium transition-colors hover:bg-charcoal/5",
        compact ? "px-3 py-1.5" : "px-4 py-2",
      )}
      activeProps={{ className: "text-forest font-semibold" }}
    >
      {label}
    </Link>
  );
}
