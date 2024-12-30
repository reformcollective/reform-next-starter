"use client"

import config from "@/sanity.config"
import * as Portal from "@radix-ui/react-portal"
import { useInterval } from "ahooks"
import { isBrowser } from "library/deviceDetection"
import { NextStudio } from "next-sanity/studio"

import "./style.css"

export const dynamic = "force-static"

/**
 * if we get. e.g. key errors, we don't want an error overlay
 */
if (isBrowser) console.error = (message) => console.warn(message)

export default function StudioPage() {
	useInterval(() => {
		window.lenis?.destroy()
	}, 4)

	return (
		<Portal.Root>
			<NextStudio config={config} />
		</Portal.Root>
	)
}
