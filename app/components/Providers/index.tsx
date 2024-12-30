"use client"

import gsap, { ScrollTrigger } from "gsap/all"
import { useTriggerPreloader } from "library/Loader/PreloaderUtils"
import { useBackButton } from "library/Loader/TransitionUtils"
import { ScreenProvider } from "library/ScreenContext"
import { useSmoothScroll } from "library/Scroll"
import { VisualEditing } from "next-sanity"
import { NuqsAdapter } from "nuqs/adapters/next/app"

gsap.registerPlugin(ScrollTrigger)

export default function GlobalProviders({
	children,
}: {
	children: React.ReactNode
}) {
	useBackButton()
	useTriggerPreloader()
	useSmoothScroll()

	children = (
		<>
			<VisualEditing />
			{/* {useIsIframe() ? <VisualEditing /> : null} */}
			{children}
		</>
	)
	children = <ScreenProvider>{children}</ScreenProvider>
	children = <NuqsAdapter>{children}</NuqsAdapter>

	return children
}
