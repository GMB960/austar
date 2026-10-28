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

## 3D story scene (src/components/home/StoryCanvas.tsx)

- The hero house is procedural but must stay photoreal-leaning: all surface
  materials are CC0 Poly Haven PBR maps hosted as CDN assets in
  `src/assets/tex/` (credits in `src/assets/tex/CREDITS.md`); lighting comes
  from the `sky-1k.hdr` environment plus the animated sun. Never replace them
  with flat colored materials.
- Camera keyframes in `BEATS` are tuned so each story beat frames its subject
  (solar roof, heat pump, AC unit) clear of the chapter cards and the house
  geometry. If the house footprint or equipment positions change, re-verify
  every beat with screenshots at scroll progress 0 / 0.42 / 0.74 / 0.92.
- Dusk window glow lives on emissive planes between each window's reveal box
  and its glass; keep the plane's base color dark (#37302a) so windows don't
  read yellow in daylight.
