"use client"

import gsap from "gsap"
import { loader } from "library/Loader"
import { usePreloader } from "library/Loader/PreloaderUtils"
import { css, fresponsive, styled } from "library/styled"
import { useRef, useState } from "react"
import textStyles from "styles/text"

export default function Preloader() {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [progress, setProgress] = useState(0)

	loader.useEventListener("progressUpdated", (newProgress: number) => {
		setProgress(newProgress)
	})

	const slideOut = () => {
		gsap.to(wrapperRef.current, {
			y: "-100vh",
			duration: 1,
		})
	}

	const fadeOut = () => {
		gsap.to(wrapperRef.current, {
			opacity: 0,
			duration: 1,
		})
	}

	usePreloader({
		only: "whenAtTop",
		duration: 1,
		callback: slideOut,
	})

	/**
	 * you'll probably want to use a shorter animation when the page is scrolled,
	 * since that means the user is probably reloading the page (which we want to be fast)
	 */
	usePreloader({
		only: "whenScrolled",
		duration: 1,
		callback: fadeOut,
	})

	loader.useEventListener("end", () => {
		gsap.set(wrapperRef.current, { display: "none" })
	})

	return (
		<Wrapper ref={wrapperRef}>
			<h1>BLUE TRANSITION</h1>
			<h1>{Math.round(progress)}</h1>
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background-color: dodgerblue;
		z-index: 100;
		pointer-events: none;
		display: grid;
		place-items: center;
		${textStyles.h1}
	`),
)
