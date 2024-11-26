"use client"

import { keyframes, styled } from "library/styled"
import Gear from "./gear.svg?inline"

export default function Page() {
	return (
		<div>
			<StyledGear />
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
