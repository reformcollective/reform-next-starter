"use client"

import gsap, { InertiaPlugin } from "gsap/all"
import { css, fresponsive, keyframes, styled } from "library/styled"
import { useAnimation } from "library/useAnimation"
import { motion } from "motion/react"
import { useRef, useState } from "react"
import { Tween } from "react-gsap"

gsap.registerPlugin(InertiaPlugin)

export default function Page() {
	const divDefault = useRef<HTMLDivElement>(null)
	const divCss = useRef<HTMLDivElement>(null)
	const [hover, setHover] = useState(false)
	const scaleInertia = useRef<number>()

	useAnimation(() => {
		gsap.from(divDefault.current, {
			opacity: 0,
			duration: 2,
		})

		gsap.to(divCss.current, {
			opacity: 1,
			duration: 2,
		})

		let previousScale: number | undefined

		gsap.context(() => {
			gsap.ticker.add((time, deltaTime) => {
				const scale = gsap.getProperty(divDefault.current, "scale")
				if (typeof scale === "number") {
					if (previousScale === undefined) {
						previousScale = scale
					} else {
						scaleInertia.current = ((scale - previousScale) / deltaTime) * 1000
						previousScale = scale
					}
				}
			})
		})
	}, [])

	useAnimation(() => {
		console.log(scaleInertia.current)
		if (scaleInertia.current === undefined) return
		gsap.to(divDefault.current, {
			ease: "linear",
			inertia: {
				duration: 2,
				scale: {
					velocity: scaleInertia.current,
					end: hover ? 2 : 1,
				},
			},
		})
	}, [hover])

	return (
		<Wrapper>
			<Motion
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 2 }}
			>
				animated with motion
			</Motion>
			<GsapDefault
				ref={divDefault}
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
			>
				animated with gsap, javascript only
			</GsapDefault>
			<Tween from={{ opacity: 0 }} duration={2}>
				<GsapDefault>animated with gsap, react-gsap</GsapDefault>
			</Tween>
			<GsapCss ref={divCss}>animated with gsap, css initial state</GsapCss>
			<Css>animated with css</Css>
			<FadeIn />
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		display: grid;
		width: 100%;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		gap: 10px;
		padding: 100px;
	`),
)

const boxStyles = fresponsive(css`
	margin: 10px;
	padding: 10px;
	border: 1px solid black;
	background: orange;
	aspect-ratio: 1;
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
