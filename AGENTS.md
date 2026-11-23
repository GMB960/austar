<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Home hero story (src/components/home/StoryHero.tsx)

- The hero is a pinned, scroll-scrubbed sequence of real photos (house → solar →
  hot water → comfort → dusk) driven by one rAF loop writing styles directly; no
  WebGL, so it works on mobile. Scene timing lives in `STARTS`. The old 3D
  `StoryCanvas.tsx` is no longer used.
- Use Tailwind `[transform:...]` rather than `translate-*` utilities on elements
  animated with keyframes that set `transform` (v4 `translate` stacks and hides them).

## Service-area atlas

- Keep the service-area WebGL scene lazy-loaded after the section approaches the viewport; this preserves SSR and avoids loading 3D for the photographic hero.
- Use the geographically sourced state rings in `src/lib/australia-map.json`, derived from rowanhogan/australian-states, instead of hand-drawn state silhouettes.
- Resolve semantic CSS colors to sRGB inside the mounted scene; Three.js does not parse the site's oklch tokens directly.
- Default the service-area map to Google Maps Embed satellite view, retaining the atlas as an alternate; load managed-key imagery only on authorized Lovable hosts to respect browser-key restrictions.

## Frequently asked questions

- Keep the scroll-triggered homepage notice isolated after the complete hero story; browser-only preference reads run in effects and a single scheduled scroll check triggers it once per mount, so SSR remains stable.

- Keep the homepage FAQ in its own module with topic filters and the shared accessible accordion; use one event-scheduled rAF for scroll/pointer photo depth and CSS for answer transitions, respecting both system and site motion settings to keep animations lightweight and accessible.
- Reuse the shared eligibility and cold-call notices rather than duplicating business-policy wording in expanded answers.

## Home introduction

- Keep the home introduction in its own module and animate its real-photo collage using CSS depth variables driven by one event-scheduled rAF; this isolates its scroll/pointer motion without loading WebGL or affecting other sections.

## Closing chapter strip (src/components/home/ChapterStrip.tsx)

- Keep the closing section's chapters as one pinned, full-bleed scroll story driven by a single rAF loop: scroll crossfades full-screen real photographs, each scene carrying its own centred writing that fades/lifts as the next photo takes over; depth comes from Ken Burns push-in and drift only, never perspective/rotateY, so text always sits clean over the photo.
- Decide the stacked fallback for narrow screens and reduced-motion visitors in JS via matchMedia (not CSS overrides), so a server-rendered or stale pinned layout can never leave chapters sideways or invisible.

## Brand mark and palette tokens

- Register a colour in the `@theme` block of `src/styles.css` before using it as a utility class or `var(--color-*)`; an unregistered name compiles to nothing and leaves panels silently transparent.
- Keep the site logo a single deep-green ink with its thin strokes thickened at source, because hairline strokes antialias away at header/footer sizes; render it on a solid cream panel so it reads over photos and dark sections alike.

## Site header (src/components/site/SiteHeader.tsx)

- Keep the header one full-width fixed band that settles from tall and see-through into a slim, solid, legible panel once the page scrolls, with its logo, menu items and quote button tightening in step; drive both the settle state and the reading-progress rail from one rAF-scheduled scroll listener.
- Never give the scrolled panel a horizontal inset that leaves page content exposed in a gutter at the screen edge — content peeking beside a floating bar reads as a rendering glitch; round only the bottom corners instead.

