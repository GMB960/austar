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
