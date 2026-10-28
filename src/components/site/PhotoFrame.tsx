import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial photo frame with gentle scroll parallax inside an overflow-hidden
 * rounded mask. Movement is clamped so the image never exposes empty edges.
 * Disable with `parallax={false}` for intentionally still images.
 */
export function PhotoFrame({
  src,
  alt,
  className,
  imgClassName,
  ratio = "aspect-[4/3]",
  parallax = true,
  caption,
  disclaimer,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  parallax?: boolean;
  caption?: string;
  disclaimer?: string;
  children?: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parallax) return;
    const wrap = wrapRef.current;
    const img = wrap?.querySelector("img");
    if (!wrap || !img) return;

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2) / vh - 0.5));
      const move = progress * 34; // clamped within the oversize crop
      (img as HTMLElement).style.transform = `translateY(${move}px) scale(1.12)`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [parallax]);

  return (
    <figure className={cn("group relative", className)}>
      <div ref={wrapRef} className={cn("mask-round relative overflow-hidden", ratio)}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-transform duration-500",
            parallax && "scale-[1.12] will-change-transform",
            imgClassName,
          )}
        />
        {children}
      </div>
      {(caption || disclaimer) && (
        <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-[11px] text-muted-foreground">
          {caption && <span>{caption}</span>}
          {disclaimer && (
            <span className="shrink-0 rounded-full border border-border px-2 py-0.5">{disclaimer}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
