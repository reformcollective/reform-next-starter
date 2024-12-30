"use client"

import config from "@/sanity.config"
import * as Portal from "@radix-ui/react-portal"
import { css, fresponsive, styled } from "library/styled"
import { NextStudio } from "next-sanity/studio"
import "./style.css"

export const dynamic = "force-static"

export default function StudioPage() {
	return (
		<Wrapper className="studio-wrapper">
			<NextStudio config={config} />
		</Wrapper>
	)
}

const Wrapper = styled(
	Portal.Root,
	fresponsive(css`
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 10000;
	`),
)
