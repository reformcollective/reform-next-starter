"use client"

import gsap, { ScrollSmoother, ScrollTrigger } from "gsap/all"
import { useTriggerPreloader } from "library/Loader/PreloaderUtils"
import { useBackButton } from "library/Loader/TransitionUtils"
import { ScreenProvider } from "library/ScreenContext"
import { NuqsAdapter } from "nuqs/adapters/next/app"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export default function GlobalProviders({
	children,
}: {
	children: React.ReactNode
}) {
	useBackButton()
	useTriggerPreloader()

	children = (
		<ScreenProvider>
			<NuqsAdapter>{children}</NuqsAdapter>
		</ScreenProvider>
	)

	return children
}
