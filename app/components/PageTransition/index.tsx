"use client"

/**
 * PageTransition
 *
 * Displays a full-screen overlay during client-side page navigations.
 * Uses `usePageTransition` to register animation callbacks that run
 * automatically when navigating via the library's custom Link component.
 *
 * Lifecycle:
 *   1. User clicks a link — `animateBefore` runs (overlay fades in)
 *   2. Once the promise resolves, the router navigates to the new page
 *   3. `animateAfter` runs (overlay fades out), revealing the new page
 *
 * `isAnimating` is "before" | "after" | false, used here to toggle
 * opacity and pointer-events so the overlay blocks interaction while visible.
 *
 * To customize:
 *   - Change the animations (e.g. slide, wipe, scale) in animateBefore/animateAfter
 *   - Adjust DURATION to control animation speed
 *   - Add content inside Wrapper (e.g. a logo or loading text) for a branded transition
 *   - Multiple components can call `usePageTransition` — all registered
 *     animations run in parallel during each navigation
 */

import { colors } from "app/styles/colors.css"
import { sleep } from "library/functions"
import { usePageTransition } from "library/link/usePageTransition"
import { css, f, styled } from "library/styled"
import { useRef } from "react"

const DURATION = 500

export default function PageTransition() {
	const wrapper = useRef<HTMLDivElement>(null)

	const { isAnimating } = usePageTransition({
		async animateBefore() {
			const el = wrapper.current
			if (!el) return
			el.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: DURATION,
				easing: "ease-in-out",
				fill: "forwards",
			})
			await sleep(DURATION)
		},
		async animateAfter() {
			const el = wrapper.current
			if (!el) return
			el.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: DURATION,
				easing: "ease-in-out",
				fill: "forwards",
			})
			await sleep(DURATION)
		},
	})

	return (
		<Wrapper
			ref={wrapper}
			style={{
				opacity: isAnimating ? 1 : 0,
				pointerEvents: isAnimating ? "auto" : "none",
			}}
		/>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		position: fixed;
		inset: 0;
		z-index: 9998;
		background: ${colors.black};
		opacity: 0;
		pointer-events: none;
	`),
])
