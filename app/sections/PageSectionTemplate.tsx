// import type { GetSectionType } from "page"

// import { colors } from "app/styles/colors.css"
// import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"

export default function PageSection() {
	return (
		<Wrapper>
			<Inner />
		</Wrapper>
	)
}

/**
 * spans the full width of the page and re-declares the page grid,
 * so that children can use `grid-column: main` (or any other column)
 */
const Wrapper = styled("div", [
	f.unresponsive(css`
		grid-column: fullbleed;
		grid-template-columns: var(--subgrid-columns);
		position: relative;
		display: grid;
		align-items: center;
		overflow: hidden;
	`),
])

/**
 * `main` caps and centers itself — no `max-width` or `margin: 0 auto` needed here.
 *
 * the grid brackets `main` with `calc((100vw - sourceDesignWidth) / 2)` spacer tracks
 * (see `library/layoutGridBuilder.tsx`). those px go through the same responsive
 * conversion as everything else, so inside the fluid ranges they resolve to exactly
 * 0 — the whole grid is scaling in vw and there is nothing to cap. past the top
 * breakpoint the px pin instead, the spacers grow, and `main` stops at ~1601px.
 *
 * you *would* need a max-width if this project set `scaleFully: true`, or if this
 * element sat on `fullbleed` / `scaled-main` instead of `main`.
 */
const Inner = styled("div", [
	f.responsive(css`
		grid-column: main;
	`),
])
