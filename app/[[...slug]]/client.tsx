"use client"

import {
	css,
	fmobile,
	fresponsive,
	ftablet,
	keyframes,
	styled,
} from "library/styled"
import type { SanityDocument } from "next-sanity"
import { useOptimistic } from "next-sanity/hooks"
import { type ReactNode, useEffect } from "react"
import type { Page } from "@/sanity.types"

// stickyconfig defines the options for making a section sticky
export type StickyConfig = {
	fullWidth?: string
	tablet?: string
	mobile?: string
	zIndex?: number
}

export const DynamicPageOrder = ({
	documentId,
	sections,
}: {
	documentId: string
	sections: {
		key: string
		content: ReactNode
		stickyConfig?: StickyConfig | null
	}[]
}) => {
	const sectionOrder = sections.map((section) => section.key)

	const order = useOptimistic<string[], SanityDocument<Page>>(
		sectionOrder,
		(currentSections, action) => {
			if (action.id !== documentId) {
				return currentSections
			}

			if (action.document.sections) {
				return action.document.sections.map((section) => section._key)
			}

			return currentSections
		},
	)

	useEffect(() => {
		// reset all sticky positions on mount
		const stickyElements = document.querySelectorAll("[data-sticky-wrapper]")
		stickyElements.forEach((el) => {
			const htmlEl = el as HTMLElement
			htmlEl.style.position = ""
			void htmlEl.offsetHeight
			htmlEl.style.position = ""
		})
	}, [])

	// render each section, passing stickyconfig if present
	return order
		.map((key) => sections.find((section) => section.key === key) ?? key)
		.map((section) =>
			typeof section === "object" ? (
				<Section
					key={section?.key}
					$stickyConfig={section.stickyConfig}
					data-sticky-wrapper
				>
					{section.content}
				</Section>
			) : (
				<Fallback key={section}>
					<Shimmer />
					loading section data...
				</Fallback>
			),
		)
}

const Shimmer = keyframes`
	0% {
		background-position: 100% 0;
	}
	100% {
		background-position: -100% 0;
	}
`

// section is a styled div that applies sticky styles if stickyconfig is present
const Section = styled(
	"div",
	({ $stickyConfig }: { $stickyConfig?: StickyConfig | null }) => {
		const base = {
			gridColumn: "fullbleed",
			display: "grid",
			gridTemplateColumns: "subgrid",
			maxWidth: "100vw",
		}

		// if no stickyconfig, just return base styles
		if (!$stickyConfig) return base

		// apply sticky styles for each breakpoint if present
		const { fullWidth, tablet, mobile, zIndex = 1 } = $stickyConfig

		return {
			...base,

			...(fullWidth &&
				fresponsive(css`
					position: sticky;
					top: ${fullWidth};
					z-index: ${zIndex};
				`)),

			...(!fullWidth &&
				zIndex !== 1 &&
				fresponsive(css`
					z-index: ${zIndex};
				`)),

			...(tablet &&
				ftablet(css`
					position: sticky;
					top: ${tablet};
					z-index: ${zIndex};
				`)),

			...(mobile
				? fmobile(css`
						position: sticky;
						top: ${mobile};
						z-index: ${zIndex};
					`)
				: (fullWidth || tablet) &&
					fmobile(css`
						position: relative;
						top: unset;
					`)),
		}
	},
)

const Fallback = styled("div", {
	...fresponsive(css`
		background: linear-gradient(120deg, #eee 30%, #eef 40%, #eee 50%);
		background-size: 100% 100%;
		height: 500px;
		width: calc(100% - 100px);
		animation: ${Shimmer} 2s infinite linear;
		display: grid;
		place-items: center;
		font-weight: bold;
		margin: 50px;
		border-radius: 50px;
		font-size: 50px;
	`),
})
