"use client"

import { colors } from "app/styles/colors.css"
import UniversalLink from "library/link"
import { css, f, styled } from "library/styled"

/**
 * exercises library/useSectionTheme without needing Sanity content.
 *
 * scroll through and watch the header restyle itself. the switch should fire as each block
 * crosses the header's *bottom* edge — that's the thin strip the observer watches — not as
 * it enters the viewport.
 */

const blocks = [
	{ mode: "light", label: "light", note: "header should be dark-on-light" },
	{ mode: "dark", label: "dark", note: "header should be light-on-dark" },
	{ mode: "light", label: "light", note: "back to light" },
	{
		mode: "dark",
		label: "dark, pinned (z-index: -1)",
		note: "the next block scrolls over this one. scrolling back up through the seam should not flicker — useSectionTheme prefers non-pinned candidates when both are behind the header",
		pinned: true,
	},
	{
		mode: "light",
		label: "light, covering the pinned block",
		note: "should win over the pinned block above",
	},
	{ mode: "dark", label: "dark", note: "last one" },
] as const

export default function HeaderThemeVisualTestPage() {
	return (
		<Wrapper>
			<Nav>
				<h1>Header theme test</h1>
				<UniversalLink href="/visual-tests">← visual tests</UniversalLink>
				<p>
					each block below declares <code>data-header-mode</code>. the header reads whichever one is
					currently behind it and restyles itself to match.
				</p>
			</Nav>

			{blocks.map((block, index) => (
				<Block
					// biome-ignore lint/suspicious/noArrayIndexKey: static list
					key={index}
					data-header-mode={block.mode}
					data-pinned={"pinned" in block && block.pinned ? true : undefined}
				>
					<Label>
						<strong>{block.label}</strong>
						<span>{block.note}</span>
					</Label>
				</Block>
			))}
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-column: fullbleed;
		display: grid;
		grid-template-columns: var(--subgrid-columns);
	`),
])

const Nav = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		/* the header is fixed, so clear it manually here */
		padding: calc(var(--site-header-height, 100px) + 48px) 0 48px;
	`),
])

const Block = styled("div", [
	f.responsive(css`
		grid-column: fullbleed;
		display: grid;
		grid-template-columns: var(--subgrid-columns);
		align-content: center;
		position: relative;
		min-height: 100vh;

		&[data-header-mode="light"] {
			background: ${colors.surfaceLight};
			color: ${colors.surfaceDark};
		}

		&[data-header-mode="dark"] {
			background: ${colors.surfaceDark};
			color: ${colors.surfaceLight};
		}

		&[data-pinned] {
			position: sticky;
			top: 0;
			z-index: -1;
		}
	`),
])

const Label = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 640px;
	`),
])
