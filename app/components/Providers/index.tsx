"use client"

import gsap, { ScrollSmoother, ScrollTrigger } from "gsap/all"
import { useBackButton } from "library/Loader/TransitionUtils"
import { ScreenProvider } from "library/ScreenContext"
import { useTrackPageReady } from "library/pageReady"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export default function GlobalProviders({
	children,
}: {
	children: React.ReactNode
}) {
	useTrackPageReady()
	useBackButton()

	children = <ScreenProvider>{children}</ScreenProvider>

	return children
}
