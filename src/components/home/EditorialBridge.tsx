import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Droplets, Sun, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, RevealLines } from "@/components/site/Reveal";
import house from "@/assets/house-modern.asset.json";
import solar from "@/assets/solar-macro.asset.json";
import hotwater from "@/assets/heatpump-install.asset.json";
import comfort from "@/assets/lounge.asset.json";

export function EditorialBridge() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = section.current;
    const stage = scene.current;
    if (!root || !stage) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let active = false;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    const update = () => {
      frame = 0;
      const reduced = media.matches || document.documentElement.dataset["reducedMotion"] === "user";
      if (reduced) {
        stage.style.setProperty("--home-progress", "0.6");
        stage.style.setProperty("--home-tilt-x", "0deg");
        stage.style.setProperty("--home-tilt-y", "0deg");
        return;
      }
      const rect = root.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      x += (targetX - x) * 0.1;
      y += (targetY - y) * 0.1;
      stage.style.setProperty("--home-progress", String(progress));
      stage.style.setProperty("--home-tilt-x", `${6 - progress * 10 - y * 5}deg`);
      stage.style.setProperty("--home-tilt-y", `${-8 + progress * 13 + x * 7}deg`);
      if (active && (Math.abs(targetX - x) > 0.005 || Math.abs(targetY - y) > 0.005)) frame = requestAnimationFrame(update);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = stage.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      schedule();
    };
    const leave = () => { targetX = 0; targetY = 0; schedule(); };
    const observer = new IntersectionObserver(([entry]) => {
      active = entry?.isIntersecting ?? false;
      root.dataset["homeVisible"] = String(active);
      if (active) schedule();
    }, { threshold: 0.08 });
    observer.observe(root);
    const preference = new MutationObserver(schedule);
    preference.observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduced-motion"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    media.addEventListener("change", schedule);
    update();
    return () => {
      observer.disconnect(); preference.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
      stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", leave);
      media.removeEventListener("change", schedule);
    };
  }, []);

  return <section ref={section} id="approach" className="home-introduction relative overflow-hidden border-b border-forest-deep/15 py-20 md:py-28">
    <div className="relative z-10 mx-auto max-w-[1440px] px-5 md:px-8">
      <div className="mb-12 flex items-center justify-between gap-4 border-b border-forest-deep/15 pb-5">
        <p className="eyebrow text-forest-deep">Your home. Your possibilities.</p>
        <span className="text-xs text-forest-deep/70">A considered approach</span>
      </div>
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="relative z-10">
          <RevealLines lines={["Better energy starts", "with understanding", "your home."]} className="font-display text-4xl font-extrabold leading-[1.1] tracking-normal text-forest-deep md:text-5xl xl:text-6xl" />
          <Reveal className="mt-7 max-w-lg text-base leading-relaxed text-forest-deep md:text-lg">
            Your roof, your hot water system and the rooms you use every day all shape the right upgrade. Explore the possibilities with Austar Energy and take the next step with a quote tailored to your property.
          </Reveal>
          <Reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-forest-deep/20 pt-5">
            <Button asChild variant="link" className="px-0 font-semibold text-forest-deep hover:text-charcoal"><Link to="/solar"><Sun />Solar<ArrowUpRight /></Link></Button>
            <Button asChild variant="link" className="px-0 font-semibold text-forest-deep hover:text-charcoal"><Link to="/heat-pumps"><Droplets />Hot water<ArrowUpRight /></Link></Button>
            <Button asChild variant="link" className="px-0 font-semibold text-forest-deep hover:text-charcoal"><Link to="/air-conditioning"><Wind />Comfort<ArrowUpRight /></Link></Button>
          </Reveal>
        </div>
        <div className="home-photo-perspective min-w-0">
          <div ref={scene} className="home-photo-scene relative">
            <figure className="home-photo home-photo-house"><img src={house.url} alt="A contemporary Australian home exterior" loading="lazy" decoding="async" /></figure>
            <figure className="home-photo home-photo-solar"><img src={solar.url} alt="Close-up of real solar panel cells" loading="lazy" decoding="async" /><figcaption><Sun />Solar</figcaption></figure>
            <figure className="home-photo home-photo-water"><img src={hotwater.url} alt="Heat pump hot water equipment beside a home" loading="lazy" decoding="async" /><figcaption><Droplets />Hot water</figcaption></figure>
            <figure className="home-photo home-photo-comfort"><img src={comfort.url} alt="A comfortable modern living room" loading="lazy" decoding="async" /><figcaption><Wind />Indoor comfort</figcaption></figure>
          </div>
          <p className="mt-4 text-center text-[11px] text-forest-deep/60">Illustrative photography</p>
        </div>
      </div>
    </div>
  </section>;
}