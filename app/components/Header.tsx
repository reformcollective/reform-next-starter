"use client"

import type { HeaderQueryResult } from "@/sanity.types"
import gsap from "gsap"
import { usePageTransition } from "library/Loader/TransitionUtils"
import { css, fresponsive, styled } from "library/styled"
import useAutoHideHeader from "library/useAutoHideHeader"
import { useRef } from "react"

export default function Header({ headerText }: NonNullable<HeaderQueryResult>) {
	const text = useRef<HTMLDivElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)
	useAutoHideHeader(wrapperRef)

	/**
	 * this is an example of how to include arbitrary elements in a page transition
	 * the element in question is the header in this case
	 *
	 * don't use this pattern for things that occur *after* the page transition, like animating in content
	 */

	const up = () => {
		gsap.to(text.current, {
			yPercent: -100,
			duration: 1,
		})
	}

	const down = () => {
		gsap.to(text.current, {
			yPercent: 0,
			duration: 1,
		})
	}

	usePageTransition("fade", {
		in: up,
		out: down,
		inDuration: 1,
		outDuration: 1,
	})

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
		place-items: center;
		position: sticky;
		z-index: 1;
		top: 0;
		width: 100%;
		height: 100px;
		background-color: rebeccapurple;
		color: white;
	`),
)
