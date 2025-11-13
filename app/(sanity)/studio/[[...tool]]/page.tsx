"use client"

import { Portal } from "@ariakit/react"
import { NextStudio } from "next-sanity/studio"
import config from "@/sanity.config"

import "./style.css"
import { Suspense } from "react"

export default function StudioPage() {
	return (
		<Suspense>
			<Portal>
				<NextStudio config={config} />
			</Portal>
		</Suspense>
	)
}
