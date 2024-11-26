"use client"

import {
	css,
	fmobile,
	fresponsive,
	ftablet,
	keyframes,
	styled,
	unresponsive,
} from "library/styled"
import useMedia from "library/useMedia"

export default function Page() {
	return (
		<div>
			{useMedia("full", "desktop", "tablet", "mobile")}
			<Box>Hello world</Box>
			<ColoredBox boxColor="red">I am a box</ColoredBox>
			<UnresponsiveBox>I am unresponsive</UnresponsiveBox>
			<AnimatedBox>I am animated</AnimatedBox>
			<FadeInKeyframes />
			<ComponentWithVariants variant="red" />
			<WithResponsiveSample>asdf</WithResponsiveSample>
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
const ColoredBox = styled(Box, ({ boxColor }: { boxColor: string }) =>
	fresponsive(css`
		background: ${boxColor};
	`),
)

// mixing responsive and unresponsive CSS
const UnresponsiveBox = styled(Box, {
	...unresponsive(css`
		width: 150px;
	`),
	...fresponsive(css`
		color: green;
		border: 10px solid red;
	`),
})

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
const variants = {
	red: css`
		background: red;
		color: green;
	`,
	green: css`
		background: green;
		color: red;
	`,
}
const ComponentWithVariants = styled(
	"div",
	({ variant }: { variant: keyof typeof variants }) =>
		fresponsive(css`
			${variants[variant]}
		`),
)

// responsive styles example
const WithResponsiveSample = styled("div", {
	...fresponsive(css`
		width: 1024px;
	`),
	...ftablet(css`
		width: 512px;
	`),
	...fmobile(css`
		width: 300px;
	`),
})
