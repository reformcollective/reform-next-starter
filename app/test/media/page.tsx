"use client"

import { css, fresponsive, styled } from "library/styled"

import User from "./user.svg?inline"
import Gear from "./gear.svg?inline"
import GearTwo from "./gear.svg"
import Image from "next/image"

export default function Page() {
	return (
		<div>
			<StyledUser />
			<Gear />
			<Image
				src={GearTwo}
				alt="gear"
				style={{ width: 100, height: 100, border: "1px solid red" }}
			/>
		</div>
	)
}

// styled SVG
const StyledUser = styled(User, {
	...fresponsive(css`
    height: 24px;
    width: 24px;
  `),
})
