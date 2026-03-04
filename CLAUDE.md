# Reform Next Starter — Agent Guide

This file provides context for AI coding agents (Claude Code, Cursor, Copilot, etc.) working on this codebase.

## Commands

```bash
pnpm dev          # start dev server (runs typegen first via wireit)
pnpm build        # full build: next build + typecheck + generate-manifest
pnpm lint         # oxlint + stylelint (auto-fixes)
pnpm format       # oxfmt (auto-fixes)
pnpm typecheck    # tsgo (fast TypeScript checker)
pnpm typegen      # generate Sanity types + Next.js route types
```

Do **not** run `npm` or `yarn` — this project uses `pnpm` exclusively.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **CMS**: Sanity v5 (studio embedded at `/studio`)
- **Styling**: Vanilla Extract CSS-in-TS (`*.css.ts` files)
- **Animation**: GSAP + Lenis scroll
- **Forms**: `@base-ui/react`
- **Linter**: oxlint (with type-aware checks)
- **Formatter**: oxfmt (tabs, no semicolons)
- **Type checking**: `tsgo` (TypeScript native preview — fast)
- **Task runner**: wireit (handles parallelism and caching)

## Project Structure

```
app/
  (sanity)/         # embedded Sanity Studio route
  [[...slug]]/      # catch-all Sanity-driven pages
  components/       # shared UI components (Header, Footer, etc.)
  sections/         # page section components mapped from Sanity content
  styles/           # design tokens: colors, fonts, text, media queries
  types/            # shared TypeScript types
  utils/            # utility helpers
  libraryConfig.ts  # configures the shared library (breakpoints, etc.)
library/            # git submodule — shared Reform library code
sanity/             # Sanity schemas and config
```

## Styling — Vanilla Split

Styles are written using **vanilla split**: a zero-runtime CSS-in-JS system built on top of vanilla-extract. Import from `library/styled/alpha`.

```tsx
import { styled, f, css } from "library/styled/alpha"

const Box = styled("div", {
	base: [
		f.responsive(css`
			padding: 24px; /* auto-converts px → responsive vw calc() */
		`),
		f.mobile(css`
			flex-direction: column;
		`),
	],
	variants: {
		tone: {
			light: [{ background: "#fff" }],
			dark:  [{ background: "#000" }],
		},
	},
	defaultVariants: { tone: "light" },
})
```

### Key APIs

| API | Purpose |
|-----|---------|
| `styled(tag, config)` | Create a styled component with base styles, variants, tokens |
| `f.responsive(...)` | Fluid scaling across all breakpoints (px → calc/vw) |
| `f.desktop/tablet/mobile/small/large(...)` | Styles scoped to a single breakpoint range |
| `f.scaledResponsive(...)` | Force vw scaling on all breakpoints (no snapping) |
| `tokens` | Map props to CSS variables for runtime values (coordinates, colors, etc.) |
| `as` prop | Change the rendered element at runtime |
| `Component.toString()` | Returns the class selector — use for parent→child style targeting |

### Rules

- **Define styles in the file they're used** — the vanilla-split loader handles extraction. Do not export styled components from `.ts`/`.tsx` files to use elsewhere; this will fail.
- **Use `.css.ts` files** strictly for vanilla-extract variables (`createVar`), keyframes, and global styles.
- **No inline styles, no CSS modules, no Tailwind.**

See `library/styled/README.md` for full docs.

## Code Conventions

- **Formatting**: tabs for indentation, no semicolons (enforced by oxfmt)
- **Imports**: use path aliases — `library/...` for the submodule, `@/` is not configured; use relative imports or the `library/` alias
- **Types**: prefer `zod` or `valibot` for runtime validation; Sanity types are auto-generated into `sanity.types.ts`
- **No `any`**: oxlint enforces this with type-aware checks

## Key Files

| File | Purpose |
|------|---------|
| `app/libraryConfig.ts` | Configures library breakpoints, scaling, section groups |
| `app/styles/colors.css.ts` | Design tokens for color |
| `app/styles/text.ts` | Typography scale |
| `app/styles/media.ts` | Responsive breakpoint helpers |
| `sanity.config.ts` | Sanity studio configuration |
| `sanity.types.ts` | Auto-generated — do not edit manually |
| `.npmrc` | pnpm settings (save-prefix, minimum-release-age, etc.) |

## Sanity Notes

- **Studios tab** in Sanity dashboard should point to the deployed studio URL, never `localhost`
- **CORS / API tab** needs `localhost` added for local development
- Run `pnpm typegen` after changing Sanity schemas to regenerate `sanity.types.ts`
- If typegen fails, run `pnpm exec sanity schema validate` to diagnose schema errors

## Library Submodule

`/library` is a git submodule. After cloning, it is initialized automatically via the `pnpm:devPreinstall` hook. If it appears empty, run:

```bash
git submodule update --init
```

Do not edit files inside `library/` directly — changes belong in the submodule repo.

## Environment Variables

Required in `.env`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_AUTH_TOKEN=
```

The `check-env` script validates these on install. It is skipped in CI (`$CI` env var).
