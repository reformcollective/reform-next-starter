import { useTrackPageReady } from "library/pageReady"
import { ScreenProvider } from "library/ScreenContext"

export default function GlobalProviders({
	children,
}: { children: React.ReactNode }) {
	useTrackPageReady()

	children = <ScreenProvider>{children}</ScreenProvider>

	return children
}
