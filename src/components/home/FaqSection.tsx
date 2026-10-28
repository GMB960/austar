import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Phone, ShieldCheck, Sun, Droplets, Wind } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { COLD_CALL_NOTICE, OFFERS_NOTICE, SITE } from "@/lib/site";
import solar from "@/assets/solar-hip-roof.asset.json";
import hotwater from "@/assets/heatpump-install.asset.json";
import comfort from "@/assets/lounge.asset.json";

const questions = [
  { id: "services", topic: "Planning", q: "Which services can I enquire about?", a: "Solar installation, heat pump hot water and air conditioning — for homes and business premises. You can discuss one upgrade or several in the same enquiry.", points: ["Solar: your roof and electricity use", "Hot water: your existing system and household needs", "Air conditioning: the rooms you want to heat or cool"] },
  { id: "postcode", topic: "Planning", q: "Do you service my postcode?", a: "Austar Energy works across Victoria and New South Wales. Availability varies by location and the upgrade you need, so a state-wide service region does not guarantee every postcode is covered.", points: ["Share your postcode and property type", "Tell us which upgrade you are considering", "Ask us to confirm availability before making plans"] },
  { id: "quote", topic: "Planning", q: "What information helps with a quote?", a: "Start with your postcode, property type and the service you are interested in. Details of your existing equipment help the team understand your home and discuss suitable options.", points: ["Solar: roof type, shading and a recent electricity bill", "Hot water: current system type, capacity and installation location", "Air conditioning: room sizes and details of any existing units"] },
  { id: "combined", topic: "Planning", q: "Can I ask about more than one upgrade?", a: "Yes. You can discuss solar, hot water and air conditioning together. Explain your priorities — such as replacing ageing equipment, improving comfort or exploring your energy use — so each upgrade can be considered in context.", points: ["List all the upgrades you are considering", "Mention any urgent replacement needs", "Ask about options for doing the work in stages"] },
  { id: "prepare", topic: "Planning", q: "What should I check before installation?", a: "Before agreeing to work, ask the team to explain the proposed equipment, installation requirements and what is included in your quote. Property conditions can affect the final approach.", points: ["Confirm the equipment model and proposed location", "Ask about access, electrical work and removal of old equipment", "Review warranty details, exclusions and any required approvals"] },
  { id: "offer", topic: "Offers", q: "How do I find out whether an offer applies?", a: OFFERS_NOTICE, points: ["Request an eligibility review for your property", "Provide accurate details about the existing system", "Confirm applicable conditions before committing"] },
  { id: "savings", topic: "Offers", q: "Will an upgrade reduce my energy bills?", a: "The outcome depends on your current equipment, household usage, system selection and energy tariffs. Solar output also depends on roof orientation, shading and weather. A specific saving cannot be confirmed from a general website estimate.", points: ["Share recent energy bills and typical usage", "Ask which assumptions are used in any estimate", "Compare upfront costs with expected running costs"] },
  { id: "caller", topic: "Trust", q: "How can I check whether a caller represents Austar Energy?", a: COLD_CALL_NOTICE, points: ["Do not share payment details with an unverified caller", `Call ${SITE.phoneDisplay} using the number on this website`, `Or contact ${SITE.emailGeneral}`] },
];
const topics = ["All questions", "Planning", "Offers", "Trust"] as const;

export function FaqSection() {
  const [topic, setTopic] = useState<string>("All questions");
  const [open, setOpen] = useState("services");
  const deck = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = deck.current;
    const root = section.current;
    if (!el || !root) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (motion.matches) { el.style.transform = "none"; return; }
      const rect = root.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      el.style.transform = `perspective(1100px) rotateX(${10 - p * 16}deg) rotateY(${-13 + p * 22}deg) translateY(${24 - p * 40}px)`;
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    motion.addEventListener("change", scroll);
    return () => { window.removeEventListener("scroll", scroll); motion.removeEventListener("change", scroll); cancelAnimationFrame(frame); };
  }, []);
  const shown = questions.filter(q => topic === "All questions" || q.topic === topic);
  return <section ref={section} id="questions" className="overflow-hidden border-t border-border bg-background py-20 md:py-28">
    <div className="mx-auto max-w-[1440px] px-5 md:px-8">
      <div className="mb-12 flex items-center justify-between border-b border-border pb-5"><p className="eyebrow text-primary">A little clarity</p><span className="text-xs text-muted-foreground">Before your next upgrade</span></div>
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-[1.1] tracking-normal md:text-5xl">Good questions.<br /><span className="text-primary">Clearer possibilities.</span></h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">From choosing an upgrade to checking eligibility — the details that help you take the next step with confidence.</p>
          <div ref={deck} className="faq-photo-deck relative mx-auto mt-10 h-[270px] w-full max-w-[410px]">
            <figure className="faq-photo faq-photo-back"><img src={hotwater.url} alt="Heat pump hot water equipment installed beside a home" loading="lazy" /><figcaption><Droplets className="size-4" />Hot water</figcaption></figure>
            <figure className="faq-photo faq-photo-middle"><img src={comfort.url} alt="Comfortable modern living room" loading="lazy" /><figcaption><Wind className="size-4" />Indoor comfort</figcaption></figure>
            <figure className="faq-photo faq-photo-front"><img src={solar.url} alt="Real solar panels on a residential roof" loading="lazy" /><figcaption><Sun className="size-4" />Solar</figcaption></figure>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Illustrative photography</p>
          <div className="mt-8 flex items-start gap-3 border-t border-border pt-6"><ShieldCheck className="mt-1 size-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Advice specific to your home.</p><p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">Your location, property and existing system all matter. Ask us to review your circumstances.</p></div></div>
          <Button asChild variant="link" className="mt-3 h-10 px-0"><Link to="/contact">Ask your own question<ArrowUpRight /></Link></Button>
        </div>
        <div className="min-w-0">
          <div role="group" aria-label="Question topics" className="mb-6 flex flex-wrap gap-2">
            {topics.map(t => <Button key={t} variant={topic === t ? "default" : "outline"} aria-pressed={topic === t} onClick={() => { setTopic(t); setOpen(questions.find(q => t === "All questions" || q.topic === t)?.id ?? ""); }} className="h-10 px-4">{t}</Button>)}
          </div>
          <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
            {shown.map(q => <AccordionItem key={q.id} value={q.id} className="faq-answer border-border data-[state=open]:border-primary/30">
              <AccordionTrigger className="gap-4 py-6 font-display text-base font-semibold leading-relaxed hover:no-underline data-[state=open]:text-primary"><span className="flex items-start gap-4"><span className="pt-1 font-sans text-[10px] font-normal text-muted-foreground">{String(questions.indexOf(q) + 1).padStart(2, "0")}</span>{q.q}</span></AccordionTrigger>
              <AccordionContent className="pl-7 pr-4 pb-6"><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{q.a}</p><ul className="mt-4 space-y-2.5">{q.points.map(point => <li key={point} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" />{point}</li>)}</ul></AccordionContent>
            </AccordionItem>)}
          </Accordion>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><p className="text-xs text-muted-foreground">Prefer a conversation?</p><Button asChild variant="link" className="px-0"><a href={SITE.phoneHref}><Phone />{SITE.phoneDisplay}</a></Button></div>
        </div>
      </div>
    </div>
  </section>;
}