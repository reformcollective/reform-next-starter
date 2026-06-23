"use client"

import type { HeaderQueryResult } from "sanity.types"

import { css, f, styled } from "library/styled"
import useAutoHideHeader from "library/useAutoHideHeader"
import { useRef } from "react"

export default function Header({ headerText }: NonNullable<HeaderQueryResult>) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	useAutoHideHeader(wrapperRef)

	return (
		<Wrapper ref={wrapperRef}>
			<div>Header</div>
			<p>{headerText}</p>
		</Wrapper>
	)
}

const Wrapper = styled(
	"header",
	f.responsive(css`
		position: sticky;
		z-index: 1000;
		top: 0;
		display: grid;
		width: 100%;
		height: 100px;
		background-color: rebeccapurple;
		color: white;
		grid-column: fullbleed;
		grid-row: header;
		place-items: center;
		view-transition-name: header;
	`),
)
