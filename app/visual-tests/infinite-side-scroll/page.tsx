"use client"

import { InfiniteSideScroll } from "library/InfiniteSideScroll"
import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled/alpha"
import { useEffect, useState } from "react"

const ITEMS = ["A", "B", "C", "D", "E"]

function ArrowBtn({ onClick }: { onClick?: VoidFunction }) {
	return <Btn onClick={onClick}>→</Btn>
}

export default function InfiniteSideScrollTests() {
	const [index, setIndex] = useState(0)
	const [big, setBig] = useState(false)

	useEffect(() => {
		const id = setInterval(() => setBig((b) => !b), 2000)
		return () => clearInterval(id)
	}, [])

	return (
		<Wrapper>
			<h1>InfiniteSideScroll Tests</h1>
			<UniversalLink href="/">go home</UniversalLink>

			<h2>standard marquee</h2>
			<p>marqueeSpeed=1, left-to-right, drag to interrupt</p>
			<InfiniteSideScroll marqueeSpeed={1}>
				{ITEMS.map((label) => (
					<Item key={label}>{label}</Item>
				))}
			</InfiniteSideScroll>

			<h2>reversed marquee</h2>
			<p>marqueeSpeed=1, right-to-left</p>
			<InfiniteSideScroll marqueeSpeed={1} reversed>
				{ITEMS.map((label) => (
					<ReversedItem key={label}>{label}</ReversedItem>
				))}
			</InfiniteSideScroll>

			<h2>snap mode (no marquee)</h2>
			<p>default — drag or scroll horizontally to snap to nearest item</p>
			<InfiniteSideScroll>
				{ITEMS.map((label) => (
					<Item key={label}>{label}</Item>
				))}
			</InfiniteSideScroll>

			<h2>no snap</h2>
			<p>disableSnap — drag freely without snapping</p>
			<InfiniteSideScroll disableSnap>
				{ITEMS.map((label) => (
					<GreenItem key={label}>{label}</GreenItem>
				))}
			</InfiniteSideScroll>

			<h2>with arrow buttons</h2>
			<p>ArrowButton — single button auto-flipped for back and forward</p>
			<InfiniteSideScroll ArrowButton={ArrowBtn}>
				{ITEMS.map((label) => (
					<Item key={label}>{label}</Item>
				))}
			</InfiniteSideScroll>

			<h2>disabled drag</h2>
			<p>disableDrag + marqueeSpeed=1 — cannot be dragged or scrolled manually</p>
			<InfiniteSideScroll marqueeSpeed={1} disableDrag>
				{ITEMS.map((label) => (
					<PurpleItem key={label}>{label}</PurpleItem>
				))}
			</InfiniteSideScroll>

			<h2>centerMode off</h2>
			<p>centerMode=false — first item starts from the left instead of center</p>
			<InfiniteSideScroll centerMode={false}>
				{ITEMS.map((label) => (
					<Item key={label}>{label}</Item>
				))}
			</InfiniteSideScroll>

			<h2>scroll velocity</h2>
			<p>scrollVelocity=0.5 — scrubs with vertical page scroll speed</p>
			<InfiniteSideScroll scrollVelocity={0.5}>
				{ITEMS.map((label) => (
					<GreenItem key={label}>{label}</GreenItem>
				))}
			</InfiniteSideScroll>

			<h2>onChange callback</h2>
			<p>current index: {index}</p>
			<InfiniteSideScroll onChange={setIndex}>
				{ITEMS.map((label) => (
					<Item key={label}>{label}</Item>
				))}
			</InfiniteSideScroll>

			<h2>items change size</h2>
			<p>
				all items toggle between 300×200 and 150×120 every 2 s — loop should recalculate seamlessly
			</p>
			<InfiniteSideScroll marqueeSpeed={1}>
				{ITEMS.map((label) => (
					<SizeShiftItem key={label} style={{ width: big ? 300 : 150, height: big ? 200 : 120 }}>
						{label}
					</SizeShiftItem>
				))}
			</InfiniteSideScroll>

			<h2>mixed-size items change size</h2>
			<p>odd items are large, even items are small — sizes swap every 2 s</p>
			<InfiniteSideScroll marqueeSpeed={1}>
				{ITEMS.map((label, i) => {
					const isBig = i % 2 === 0 ? big : !big
					return (
						<SizeShiftItem
							key={label}
							style={{ width: isBig ? 300 : 150, height: isBig ? 200 : 120 }}
						>
							{label}
						</SizeShiftItem>
					)
				})}
			</InfiniteSideScroll>

			<Divider />
			<h1>gap calculation tests</h1>
			<p>
				each test uses a marquee so the loop seam is always visible — check that the spacing between
				the last and first items matches the rest
			</p>

			<h2>flex gap</h2>
			<p>gap: 60px on .track (flex container)</p>
			<FlexGapWrapper>
				<InfiniteSideScroll marqueeSpeed={1}>
					{ITEMS.map((label) => (
						<TealItem key={label}>{label}</TealItem>
					))}
				</InfiniteSideScroll>
			</FlexGapWrapper>

			<h2>margin-left on items</h2>
			<p>no flex gap — spacing comes entirely from margin-left: 60px on each item</p>
			<MarginLeftWrapper>
				<InfiniteSideScroll marqueeSpeed={1}>
					{ITEMS.map((label) => (
						<MarginLeftItem key={label}>{label}</MarginLeftItem>
					))}
				</InfiniteSideScroll>
			</MarginLeftWrapper>

			<h2>margin-right on items</h2>
			<p>no flex gap — spacing comes entirely from margin-right: 60px on each item</p>
			<MarginRightWrapper>
				<InfiniteSideScroll marqueeSpeed={1}>
					{ITEMS.map((label) => (
						<MarginRightItem key={label}>{label}</MarginRightItem>
					))}
				</InfiniteSideScroll>
			</MarginRightWrapper>

			<h2>grid gap</h2>
			<p>.track overridden to display: grid with column gap: 60px</p>
			<GridGapWrapper>
				<InfiniteSideScroll marqueeSpeed={1}>
					{ITEMS.map((label) => (
						<TealItem key={label}>{label}</TealItem>
					))}
				</InfiniteSideScroll>
			</GridGapWrapper>

			<Spacer />
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 100px 0;
		
		& h2 {
			padding: 0 40px;
			margin-top: 20px;
		}
		
		& p {
			padding: 0 40px;
			opacity: 0.6;
			font-size: 14px;
		}
		
		& h1 {
			padding: 0 40px;
		}
		
		& a {
			padding: 0 40px;
		}
		
		& .track {
			gap: 20px;
		}
		
		& .buttons {
			display: flex;
			justify-content: center;
			gap: 20px;
			margin-top: 10px;
		}
	`),
)

const Item = styled(
	"div",
	fresponsive(css`
		width: 300px;
		height: 200px;
		background: orange;
		border-radius: 12px;
		display: grid;
		place-items: center;
		font-size: 80px;
		font-weight: bold;
		flex-shrink: 0;
	`),
)

const ReversedItem = styled(
	Item,
	fresponsive(css`
		background: tomato;
	`),
)

const GreenItem = styled(
	Item,
	fresponsive(css`
		background: mediumseagreen;
	`),
)

const PurpleItem = styled(
	Item,
	fresponsive(css`
		background: mediumpurple;
	`),
)

const Btn = styled(
	"button",
	fresponsive(css`
		width: 60px;
		height: 60px;
		border-radius: 50%;
		border: 2px solid black;
		font-size: 24px;
		cursor: pointer;
		background: white;
		display: grid;
		place-items: center;
	`),
)

const Spacer = styled(
	"div",
	fresponsive(css`
		height: 100px;
	`),
)

const SizeShiftItem = styled(
	Item,
	fresponsive(css`
		background: steelblue;
		transition:
			width 0.6s ease,
			height 0.6s ease;
	`),
)

const Divider = styled(
	"div",
	fresponsive(css`
		height: 2px;
		background: currentColor;
		opacity: 0.15;
		margin: 40px 40px 0;
	`),
)

const TealItem = styled(
	Item,
	fresponsive(css`
		background: cadetblue;
	`),
)

/* ── gap test wrappers ─────────────────────────────────────────────────────── */

/**
 * Forces .track gap to exactly 60px (flex gap).
 * Uses !important to override the global 20px gap set on the outer Wrapper.
 */
const FlexGapWrapper = styled(
	"div",
	fresponsive(css`
		& .track {
			gap: 60px !important;
		}
	`),
)

/**
 * Zeroes the flex gap so spacing comes solely from margin-left on items.
 */
const MarginLeftWrapper = styled(
	"div",
	fresponsive(css`
		& .track {
			gap: 0 !important;
		}
	`),
)

const MarginLeftItem = styled(
	TealItem,
	fresponsive(css`
		margin-left: 60px;
	`),
)

/**
 * Zeroes the flex gap so spacing comes solely from margin-right on items.
 */
const MarginRightWrapper = styled(
	"div",
	fresponsive(css`
		& .track {
			gap: 0 !important;
		}
	`),
)

const MarginRightItem = styled(
	TealItem,
	fresponsive(css`
		margin-right: 60px;
	`),
)

/**
 * Overrides .track to display: grid with column gap: 60px.
 * The InfiniteSideScroll JS still reads getBoundingClientRect so it works correctly.
 */
const GridGapWrapper = styled(
	"div",
	fresponsive(css`
		& .track {
			display: grid !important;
			grid-auto-flow: column;
			grid-auto-columns: 300px;
			gap: 60px !important;
		}
	`),
)
