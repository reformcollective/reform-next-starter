# Code Conventions

## Image Co-location

The `app/images/` folder (aliased as `images/*`) is for **global assets only** — brand marks, icons, and SVGs used across multiple components.

Images that belong to a specific component or section should live next to that component, not in `app/images/`.

### Structure

If a component or section has its own images, convert it from a single file to a folder:

```
sections/
  Hero/
    index.tsx        ← was Hero.tsx
    hero-bg.jpg      ← co-located image
    diagram.svg

  Sample.tsx         ← no images, stays a single file
```

If a component needs many images, group them in an `images/` subfolder:

```
sections/
  Hero/
    index.tsx
    images/
      bg-desktop.jpg
      bg-mobile.jpg
      diagram.svg
```

### Importing

Co-located images use relative imports:

```ts
import HeroBg from "./hero-bg.jpg"
import HeroBg from "./images/bg-desktop.jpg"
```

Global images use the `images/` alias:

```ts
import LogoMark from "images/LogoMark.svg"
import ArrowIcon from "images/icons/Arrow.inline.svg"
```

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
