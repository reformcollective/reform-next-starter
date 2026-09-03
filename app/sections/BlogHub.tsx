import type { GetSectionType } from "page"

import { BlogHomeClient } from "app/sections/blog/BlogHomeClient"
import { hubArticlesQuery } from "app/sections/blog/queries"
import { colors } from "app/styles/colors.css"
import { css, f, styled } from "library/styled"
import { sanityFetch } from "sanity/lib/live"

export default async function BlogHubSection({
	featuredPost,
	searchMode,
	hubSlug,
}: GetSectionType<"blogHub"> & { hubSlug: string }) {
	const mode = searchMode === "server" ? "server" : "client"
	const { data: allCards } =
		mode === "client"
			? await sanityFetch({ query: hubArticlesQuery, params: { hubSlug } })
			: { data: [] }

	return (
		<Inner>
			<BlogHomeClient
				allCards={allCards ?? []}
				featuredCaseStudy={featuredPost}
				searchMode={mode}
				hubSlug={hubSlug}
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
