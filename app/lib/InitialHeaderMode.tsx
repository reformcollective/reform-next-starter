"use client"

import { useInitialHeaderMode } from "library/useSectionTheme"

/** Bridges the page's first-section `headerMode` into the client-side theme context. */
export default function InitialHeaderMode({
	headerMode,
}: {
	headerMode: "light" | "dark" | undefined
}) {
	useInitialHeaderMode(headerMode)
	return null
}
