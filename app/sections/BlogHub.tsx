import type { GetSectionType } from "page"

import { BlogHomeClient } from "app/sections/blog/BlogHomeClient"
import { hubArticlesQuery, nestedHubsQuery } from "app/sections/blog/queries"
import { colors } from "app/styles/colors.css"
import { PageCommitSignal } from "library/link/usePageTransition"
import { css, f, styled } from "library/styled"
import { sanityFetch } from "sanity/lib/live"

export default async function BlogHubSection({
	featuredPost,
	searchMode,
	hubSlug,
}: GetSectionType<"blogHub"> & { hubSlug: string }) {
	const mode = searchMode === "server" ? "server" : "client"

	// a hub deeper in the tree owns its own articles, so they are excluded from this one
	const { data: nestedHubs } = await sanityFetch({ query: nestedHubsQuery, params: { hubSlug } })
	const nestedHubPrefixes = nestedHubs.map((slug) => `${slug}/`)

	const { data: allCards } =
		mode === "client"
			? await sanityFetch({ query: hubArticlesQuery, params: { hubSlug, nestedHubPrefixes } })
			: { data: [] }

	return (
		<Inner>
			{/* signalled here rather than by the route: this section sits behind a Suspense
			    boundary, so the page commits before it does */}
			<PageCommitSignal />
			<BlogHomeClient
				allCards={allCards ?? []}
				featuredCaseStudy={featuredPost}
				searchMode={mode}
				hubSlug={hubSlug}
				nestedHubPrefixes={nestedHubPrefixes}
			/>
		</Inner>
	)
}

const Inner = styled("div", [
	f.responsive(css`
		position: relative;
		grid-column: main;
		background: ${colors.blog1.secondary200};
		border-radius: 16px;
	`),
	f.small(css`
		width: 100%;
	`),
])
