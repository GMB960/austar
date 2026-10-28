import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Phone, Mail, Send } from "lucide-react";

import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Three-step enquiry: services → property → contact.
 *
 * Honesty rule: "Enquiry sent" is only ever shown after a real backend
 * acknowledges delivery. Until an endpoint is configured, the form explains
 * that online submission is unavailable and offers working phone/email
 * actions — it never simulates success.
 */

type EnquiryData = {
  services: string[];
  enquiryType: "homeowner" | "business";
  postcode: string;
  existingSystem: string;
  name: string;
  phone: string;
  email: string;
  preferredContact: "phone" | "email";
  consent: boolean;
};

const EMPTY: EnquiryData = {
  services: [],
  enquiryType: "homeowner",
  postcode: "",
  existingSystem: "",
  name: "",
  phone: "",
  email: "",
  preferredContact: "phone",
  consent: false,
};

const SERVICE_OPTIONS = [
  { id: "solar", label: "Solar" },
  { id: "heat-pumps", label: "Heat pump hot water" },
  { id: "air-conditioning", label: "Air conditioning" },
  { id: "advice", label: "Not sure — I'd like guidance" },
];

const STEPS = ["Your interest", "Your property", "Your details"] as const;

/** Australian landline/mobile, loosely: 8–12 digits after normalising. */
function isValidAuPhone(v: string) {
  const digits = v.replace(/[^\d]/g, "");
  return digits.length >= 8 && digits.length <= 12;
}

function isValidPostcode(v: string) {
  return /^\d{4}$/.test(v.trim());
}

export function QuoteForm({ initialServices }: { initialServices?: string[] }) {
  const [data, setData] = useState<EnquiryData>({
    ...EMPTY,
    services: initialServices ?? [],
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "unavailable">("idle");

  const mailtoHref = useMemo(() => {
    const services = data.services.length
      ? data.services.map((s) => SERVICE_OPTIONS.find((o) => o.id === s)?.label ?? s).join(", ")
      : "General enquiry";
    const body = [
      `Services of interest: ${services}`,
      `Enquiry type: ${data.enquiryType}`,
      `Postcode: ${data.postcode}`,
      data.existingSystem ? `Existing system notes: ${data.existingSystem}` : "",
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email}`,
      `Preferred contact: ${data.preferredContact}`,
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:${SITE.emailSales}?subject=${encodeURIComponent("Quote enquiry — Austar Energy")}&body=${encodeURIComponent(body)}`;
  }, [data]);

  const validateStep = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 0 && data.services.length === 0) {
      next.services = "Choose at least one option, or select guidance.";
    }
    if (s === 1) {
      if (!isValidPostcode(data.postcode)) next.postcode = "Enter a four-digit Australian postcode.";
    }
    if (s === 2) {
      if (!data.name.trim()) next.name = "Enter your name.";
      if (!isValidAuPhone(data.phone)) next.phone = "Enter a valid Australian phone number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = "Enter a valid email address.";
      if (!data.consent) next.consent = "We need your consent to respond to this enquiry.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    // Final step: attempt submission. No backend endpoint is configured yet,
    // so we show the honest fallback rather than a simulated success.
    setStatus("submitting");
    window.setTimeout(() => setStatus("unavailable"), 500);
  };

  const toggleService = (id: string) => {
    setData((d) => ({
      ...d,
      services: d.services.includes(id) ? d.services.filter((s) => s !== id) : [...d.services, id],
    }));
  };

  if (status === "unavailable") {
    return (
      <div className="rounded-3xl border border-amber/60 bg-amber-soft/40 p-7 md:p-9">
        <h3 className="font-display text-xl font-bold text-charcoal">Let's finish this by phone or email</h3>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
          Online enquiry submission isn't connected for this site yet, so we can't accept your details
          through this form right now — we'd rather say that than pretend it was sent. Everything you
          can tell us by phone or email is the same:
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-charcoal/80">
          <li>• {data.services.length ? `Interest: ${data.services.map((s) => SERVICE_OPTIONS.find((o) => o.id === s)?.label).join(", ")}` : "Interest: general enquiry"}</li>
          <li>• Postcode: {data.postcode || "—"}</li>
          <li>• {data.enquiryType === "business" ? "Business premises" : "Homeowner"} enquiry</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={SITE.phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory"
          >
            <Phone className="size-4" aria-hidden="true" />
            Call {SITE.phoneDisplay}
          </a>
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/25 px-6 py-3 text-sm font-semibold text-charcoal"
          >
            <Mail className="size-4" aria-hidden="true" />
            Email us your enquiry
          </a>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setStep(2);
          }}
          className="mt-6 text-xs font-semibold text-forest underline underline-offset-2"
        >
          Back to the form
        </button>
      </div>
    );
  }

  return (
    <div className="neu-raise p-6 md:p-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-forest/80">Request an eligibility review</p>
        <p className="text-xs font-semibold text-stone">
          Step {step + 1} of 3 — {STEPS[step]}
        </p>
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-leaf" : "bg-charcoal/10")}
          />
        ))}
      </div>

      {step === 0 && (
        <fieldset className="mt-7">
          <legend className="font-display text-lg font-bold text-charcoal">What are you exploring?</legend>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {SERVICE_OPTIONS.map((o) => {
              const active = data.services.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggleService(o.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all",
                    active
                      ? "border-leaf bg-leaf/10 text-charcoal shadow-[0_4px_16px_rgba(104,169,67,0.2)]"
                      : "border-border bg-ivory-bright hover:border-charcoal/30",
                  )}
                >
                  {o.label}
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border",
                      active ? "border-leaf bg-leaf text-white" : "border-charcoal/25",
                    )}
                  >
                    {active && <Check className="size-3" aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>
          {errors["services"] && <FieldError message={errors["services"]} />}
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="mt-7 space-y-5">
          <legend className="font-display text-lg font-bold text-charcoal">About your property</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-charcoal/70">Postcode</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={data.postcode}
                onChange={(e) => setData((d) => ({ ...d, postcode: e.target.value.replace(/[^\d]/g, "") }))}
                placeholder="e.g. 2170"
                className="w-full rounded-xl border border-input bg-ivory-bright px-4 py-3 text-sm outline-none focus:border-leaf"
              />
              {errors["postcode"] && <FieldError message={errors["postcode"]} />}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-charcoal/70">This enquiry is for</span>
              <select
                value={data.enquiryType}
                onChange={(e) => setData((d) => ({ ...d, enquiryType: e.target.value as EnquiryData["enquiryType"] }))}
                className="w-full rounded-xl border border-input bg-ivory-bright px-4 py-3 text-sm outline-none focus:border-leaf"
              >
                <option value="homeowner">My home</option>
                <option value="business">A business premises</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-charcoal/70">
              Existing system notes <span className="font-normal text-stone">(optional — helps us prepare)</span>
            </span>
            <textarea
              rows={3}
              value={data.existingSystem}
              onChange={(e) => setData((d) => ({ ...d, existingSystem: e.target.value }))}
              placeholder="e.g. gas storage hot water, 3-year-old solar feed-in setup, ducted heating…"
              className="w-full rounded-xl border border-input bg-ivory-bright px-4 py-3 text-sm outline-none focus:border-leaf"
            />
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="mt-7 space-y-4">
          <legend className="font-display text-lg font-bold text-charcoal">How can we reach you?</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-charcoal/70">Name</span>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                className="w-full rounded-xl border border-input bg-ivory-bright px-4 py-3 text-sm outline-none focus:border-leaf"
              />
              {errors["name"] && <FieldError message={errors["name"]} />}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-charcoal/70">Phone</span>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                placeholder="04.. ..."
                className="w-full rounded-xl border border-input bg-ivory-bright px-4 py-3 text-sm outline-none focus:border-leaf"
              />
              {errors["phone"] && <FieldError message={errors["phone"]} />}
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-charcoal/70">Email</span>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              className="w-full rounded-xl border border-input bg-ivory-bright px-4 py-3 text-sm outline-none focus:border-leaf"
            />
            {errors["email"] && <FieldError message={errors["email"]} />}
          </label>
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-charcoal/70">Preferred contact method</span>
            <div className="flex gap-2">
              {(["phone", "email"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, preferredContact: m }))}
                  aria-pressed={data.preferredContact === m}
                  className={cn(
                    "neu-press px-5 py-2.5 text-sm font-semibold capitalize",
                    data.preferredContact === m ? "text-forest ring-2 ring-leaf" : "text-charcoal/70",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-start gap-3 rounded-2xl border border-border bg-ivory-bright p-4">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => setData((d) => ({ ...d, consent: e.target.checked }))}
              className="mt-0.5 size-4 accent-[#68a943]"
            />
            <span className="text-xs leading-relaxed text-charcoal/75">
              I'm happy for Austar Energy to contact me about this enquiry. This consent covers this
              enquiry only.
            </span>
          </label>
          {errors["consent"] && <FieldError message={errors["consent"]} />}
        </fieldset>
      )}

      {/* error summary */}
      {Object.keys(errors).length > 0 && (
        <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          Please fix the highlighted fields before continuing.
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0 || status === "submitting"}
          className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-charcoal/70 transition-colors enabled:hover:bg-charcoal/5 disabled:opacity-0"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-charcoal transition-all hover:bg-leaf-soft disabled:opacity-60"
        >
          {step < 2 ? (
            <>
              Continue
              <ChevronRight className="size-4" aria-hidden="true" />
            </>
          ) : (
            <>
              {status === "submitting" ? "Sending…" : "Send my enquiry"}
              <Send className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Available offers and eligibility depend on your location, property, existing system and
        applicable program conditions.
      </p>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
      {message}
    </p>
  );
}
