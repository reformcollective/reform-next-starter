"use client"

import gsap from "gsap/all"
import { isBrowser } from "library/deviceDetection"
import { css, fresponsive, keyframes, styled } from "library/styled"
import { useAnimation } from "library/useAnimation"
import { motion } from "motion/react"
import { useEffect, useRef } from "react"

export default function Page() {
	const divDefault = useRef<HTMLDivElement>(null)
	const divCss = useRef<HTMLDivElement>(null)

	useAnimation(() => {
		gsap.from(divDefault.current, {
			opacity: 0,
			duration: 2,
		})

		gsap.to(divCss.current, {
			opacity: 1,
			duration: 2,
		})
	}, [])

	if (isBrowser) {
		// block the main thread for a second
		const startTime = performance.now()
		while (performance.now() - startTime < 500) {
			// do nothing
		}
	}

	useEffect(() => {
		const interval = setInterval(() => {
			if (isBrowser) {
				// block the main thread for a second
				const startTime = performance.now()
				while (performance.now() - startTime < 500) {
					// do nothing
				}
			}
		}, 500)

		return () => clearInterval(interval)
	}, [])

	return (
		<div>
			<Motion
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 2 }}
			>
				animated with motion
			</Motion>
			<GsapDefault ref={divDefault}>
				animated with gsap, javascript only
			</GsapDefault>
			<GsapCss ref={divCss}>animated with gsap, css initial state</GsapCss>
			<Css>animated with css</Css>
			<FadeIn />
		</div>
	)
}

const boxStyles = fresponsive(css`
	margin: 10px;
	padding: 10px;
	border: 1px solid black;
	background: orange;
`)

const Motion = styled(motion.div, boxStyles)

const GsapDefault = styled("div", boxStyles)

const GsapCss = styled("div", {
	...boxStyles,
	opacity: 0,
})

const FadeIn = keyframes`
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
`

const Css = styled("div", {
	...boxStyles,
	animation: `${FadeIn} 2s`,
})
