"use client"

import { AnimatedPaths } from "library/AnimatedPaths"
import { keyframes, styled } from "library/styled"
import Gear from "./gear.svg?inline"
import Wave from "./wave.svg?inline"

export default function Page() {
	return (
		<div>
			<StyledGear />
			{Array.from({ length: 12 }).map((_, index) => (
				<SmallGear key={`small-gear-${index + 1}`} />
			))}
			<AnimatedPaths>
				<Wave />
			</AnimatedPaths>
			<ColorAnimation />
			<SpinAnimation />
		</div>
	)
}

const ColorAnimation = keyframes`
	0% { fill: red; }
	33% { fill: blue; }
	66% { fill: green; }
	100% { fill: red; }
`

const SpinAnimation = keyframes`
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
`

const StyledGear = styled(Gear, {
	animation: `${ColorAnimation} 5s linear infinite, ${SpinAnimation} 10s linear infinite`,
	transformOrigin: "center",
	width: "400px",
	height: "400px",
})

const SmallGear = styled(StyledGear, {
	width: "100px",
	height: "100px",
})
