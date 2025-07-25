"use client"

import { css, fresponsive, styled } from "library/styled"
import useAutoHideHeader from "library/useAutoHideHeader"
import { useRef } from "react"
import type { HeaderQueryResult } from "@/sanity.types"

export default function Header({ headerText }: NonNullable<HeaderQueryResult>) {
	const text = useRef<HTMLDivElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	useAutoHideHeader(wrapperRef)

	return (
		<Wrapper ref={wrapperRef}>
			<h1 ref={text}>{headerText}</h1>
		</Wrapper>
	)
}

const Wrapper = styled(
	"header",
	fresponsive(css`
		display: grid;
		grid-column: fullbleed;
		place-items: center;
		position: sticky;
		z-index: 1;
		top: 0;
		width: 100%;
		height: 100px;
		background-color: rebeccapurple;
		color: white;
		view-transition-name: header;
	`),
)
