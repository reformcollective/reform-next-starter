"use client"

import gsap, { ScrollSmoother, ScrollTrigger } from "gsap/all"
import { useTrackPageReady } from "library/pageReady"
import { ScreenProvider } from "library/ScreenContext"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export default function GlobalProviders({
	children,
}: { children: React.ReactNode }) {
	useTrackPageReady()

	children = <ScreenProvider>{children}</ScreenProvider>

	return children
}
