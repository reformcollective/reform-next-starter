import PostContent from "app/blog-1/components/PostContent"
import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import { resolveOpenGraphImage } from "library/sanity/opengraph"
import { css, f, styled } from "library/styled/alpha"
import type { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"

export const dynamic = "force-static"

const postSlugsQuery = defineQuery(`
	*[_type == "blog1Post" && defined(slug.current)]{"slug": slug.current}
`)

const postFragment = `{
	_id,
	title,
	"slug": slug.current,
	"author": author->name,
	articleTextPreview,
	mainImage {
		...,
		"data": {
			"lqip": asset->metadata.lqip,
			"aspectRatio": asset->metadata.dimensions.aspectRatio
		}
	},
	"categories": categories[]->title,
	publishedAt,
	readTime
}`

const singlePostQuery = defineQuery(`
	*[_type == "blog1Post" && slug.current == $slug][0] {
		_id,
		title,
		"slug": slug.current,
		"author": author-> {
			name,
			company,
			image {
				...,
				"data": {
					"lqip": asset->metadata.lqip,
					"aspectRatio": asset->metadata.dimensions.aspectRatio
				}
			}
		},
		articleTextPreview,
		mainImage,
		"categories": categories[]->title,
		publishedAt,
		readTime,
		body,
		discoverCTA,
		"relatedPosts": *[_type == "blog1Post" && slug.current != $slug && count((categories[]->title)[@ in ^.categories[]->title]) > 0] | order(publishedAt desc) [0...3] ${postFragment},
		"recentPosts": *[_type == "blog1Post" && slug.current != $slug] | order(publishedAt desc) [0...3] ${postFragment}
	}
`)

export async function generateStaticParams() {
	const { data } = await sanityFetch({
		query: postSlugsQuery,
		perspective: "published",
		disableStega: true,
	})
	return data
}

export async function generateMetadata(
	{ params }: { params: Promise<{ slug: string }> },
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { data: post } = await sanityFetch({
		query: singlePostQuery,
		params,
	})

	const title = post?.title || (await parent).title
	const description = post?.articleTextPreview || (await parent).description
	const imageData = post?.mainImage && resolveOpenGraphImage(post?.mainImage)
	const newImage = imageData ? [imageData] : undefined

	const opengraph = newImage ?? (await parent).openGraph?.images
	const twitter = newImage ?? (await parent).twitter?.images

	return {
		title,
		description,
		twitter: {
			card: "summary_large_image",
			images: twitter,
		},
		openGraph: {
			images: opengraph,
		},
	}
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
	const slug = (await params).slug

	const { data: post } = await sanityFetch({
		query: singlePostQuery,
		params: { slug },
		disableStega: true,
	})

	if (!post) return notFound()

	type PostItem = (typeof post.relatedPosts)[number]
	const relatedIds = new Set(post.relatedPosts.map((p: PostItem) => p._id))
	const fill = post.recentPosts.filter((p: PostItem) => !relatedIds.has(p._id))
	const recentPosts = [...post.relatedPosts, ...fill].slice(0, 3)

	return (
		<Wrapper>
			<Inner>
				<PostContent
					post={post as Parameters<typeof PostContent>[0]["post"]}
					recentPosts={recentPosts as Parameters<typeof PostContent>[0]["recentPosts"]}
				/>
			</Inner>
			{/* TODO: Add DiscoverCTA section here if needed — wire up post.discoverCTA */}
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-column: fullbleed;
		display: grid;
		place-content: center;
		background: ${colors.blog1Evergreen700};
	`),
	f.small(css`
		position: relative;
		grid-template-columns: subgrid;
	`),
])

const Inner = styled("div", [
	f.responsive(css`
		grid-column: fullbleed;
		display: grid;
		place-content: center;
		background: ${colors.blog1Evergreen700};
		${textStyles.p1};
	`),
	f.small(css`
		position: relative;
		grid-template-columns: subgrid;
		padding: 0 8px;
	`),
])
