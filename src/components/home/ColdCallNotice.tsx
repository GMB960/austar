import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogDescription, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { COLD_CALL_STATEMENT } from "@/lib/site";

export const NOTICE_STORAGE_KEY = "austar:cold-call-notice:hidden:v1";

export function ColdCallNotice() {
  const boundary = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  const [open, setOpen] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(NOTICE_STORAGE_KEY) === "true") return;
    } catch {
      // A blocked storage preference must never prevent the notice from working.
    }
    let frame = 0;
    const check = () => {
      frame = 0;
      const marker = boundary.current;
      if (!shown.current && marker && marker.getBoundingClientRect().top <= 0) {
        shown.current = true;
        setOpen(true);
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const dismiss = () => {
    if (remember) {
      try {
        window.localStorage.setItem(NOTICE_STORAGE_KEY, "true");
      } catch {
        // Dismiss for this visit even when persistent storage is unavailable.
      }
    }
    setOpen(false);
  };

  return (
    <>
      <div ref={boundary} data-notice-boundary aria-hidden="true" />
      <Dialog open={open} onOpenChange={(next) => { if (!next) dismiss(); }}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-forest-deep/65 backdrop-blur-sm duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
          <DialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-[101] flex max-h-[calc(100svh-32px)] w-[calc(100%-32px)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-lg border border-sage bg-ivory-bright text-charcoal shadow-xl duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none"
            onOpenAutoFocus={(event) => { event.preventDefault(); document.getElementById("cold-call-title")?.focus(); }}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <div className="relative border-b border-sage px-6 pb-6 pt-7 sm:px-9 sm:pt-9">
              <div className="mb-5 flex items-center gap-3 text-forest">
                <span className="grid size-11 place-items-center rounded-full bg-sage"><ShieldCheck className="size-6" aria-hidden="true" /></span>
                <span className="text-xs font-bold uppercase">Official notice · Austar Energy</span>
              </div>
              <DialogTitle id="cold-call-title" tabIndex={-1} className="pr-4 font-display text-2xl font-extrabold leading-tight tracking-normal outline-none sm:text-3xl">Fraudulent cold calling</DialogTitle>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close notice" title="Close notice" className="absolute right-3 top-3 text-forest"><X /></Button>
              </DialogPrimitive.Close>
            </div>
            <DialogDescription className="space-y-4 px-6 py-6 text-sm leading-relaxed text-charcoal/85 sm:px-9 sm:text-base" asChild>
              <div>{COLD_CALL_STATEMENT.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            </DialogDescription>
            <div className="flex flex-col gap-5 border-t border-sage bg-sage/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-forest">
                <Checkbox checked={remember} onCheckedChange={(value) => setRemember(value === true)} />
                Don’t show this again
              </label>
              <Button onClick={dismiss} size="lg" className="bg-forest text-ivory-bright hover:bg-forest-deep"><Check aria-hidden="true" /> I Understand</Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}