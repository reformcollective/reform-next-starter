import PostContent from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/PostContent"
import { colors } from "app/styles/colors.css"
import { resolveOpenGraphImage } from "library/sanity/opengraph"
import { css, f, styled } from "library/styled"
import { siteURL } from "library/siteURL"
import type { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"
import { imageField, videoField } from "library/sanity/assetMetadata"

export const dynamic = "force-static"
export const dynamicParams = false

const postSlugsQuery = defineQuery(`
	*[_type == "blog1Post" && defined(slug.current)]{"slug": slug.current}
`)

const postFragment = `{
	_id,
	title,
	"slug": slug.current,
	"author": author->name,
	articleTextPreview,
	${imageField("mainImage")},
	"categories": categories[]->title,
	publishedAt
}` as const

const singlePostQuery = defineQuery(`
	*[_type == "blog1Post" && slug.current == $slug][0] {
		_id,
		title,
		"slug": slug.current,
		"author": author-> {
			name,
			company,
			${imageField("image")}
		},
		articleTextPreview,
		${imageField("mainImage")},
		"categories": categories[]->title,
		publishedAt,
		body[] {
			...,
			${imageField('_type == "image" =>')},
			${videoField('_type == "video" =>')}
		},
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
	{ params }: PageProps<"/[blogSlug]/[slug]">,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { blogSlug, slug } = await params
	const { data: post } = await sanityFetch({ query: singlePostQuery, params: { slug } })

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
		alternates: {
			canonical: `${siteURL}/${blogSlug}/${slug}`,
		},
		metadataBase: siteURL,
	}
}

export default async function PostPage({ params }: PageProps<"/[blogSlug]/[slug]">) {
	const { slug } = await params

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
			<PostContent post={post} recentPosts={recentPosts} />
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
