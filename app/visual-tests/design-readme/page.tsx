"use client"

import { useInterval } from "ahooks"
import { AnimatedPaths } from "library/AnimatedPaths"
import AutoAnimate from "library/AutoAnimate"
import CustomTextOverflow from "library/CustomTextOverflow"
import { DisplayDate } from "library/DisplayDate"
import { InfiniteSideScroll } from "library/InfiniteSideScroll"
import UniversalLink from "library/link"
import StaticImage from "library/StaticImage"
import { styled } from "library/styled/alpha"
import { useState } from "react"

export default function DesignPage() {
	const [count, setCount] = useState(0)

	useInterval(() => {
		setCount(count + 1)
	}, 1000)

	return (
		<Wrapper>
			<h1>hola</h1>
			<h2>Animated Paths</h2>
			<AnimatedPaths lineSpeed={[50, 50]}>
				<SVG width="200" height="100" viewBox="0 0 200 100">
					<path
						d="M10 10 C 20 50, 50 20, 70 70"
						stroke="blue"
						strokeWidth="2"
						fill="none"
						strokeLinecap="round"
					/>
					<path
						d="M20,20 L50,80 L80,20 Z"
						stroke="red"
						strokeWidth="2"
						fill="none"
						strokeLinecap="round"
					/>
				</SVG>
			</AnimatedPaths>
			<h2>Auto Animate</h2>
			<Row>
				<AutoAnimate>
					<LargeTextBox key={count}>{count}</LargeTextBox>
				</AutoAnimate>
				<AnimateNoClip
					parameters={{
						yPercent: undefined,
						rotate: 360,
						opacity: 0,
					}}
					duration={1}
				>
					<LargeTextBox key={count}>{count}</LargeTextBox>
				</AnimateNoClip>
				<AnimateNoClip
					parameters={{
						yPercent: undefined,
						xPercent: 100,
						opacity: 0,
					}}
					duration={1}
				>
					<SmallImage
						width={100}
						height={100}
						key={count}
						src={`https://picsum.photos/100/100?random=${count % 3}`}
						alt="random"
					/>
				</AnimateNoClip>
			</Row>
			<Link href={"/visual-tests/auto-animate"}>See more AutoAnimate examples</Link>
			<h2>Custom Text Overflow</h2>
			<TextOverflowWrapper>
				<CustomTextOverflow maxLines={1} truncatePosition={-10} ellipsis="......">
					I pledge Allegiance to the flag of the United States of America and to the Republic for
					which it stands, one nation under God, indivisible, with Liberty and Justice for all.
				</CustomTextOverflow>
			</TextOverflowWrapper>
			<h2>Display Date</h2>
			<DisplayDate
				date={1762984857903}
				options={{
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "numeric",
					minute: "numeric",
				}}
			/>
			<h2>Infinite Side Scroll</h2>
			<InfiniteSideScroll marqueeSpeed={1}>
				<SnapItem>A</SnapItem>
				<SnapItem>B</SnapItem>
				<SnapItem>C</SnapItem>
				<SnapItem>D</SnapItem>
				<SnapItem>E</SnapItem>
			</InfiniteSideScroll>
			<InfiniteSideScroll marqueeSpeed={1} reversed scrollVelocity={(v) => -Math.abs(v) / 500}>
				<SnapItem>A</SnapItem>
				<SnapItem>B</SnapItem>
				<SnapItem>C</SnapItem>
				<SnapItem>D</SnapItem>
				<SnapItem>E</SnapItem>
			</InfiniteSideScroll>
			<InfiniteSideScroll>
				<SnapItem>A</SnapItem>
				<SnapItem>B</SnapItem>
				<SnapItem>C</SnapItem>
				<SnapItem>D</SnapItem>
				<SnapItem>E</SnapItem>
			</InfiniteSideScroll>
			<h2>Native Scroll Snap</h2>
			<SnapWrap>
				<SnapItem>A</SnapItem>
				<SnapItem>B</SnapItem>
				<SnapItem>C</SnapItem>
				<SnapItem>D</SnapItem>
				<SnapItem>E</SnapItem>
			</SnapWrap>
			<h2>Scaled Content</h2>
			<h2>Side Scroller</h2>
			<h2>Smooth Pin</h2>
			<h2>Zoom Pin</h2>
		</Wrapper>
	)
}

const Wrapper = styled("div", {
	maxWidth: "82ch",
	margin: "0 auto",
	display: "grid",
	gap: "40px",
	padding: "40px 20px",
	overflow: "clip",
	gridColumn: "main",

	within: {
		".track": {
			display: "flex",
			gap: "15px",
		},
	},
})

const SVG = styled("svg", {
	border: "1px solid orange",
	width: "100%",
	height: "auto",
})

const Row = styled("div", {
	display: "flex",
	flexWrap: "wrap",
	gap: 40,
	alignItems: "center",
})

const LargeTextBox = styled("div", {
	fontSize: "2rem",
	padding: "10px",
	border: "1px solid orange",
	textAlign: "center",
})

const Link = styled(UniversalLink, {
	textDecoration: "underline",
})

const AnimateNoClip = styled(AutoAnimate, {
	padding: "100vmax",
	margin: "-100vmax",
})

const SmallImage = styled(StaticImage, {
	width: "100px",
	height: "100px",
})

const TextOverflowWrapper = styled("div", {
	maxWidth: "50ch",
	border: "1px solid orange",
})

const SnapWrap = styled("div", {
	display: "flex",
	gap: "1rem",
	overflow: "auto",
	scrollSnapType: "x mandatory",

	within: {
		"& :first-child": {
			marginLeft: "50%",
		},
		"& :last-child": {
			marginRight: "50%",
		},

		// hide scrollbar
		"&::-webkit-scrollbar": {
			display: "none",
		},
	},

	scrollbarWidth: "none",
})

const SnapItem = styled("div", {
	backgroundColor: "orange",
	borderRadius: "0.5rem",
	width: "400px",
	height: "400px",
	display: "grid",
	placeItems: "center",
	fontSize: "100px",
	fontWeight: "bold",
	flexShrink: 0,
	scrollSnapAlign: "center",
})
