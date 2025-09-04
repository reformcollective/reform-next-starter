"use client"

import PageTransition from "components/PageTransition"
import { loader } from "library/link/loader"
import { createScrollLock } from "library/Scroll"
import { css, keyframes } from "library/styled"
import { useMedia } from "library/useMedia"
import { Transition } from "library/ViewTransition"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * Main wrapper component for page transitions.
 * Handles both view transitions and fallback transitions based on media queries.
 * Integrates with loader events and manages scroll locking during transitions.
 */

export default function TransitionWrapper({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	// Todo - if not desired turn off page transitions brutefforce style  for any viewports

	const overrideViewTransitions = useMedia(true, true, true, true)

	/**
	 * Sets up loader event listeners to update the transition state on the document.
	 * Cleans up listeners on unmount.
	 */
	useEffect(() => {
		const handleStart = ({ name }: { name?: string }) => {
			document.documentElement.dataset.transition = name ?? "page"
		}

		const handleEnd = () => {
			document.documentElement.dataset.transition = "page"
		}

		loader.addEventListener("start", handleStart)
		loader.addEventListener("end", handleEnd)

		return () => {
			loader.removeEventListener("start", handleStart)
			loader.removeEventListener("end", handleEnd)
		}
	}, [])

	if (overrideViewTransitions) {
		return (
			<>
				<PageTransition />
				<div
					style={{
						gridColumn: "fullbleed",
						display: "grid",
						gridTemplateColumns: "subgrid",
					}}
				>
					{children}
				</div>
			</>
		)
	}

	return (
		<>
			<style>{css`
				::view-transition-group(*) {
					z-index: 10;
				}

				::view-transition-group(page-bg) {
					z-index: 1;
					animation-duration: 1.5s;
				}

				::view-transition-old(header),
				::view-transition-new(header) {
					animation: none;
				}

				::view-transition-group(header) {
					z-index: 100;
				}

				::view-transition-group(root) {
					z-index: 10;
				}
			`}</style>

			{/* Define animations for view transitions */}

			<SlideAway />
			<SlideIn />
			<SlideAwayReverse />
			<SlideInReverse />

			<Transition
				key={pathname}
				default="none"
				exit={
					{
						// Todo: Add any transitions if needed using this syntax:
						// "html::view-transition-old(&)": {
						//  	animation: `${SlideIn} 1.5s ${eases.cubic.inOut}`,
						//  },
					}
				}
				onEnter={() => {
					// Things to do when a transition starts

					window.lenis?.scrollTo(0, { immediate: true })

					const scrollLock = createScrollLock("lock")
					console.log("created scroll lock")
					const onEnd = () => {
						console.log("releasing scroll lock")
						loader.removeEventListener("end", onEnd)
						scrollLock.release()
					}
					loader.addEventListener("end", onEnd)
				}}
				enter={
					{
						// Todo: Add any transitions if needed using this syntax:
						// "html::view-transition-new(&)": {
						//  	animation: `${SlideIn} 1.5s ${eases.cubic.inOut}`,
						//  },
					}
				}
			>
				<div
					style={{
						gridColumn: "fullbleed",
						display: "grid",
						gridTemplateColumns: "subgrid",
					}}
				>
					{children}
				</div>
			</Transition>
		</>
	)
}

const SlideAway = keyframes`
	from {
		translate: 0 0;
	}
	to {
		translate: 0 -100vh;
	}
`

const SlideIn = keyframes`
	from {
		translate: 0 100vh;
	}
	to {
		translate: 0 0;
	}
`

const SlideAwayReverse = keyframes`
	from {
		translate: 0 0;
	}
	to {
		translate: 0 100vh;
	}
`

const SlideInReverse = keyframes`
	from {
		translate: 0 -100vh;
	}
	to {
		translate: 0 0;
	}
`
