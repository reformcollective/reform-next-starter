"use client"

import gsap from "gsap/all"
import { sleep } from "library/functions"
import { usePageTransition } from "library/link/usePageTransition"
import { css, f, styled } from "library/styled"
import { useRef } from "react"
import colors from "styles/colors"
const smoothEase = "cubic-bezier(0.5, 0, 0, 1)"

export default function PageTransition() {
	const wrapper = useRef<HTMLDivElement>(null)
	const text = useRef<HTMLDivElement>(null)

	const { isAnimating } = usePageTransition({
		async animateBefore() {
			gsap.set(wrapper.current, { "--preloader-hidden": 0 })

			await sleep(1450)
		},
		async animateAfter() {
			gsap.set(wrapper.current, { "--preloader-hidden": 1, delay: 0.2 })
			await sleep(1050)
		},
	})

	return (
		<Wrapper ref={wrapper} style={{ opacity: isAnimating ? 1 : 0 }}>
			<Text ref={text}>Page Transition Text</Text>
		</Wrapper>
	)
}

const Wrapper = styled("div", () => ({
	...f.responsive(css`
		--preloader-hidden: 1;

		position: fixed;
		inset: 0;
		z-index: 999;
		display: grid;
		place-items: center;
		translate: 0 calc(var(--preloader-hidden, 1) * 50%);
		transition:
			translate 1.05s ${smoothEase},
			opacity 0.2s ease-in-out;
		pointer-events: none;

		&::before,
		&::after {
			content: "";
			position: absolute;
			left: 0;
			width: 100%;
			background: ${colors.red};
			z-index: -1;
			transition: translate 1.05s ${smoothEase};
		}

		&::before {
			top: 0;
			translate: 0 calc(var(--preloader-hidden, 1) * -200%);
			height: 50%;
		}

		&::after {
			top: 50%;
			height: 100%;
		}
	`),
}))

const Text = styled("div", () => ({
	...f.responsive(css`
		font-size: 2rem;
		color: ${colors.red};
		text-align: center;
		opacity: 0;
		transition: opacity 0.2s ease-in-out;
	`),
}))
