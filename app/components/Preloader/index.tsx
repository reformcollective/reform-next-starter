"use client"

/**
 * Preloader
 *
 * Displays a full-screen overlay on initial page load.
 *
 * `usePreloader` provides two key states:
 *   - `ready`:     page is loaded, fonts ready, animations settled — time to animate out
 *   - `completed`: all exit animations have finished — safe to unmount
 *
 * The hook automatically detects any new CSS animations triggered by the
 * `ready` state change (via flushSync) and waits for them all before
 * setting `completed`. This means you just need to trigger your exit
 * animations from `data-ready` in CSS — no manual onAnimationEnd wiring needed.
 *
 * Lifecycle:
 *   1. Logo pulses while page loads
 *   2. `stopAnimations` tells the hook to find looping animations matching the
 *      selector (within `scope`), let them finish their current cycle, and wait
 *   3. Once settled + minDuration elapsed → `ready = true`
 *   4. CSS animations triggered by `[data-ready]`:
 *      - Logo plays outro (pop and shrink, 0.5s)
 *      - Wrapper fades out (0.5s, delayed 0.5s to start after outro)
 *   5. Hook waits for both animations to finish → `completed = true`
 *   6. Component unmounts
 *
 * usePreloader options:
 *   - `minDuration`          — minimum ms to show the preloader (timed from page load)
 *   - `stopAnimations`       — CSS selector for looping animations to stop gracefully
 *                               (waits for current cycle to finish before setting ready)
 *   - `stopNoWaitAnimations` — same as stopAnimations but doesn't wait for the cycle to finish
 *   - `slowAnimations`       — CSS selector for animations to gradually slow to a stop via GSAP
 *   - `scope`                — ref to the container element (required for stop/slow animations)
 *   - `customAnimation`      — { beforeReady, beforeComplete } promises for JS-driven animations
 *
 * To customize:
 *   - Swap `LogoSVG` for your own logo or loading graphic
 *   - Adjust `minDuration` to control minimum display time
 *   - Edit keyframes in `animations.css.ts` (logoPulse, logoOutro, preloaderExit)
 *   - Add more animated elements and use stopAnimations/slowAnimations to coordinate them
 */

import { usePreloader } from "library/link/usePreloader"
import { useRef } from "react"
import { css, f, styled } from "library/styled"
import { colors } from "app/styles/colors.css"
import { preloaderExit, logoPulse, logoOutro } from "./animations.css"
import LogoSVG from "./images/logo.inline.svg"

export function Preloader() {
	const scopeRef = useRef<HTMLDivElement>(null)

	const { ready, completed, devKey } = usePreloader({
		minDuration: 2000,
		scope: scopeRef,
		// waits for .logo pulse animation to finish its current cycle before setting ready, ensuring a smooth transition
		stopAnimations: ".logo",
	})

	if (completed) return null

	return (
		<Wrapper key={devKey} ref={scopeRef} data-ready={ready || undefined}>
			<Logo className="logo" aria-hidden="true" />
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: grid;
		place-items: center;
		background: ${colors.black};
		pointer-events: auto;

		&[data-ready] {
			/* delayed to start after the logo outro finishes */
			animation: ${preloaderExit} 0.5s 0.5s cubic-bezier(0.76, 0, 0.24, 1)
				forwards;
			pointer-events: none;
		}
	`),
])

const Logo = styled(LogoSVG, [
	f.responsive(css`
		width: 80px;
		height: auto;
		color: ${colors.white};
		animation: ${logoPulse} 2s ease-in-out infinite;

		[data-ready] & {
			animation: ${logoOutro} 0.5s cubic-bezier(0.76, 0, 0.24, 1) forwards;
		}
	`),
])
