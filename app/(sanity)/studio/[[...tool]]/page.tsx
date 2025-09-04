"use client"

import { Portal } from "@ariakit/react"
import { useInterval } from "ahooks"
import { isBrowser } from "library/deviceDetection"
import { NextStudio } from "next-sanity/studio"
import config from "@/sanity.config"

import "./style.css"

/**
 * if we get. e.g. key errors, we don't want an error overlay
 */
if (isBrowser) console.error = (message) => console.warn(message)

export const dynamic = "force-static"

export default function StudioPage() {
	useInterval(() => {
		window.lenis?.destroy()
	}, 4)

	return (
		<Portal>
			<NextStudio config={config} />
		</Portal>
	)
}
