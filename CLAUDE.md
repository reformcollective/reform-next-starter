# Reform Next Starter — Claude Notes

## Project

Marketing site starter built by Reform Collective. Next.js app router, Sanity CMS, TypeScript.

## Package Manager

`pnpm` only. Never use npm or yarn.

## Styling System

Import `css`, `f`, `styled` from `"library/styled/alpha"`.

`css` is just `String.raw` — a tagged template literal for CSS strings.

`styled(tag, [StyleRules])` wraps any HTML tag or component with scoped styles. Always use the array `[]` form. this can be either the standard array form or the version using base: []. Always wrap CSS with an `f.*` function — never pass a bare `css` string directly unless specifically asked by the human.

`f` converts px values from the design file into fluid responsive values automatically. Available utilities:

- `f.responsive` — all breakpoints (mobile → tablet → desktop → fullWidth). Use this by default.
- `f.small` — mobile + tablet only
- `f.large` — desktop + fullWidth only
- `f.desktop` / `f.tablet` / `f.mobile` — single breakpoint
- `f.allDesktop` — all breakpoints, desktop design size
- `f.unresponsive` — passes CSS through with no transformation

Write px values as they appear in Figma — the system converts them. Styled components go at the bottom of the file.

Colors: `import { colors } from "app/styles/colors.css"` → use as `${colors.blog1Evergreen800}`
Text styles: `import textStyles from "app/styles/text"` → use as `${textStyles.p4}`

Never use inline styles.

Always use modern CSS color notation: `rgb(0 0 0 / 80%)` — never `rgba(0, 0, 0, 0.8)` or `rgba`.

## useMedia

`import { useMedia } from "library/useMedia"`

Argument order: `useMedia(fullWidth, desktop, tablet, mobile)`

`f.small` encompasses mobile + tablet. `useMedia(false, false, true, true)` is the JS equivalent — anything styled with `f.small` behaves the same across both breakpoints (mobile values are scaled up proportionally on tablet). So a single `responsive = useMedia(false, false, true, true)` check is sufficient to branch between desktop and f.small behavior.

## Animations (GSAP)

- `import { useAnimation } from "library/useAnimation"`
- Register plugins at file top: `gsap.registerPlugin(MorphSVGPlugin)`
- `useAnimation(createFn, deps, options?)` — handles context, cleanup, HMR, Lenis integration
  - `createFn` receives `{ context, contextSafe }` — use `contextSafe` to wrap GSAP event handlers
  - Return a cleanup function from `createFn` for event listeners and manual kills
  - `options.scope` — `RefObject<Element>` for GSAP context scope
  - `options.recreateOnResize` — recreate animations on resize
  - `options.updateBehavior` — `"kill" | "revert" | "none"` (default: `"revert"`)
  - `options.unmountBehavior` — `"kill" | "revert" | "none"` (default: `"kill"`)
- Only runs client-side after hydration — safe to use refs directly

## Components

- `"use client"` required for any file using GSAP, refs, or event listeners
- `.inline.svg` files are imported as React components via SVGR
- Raster images use `StaticImage` from `"library/StaticImage"`
- Image imports use `images/` path alias (e.g. `from "images/home/hero.png"`)

## Library

`library/` is a git submodule shared across projects. We have full control over it and can make changes via PRs. Be careful when modifying it since changes affect other projects, but don't treat it as off-limits.

## Linter

`oxfmt` runs on save and may reformat files. Always re-read a file before editing if it may have changed since the last read.

## Editing Files

This codebase uses tabs for indentation. The Edit tool's `old_string` matching is sensitive to exact whitespace. If an Edit fails to match, use Write to rewrite the whole file rather than retrying with adjusted indentation — retrying Edit rarely works and wastes time.

## Git

Never auto-commit. Never amend without being asked.

## Working Style

Do exactly what is asked. No extra refactors, comments, or features. Implement directly when asked — don't restate the plan first.

- If confidence in a solution is below ~100%, say so upfront. Don't spend tokens on an approach that likely won't work — ask a clarifying question or flag the uncertainty first.
- Prefer attempting a solution and iterating based on real results over pre-emptive "but what if..." hedging. Try it, then adjust.
- Before using any existing component, grep for real call sites in the codebase and read one — don't rely solely on the component definition. The definition shows what props exist; actual usage shows the correct calling convention.

## Sanity Image Queries

Any image field in a GROQ query that will be rendered with `SanityImage` / `UniversalImage` must include an inline `data` projection for LQIP and aspect ratio. `enrichAssets` defaults to `false` — do not rely on post-query enrichment.

```groq
mainImage {
  ...,
  "data": {
    "lqip": asset->metadata.lqip,
    "aspectRatio": asset->metadata.dimensions.aspectRatio
  }
}
```

This applies to every image field in every query — `mainImage`, `image`, `photo`, etc. — wherever the result is passed to `SanityImage` / `UniversalImage`.

If inline projection is not feasible for a specific call-site, you can opt into legacy post-query enrichment as a temporary measure by passing `enrichAssets: true` to `sanityFetch`. This is deprecated and should not be used for new code.

```ts
const { data } = await sanityFetch({ query, enrichAssets: true })
```

## Blog Templates

This starter contains multiple blog template presets housed in `app/blog-1/`, `app/blog-2/`, etc. and matching Sanity schemas in `sanity/schemas/blog/blog-1/`, etc.

Full adoption instructions are in `sanity/schemas/blog/blog-1/README.md`.

**To adopt a template for a project:**

1. Pick the desired template (e.g. `blog-1`)
2. Rename the route folder from `blog-1` to `blog`
3. Rename Sanity type names from `blog1Post` → `post`, `blog1Author` → `author`, `blog1Category` → `category`, `blog1Hub` → `blogHub`
4. Delete the unused template folders (`blog-2/`, `blog-3/`, etc.)
5. Replace `blog1Colors` placeholder colors in `colors.css.ts` with project brand colors
6. Replace placeholder font references in `text.ts` with project fonts
