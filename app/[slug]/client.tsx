"use client"

import type { Page } from "@/sanity.types"
import { studioUrl } from "@/sanity/lib/api"
import { env } from "env"
import { siteURL } from "library/siteURL"
import { css, fresponsive, keyframes, styled } from "library/styled"
import { createDataAttribute, type SanityDocument } from "next-sanity"
import { useOptimistic } from "next-sanity/hooks"
import type { ReactNode } from "react"

const config = {
	projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
	dataset: env.NEXT_PUBLIC_SANITY_DATASET,
	baseUrl: `${siteURL}${studioUrl}`,
}

export const DynamicPageOrder = ({
	documentId,
	documentType,
	sections,
}: {
	documentId: string
	documentType: string
	sections: {
		key: string
		content: ReactNode
	}[]
}) => {
	const sectionOrder = sections.map((section) => section.key)

	const order = useOptimistic<string[], SanityDocument<Page>>(
		sectionOrder,
		(currentSections, action) => {
			// The action contains updated document data from Sanity
			// when someone makes an edit in the Studio

			// If the edit was to a different document, ignore it
			if (action.id !== documentId) {
				return currentSections
			}

			// If there are sections in the updated document, use them
			if (action.document.sections) {
				// Reconcile References. https://www.sanity.io/docs/enabling-drag-and-drop#ffe728eea8c1
				return action.document.sections.map((section) => section._key)
			}

			// Otherwise keep the current sections
			return currentSections
		},
	)

	return order
		.map((key) => sections.find((section) => section.key === key))
		.map((section) =>
			section ? (
				<div
					key={section?.key ?? Math.random()}
					data-sanity={createDataAttribute({
						...config,
						id: documentId,
						type: documentType,
						path: `sections[_key=="${section.key}"]`,
					}).toString()}
				>
					{section.content}
				</div>
			) : (
				<Fallback key={Math.random()}>
					<Shimmer />
					Loading section data...
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

const Fallback = styled("div", {
	...fresponsive(css`
		background: linear-gradient(120deg, #eee 30%, #eef 40%, #eee 50%);
		background-size: 200% 100%;
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
