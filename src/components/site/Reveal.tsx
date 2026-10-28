import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Adds `is-visible` to elements marked with `data-reveal` inside the container
 * when they enter the viewport. Works with the `.reveal-line` / `.reveal-fade`
 * CSS primitives in styles.css.
 */
export function useRevealContainer<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 10% 0px" },
    );
    targets.forEach((t) => io.observe(t));

    // Safety net: never leave an in-view element unrevealed, even if the
    // observer races with fast scrolling or hydration.
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      for (const t of targets) {
        if (t.classList.contains("is-visible")) continue;
        const r = t.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.98 && r.bottom > 0) t.classList.add("is-visible");
      }
      if (tries > 12 || targets.every((t) => t.classList.contains("is-visible"))) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return ref;
}

/** Simple fade/rise wrapper. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "span" | "p" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.classList.add("is-visible");
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.98 && r.bottom > 0;
    };
    // Already on screen when we mount (fast scroll, anchor jump): show now.
    if (inView()) {
      show();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 10% 0px" },
    );
    io.observe(el);
    // Safety net if the observer misfires.
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (inView()) show();
      if (tries > 12 || el.classList.contains("is-visible")) window.clearInterval(timer);
    }, 250);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn("reveal-fade", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/** Line-based editorial headline reveal. Each child becomes a masked line. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  startVisible = false,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  startVisible?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (startVisible) {
      // Hero: reveal via a short timeout so the initial paint shows text
      // even if the observer misfires; the animation still plays.
      const t = setTimeout(() => {
        ref.current?.querySelectorAll(".reveal-line").forEach((l) => l.classList.add("is-visible"));
      }, 120);
      return () => clearTimeout(t);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.querySelectorAll(".reveal-line").forEach((l, i) => {
              (l as HTMLElement).style.transitionDelay = `${i * 60}ms`;
              l.classList.add("is-visible");
            });
            io.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [startVisible]);

  return (
    <h2 ref={ref} className={className} aria-label={lines.map(String).join(" ")}>
      <span aria-hidden="true">
        {lines.map((line, i) => (
          <span key={i} className={cn("reveal-line", lineClassName)}>
            <span>{line}</span>
          </span>
        ))}
      </span>
    </h2>
  );
}
