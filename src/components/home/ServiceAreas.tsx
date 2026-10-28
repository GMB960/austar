import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import house from "@/assets/house-modern.asset.json";

const MapScene = lazy(() => import("./ServiceAreaScene"));

export function ServiceAreas() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<"NSW" | "VIC">("NSW");
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    observer.observe(el);
    const update = () => {
      const rect = el.getBoundingClientRect();
      progress.current = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", update); };
  }, []);
  const name = selected === "NSW" ? "New South Wales" : "Victoria";
  const address = selected === "NSW" ? SITE.addresses.nsw : SITE.addresses.vic;
  return (
    <section ref={section} id="service-areas" className="atlas-section relative overflow-hidden bg-charcoal text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
        <div className="flex items-center justify-between border-b border-ivory/15 pb-5">
          <p className="eyebrow flex items-center gap-3 text-leaf-soft"><MapPin className="size-4" />Where we work</p>
          <span className="text-xs text-ivory/50">02 states. One local approach.</span>
        </div>
        <div className="grid items-center gap-8 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-extrabold leading-[1.12] tracking-normal md:text-5xl">Closer to home.<br /><span className="text-leaf-soft">Across VIC & NSW.</span></h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/70">Solar, heat pump hot water and indoor comfort — with contact points in Melbourne and Moorebank.</p>
            <div className="mt-9 flex gap-1 border-b border-ivory/15" role="tablist" aria-label="Service region">
              {(["NSW", "VIC"] as const).map(state => <Button key={state} role="tab" id={`region-tab-${state}`} aria-controls="region-detail" aria-selected={selected === state} variant="ghost" onClick={() => setSelected(state)}
                className={`h-12 flex-1 rounded-none border-b-2 px-3 text-sm hover:bg-ivory/5 hover:text-ivory ${selected === state ? "border-leaf text-leaf-soft" : "border-transparent text-ivory/50"}`}>
                <span className={`size-2 rounded-full ${state === "NSW" ? "bg-leaf" : "bg-amber"}`} />{state === "NSW" ? "New South Wales" : "Victoria"}
              </Button>)}
            </div>
            <div id="region-detail" role="tabpanel" aria-labelledby={`region-tab-${selected}`} className="min-h-[152px] pt-6">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 size-5 shrink-0 text-leaf-soft" />
                <div><h3 className="font-display text-lg font-semibold tracking-normal">{name}</h3><p className="mt-2 max-w-xs text-sm leading-relaxed text-ivory/65">{address}</p></div>
                <Button asChild variant="ghost" size="icon" className="ml-auto shrink-0 text-ivory/60 hover:bg-ivory/10 hover:text-ivory"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${name} office on Google Maps`}><ArrowUpRight /></a></Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-12 bg-leaf px-5 text-charcoal hover:bg-leaf-soft"><Link to="/contact">Check your location<ArrowRight /></Link></Button>
              <Button asChild variant="ghost" className="h-12 px-3 text-ivory hover:bg-ivory/10 hover:text-ivory"><a href={SITE.phoneHref}><Phone />{SITE.phoneDisplay}</a></Button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ivory/45">Service availability varies by location and upgrade.</p>
          </div>
          <div className="relative min-w-0">
            <div data-map-scene className="atlas-canvas relative h-[420px] w-full md:h-[520px]" aria-label="Dimensional Australia map highlighting New South Wales and Victoria">
              {visible && <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-sm text-ivory/50">Australia · VIC & NSW</div>}><MapScene selected={selected} onSelect={setSelected} progress={progress} /></Suspense>}
            </div>
            <div className="relative flex justify-center gap-6 text-[11px] text-ivory/60"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-leaf" />New South Wales</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber" />Victoria</span></div>
          </div>
        </div>
        <div className="mt-12 grid items-center gap-5 border-t border-ivory/15 pt-6 sm:grid-cols-[112px_1fr_auto]">
          <img src={house.url} alt="Modern Australian home" loading="lazy" className="h-[72px] w-28 rounded-md object-cover" />
          <div><p className="font-display text-lg font-semibold tracking-normal">Your home. Your next possibility.</p><p className="mt-1 text-xs leading-relaxed text-ivory/55">Explore the right energy upgrade for your property.</p></div>
          <Button asChild variant="ghost" className="justify-start px-0 text-leaf-soft hover:bg-transparent hover:text-ivory"><Link to="/contact">Get a personalised quote<ArrowUpRight /></Link></Button>
        </div>
      </div>
    </section>
  );
}