"use client"

import { createVar } from "@vanilla-extract/css"
import {
	css,
	f,
	fmobile,
	fresponsive,
	ftablet,
	keyframes,
	styled,
	unresponsive,
} from "library/styled/alpha"
import { useMedia } from "library/useMedia"

export default function Page() {
	return (
		<div>
			{useMedia("full", "desktop", "tablet", "mobile")}
			<Box>Hello world</Box>
			<ColoredBox boxColor="red">I am a box</ColoredBox>
			<UnresponsiveBox>I am partially unresponsive</UnresponsiveBox>
			<AnimatedBox>I am animated</AnimatedBox>
			<FadeInKeyframes />
			<ComponentWithVariants variant="red" />
			<WithResponsiveSample>
				test with some <code>code</code>
			</WithResponsiveSample>
			<FullyScaled>I am fully scaled</FullyScaled>
		</div>
	)
}

// standard component
const Box = styled(
	"div",
	fresponsive(css`
		background: red;
		border: 10px solid black;
		padding: 10px;
		margin: 10px;
	`),
)

// extending a component + passing props
const boxColor = createVar()
const ColoredBox = styled(Box, {
	base: { color: boxColor },
	variables: { boxColor },
})

// mixing responsive and unresponsive CSS
const UnresponsiveBox = styled(Box, [
	unresponsive(css`
		width: 200px;
		background-color: blue;
	`),
	f.responsive(css`
		color: white;
		padding: 20px;
	`),
])

// animations
const FadeInKeyframes = keyframes`
  0% {
    background:red;
  }
  33% {
    background:yellow;
  }
  66% {
    background:blue;
  }
  100% {
    background:red;
  }
`

const AnimatedBox = styled(
	Box,
	fresponsive(css`
		animation: ${FadeInKeyframes} 2s infinite;
	`),
)

// variants example
const ComponentWithVariants = styled("div", {
	variants: {
		variant: {
			red: fresponsive(css`
				background: red;
				color: green;
			`),
			green: fresponsive(css`
				background: green;
				color: red;
			`),
		},
	},
})

// responsive styles example
const WithResponsiveSample = styled("div", [
	f.responsive(css`
		border: 10px solid black;
		margin: 10px;
		padding: 10px;
		color: purple;
	`),
	ftablet(css`
		width: 512px;
		background: dodgerblue;
		color: red;
	`),
	fmobile(css`
		width: 300px;
		background-color: green;
		color: orange;
	`),
	{
		within: {
			code: [
				f.responsive(css`
					font-family: monospace;
					color: #00d5ff;
				`),
				f.mobile(css`
					color: blue;
				`),
			],
		},
	},
])

// fully scaled example
const FullyScaled = styled(
	"div",
	fresponsive(
		css`
			background: red;
			border: 10px solid black;
			padding: 10px;
			margin: 10px;
		`,
		{
			scaleFully: true,
		},
	),
)
