"use client"

import gsap, { ScrollSmoother, ScrollTrigger } from "gsap/all"
import { useBackButton } from "library/Loader/TransitionUtils"
import { useTrackPageReady } from "library/pageReady"
import { ScreenProvider } from "library/ScreenContext"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export default function GlobalProviders({
	children,
}: { children: React.ReactNode }) {
	useTrackPageReady()
	useBackButton()

	children = <ScreenProvider>{children}</ScreenProvider>

	return children
}
