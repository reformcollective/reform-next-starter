"use client"

import { NextStudio } from "next-sanity/studio"
import * as Portal from "@radix-ui/react-portal"

import config from "@/sanity.config"
import { css, fresponsive, styled } from "library/styled"

export const dynamic = "force-static"

export default function StudioPage() {
	return (
		<Wrapper>
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
