import type { GetSectionType } from "page"
import type { Page } from "sanity.types"

import PostContent from "app/sections/blog/components/PostContent"
import { articleContextQuery } from "app/sections/blog/queries"
import { colors } from "app/styles/colors.css"
import { css, f, styled } from "library/styled"
import { sanityFetch } from "sanity/lib/live"

export default async function BlogArticleSection({
	body,
	pageMainImage,
	pageId,
	title,
	articleTextPreview,
	publishedAt,
}: GetSectionType<"blogArticle"> & {
	pageId: string
	title: Page["title"]
	articleTextPreview: Page["articleTextPreview"]
	publishedAt: Page["publishedAt"]
}) {
	const { data: context } = await sanityFetch({
		query: articleContextQuery,
		params: { id: pageId },
	})

	if (!context) return null

	const relatedIds = new Set(context.related.map((post) => post._id))
	const fill = context.recent.filter((post) => !relatedIds.has(post._id))
	const recentPosts = [...context.related, ...fill].slice(0, 3)

	return (
		<Wrapper>
			<PostContent
				title={title}
				mainImage={pageMainImage}
				articleTextPreview={articleTextPreview}
				publishedAt={publishedAt}
				body={body}
				context={context}
				recentPosts={recentPosts}
			/>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-column: fullbleed;
		display: grid;
		grid-template-columns: subgrid;
		background: ${colors.blog1.primary700};
	`),
])
