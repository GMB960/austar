import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial photo frame with gentle scroll parallax inside an overflow-hidden
 * rounded mask. Movement is clamped so the image never exposes empty edges.
 * Disable with `plain` for intentionally still images.
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
  const imgRef = useRef<HTMLImageElement>(null);

  const enableParallax = parallax && typeof window !== "undefined";

  const onScroll = () => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.bottom < -80 || rect.top > vh + 80) return;
    // Normalised progress -1 .. 1 across the viewport
    const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2) / vh - 0.5));
    const move = progress * 34; // clamp within the oversize crop
    img.style.transform = `translateY(${move}px) scale(1.12)`;
  };

  const attachRef = (el: HTMLDivElement | null) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapRef as any).current = el;
    if (enableParallax && el) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  };

  return (
    <figure className={cn("group relative", className)}>
      <div ref={attachRef} className={cn("mask-round relative", ratio)}>
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-transform duration-700",
            parallax ? "" : "scale-100",
            imgClassName,
            parallax && "scale-[1.12] will-change-transform",
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
