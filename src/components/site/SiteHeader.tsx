import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Phone, X } from "lucide-react";

import { LOGO_URL } from "@/lib/brand";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const SOLUTIONS = [
  {
    to: "/solar" as const,
    title: "Solar",
    blurb: "Put your roof to work with a system planned around your property.",
    image: "solar-hip-roof",
  },
  {
    to: "/heat-pumps" as const,
    title: "Heat pump hot water",
    blurb: "An efficient everyday upgrade for one of your home's essentials.",
    image: "heatpump-unit",
  },
  {
    to: "/air-conditioning" as const,
    title: "Air conditioning",
    blurb: "Comfort for the rooms you live in, through every season.",
    image: "lounge",
  },
];

const SOLUTION_IMAGES: Record<string, string> = {
  "solar-hip-roof": "",
  "heatpump-unit": "",
  lounge: "",
};

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "glass shadow-[0_2px_24px_rgba(16,23,19,0.08)]" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[72px] md:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label={`${SITE.name} home`}>
            <span className="flex items-center rounded-lg bg-ivory-bright/90 px-2.5 py-1.5">
              <img
                src={LOGO_URL}
                alt={`${SITE.name} logo`}
                className="h-6 w-auto md:h-7"
                width={200}
                height={74}
              />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
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
                  "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  "hover:bg-charcoal/5",
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
                          src={SOLUTION_IMAGES[s.image]}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          width={80}
                          height={56}
                        />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{s.title}</span>
                        <span className="block text-xs text-muted-foreground">{s.blurb}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <HeaderLink to="/#journey" label="Our approach" />
            <HeaderLink to="/about" label="About" />
            <HeaderLink to="/contact" label="Contact" />

            <Link
              to="/contact"
              className="ml-3 inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-charcoal transition-all duration-200 hover:bg-leaf-soft hover:shadow-[0_6px_20px_rgba(104,169,67,0.35)]"
            >
              Get a free quote
            </Link>
          </nav>

          {/* Mobile trigger */}
          <button
            ref={menuButtonRef}
            type="button"
            className="glass inline-flex size-11 items-center justify-center rounded-full md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
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
                to="/#journey"
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

function HeaderLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-charcoal/5"
      activeProps={{ className: "text-forest font-semibold" }}
    >
      {label}
    </Link>
  );
}
