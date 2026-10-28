import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import { LOGO_URL } from "@/lib/brand";
import { COLD_CALL_NOTICE, SITE } from "@/lib/site";

const SERVICE_LINKS = [
  { to: "/solar", label: "Solar" },
  { to: "/heat-pumps", label: "Heat pump hot water" },
  { to: "/air-conditioning", label: "Air conditioning" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-charcoal text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-16 md:px-8 md:pb-12 md:pt-24">
        {/* Contact strip */}
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <span className="inline-flex items-center rounded-lg bg-ivory px-3 py-2">
              <img src={LOGO_URL} alt={`${SITE.name} logo`} className="h-8 w-auto" width={200} height={74} />
            </span>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/70">
              Solar, heat pump hot water and air conditioning for homes across Victoria and
              New South Wales. Service availability varies by location and upgrade.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow text-ivory/50">Talk to us</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={SITE.phoneHref} className="inline-flex items-center gap-2 text-ivory hover:text-leaf-soft">
                  <Phone className="size-4 text-leaf" aria-hidden="true" />
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.emailGeneral}`} className="inline-flex items-center gap-2 text-ivory hover:text-leaf-soft">
                  <Mail className="size-4 text-leaf" aria-hidden="true" />
                  {SITE.emailGeneral}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.emailSales}`} className="inline-flex items-center gap-2 text-ivory hover:text-leaf-soft">
                  <Mail className="size-4 text-leaf" aria-hidden="true" />
                  {SITE.emailSales}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow text-ivory/50">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SERVICE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-ivory/80 transition-colors hover:text-leaf-soft">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow text-ivory/50">Where we are</p>
            <ul className="mt-4 space-y-4 text-xs leading-relaxed text-ivory/70">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
                {SITE.addresses.nsw}
              </li>
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
                {SITE.addresses.vic}
              </li>
            </ul>
          </div>
        </div>

        {/* Customer notice */}
        <div className="mt-14 rounded-2xl border border-ivory/10 bg-ivory/5 p-5 text-xs leading-relaxed text-ivory/70">
          {COLD_CALL_NOTICE}
        </div>

        {/* Quiet wordmark */}
        <div className="mt-16 select-none border-t border-ivory/10 pt-10 md:mt-20" aria-hidden="true">
          <p className="font-display text-[clamp(3rem,12vw,10rem)] font-extrabold leading-none tracking-tight text-ivory/[0.08]">
            Austar Energy
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-[11px] text-ivory/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. {SITE.regions}.</p>
          <p className="max-w-xl md:text-right">
            Policies and terms reference the published{" "}
            <a href={SITE.existingSite} className="underline underline-offset-2 hover:text-ivory/70">
              {SITE.name} website
            </a>
            .
          </p>
        </div>
      </div>
      {/* Space for the sticky mobile CTA */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </footer>
  );
}
