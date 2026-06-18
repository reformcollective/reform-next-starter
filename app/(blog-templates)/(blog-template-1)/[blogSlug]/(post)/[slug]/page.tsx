import type { Metadata, ResolvingMetadata } from "next"

import PostContent from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/PostContent"
import { resolveMetaTitle } from "app/lib/metadata"
import { colors } from "app/styles/colors.css"
import { assetMetadataFunctions } from "library/sanity/assetMetadata"
import { resolveOpenGraphImage } from "library/sanity/opengraph"
import { siteURL } from "library/siteURL"
import { css, f, styled } from "library/styled"
import { defineQuery } from "next-sanity"
import { notFound } from "next/navigation"
import { sanityFetch } from "sanity/lib/live"

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
	"mainImage": reform::image(mainImage),
	"categories": categories[]->title,
	publishedAt
}` as const

const singlePostQuery = defineQuery(`
	${assetMetadataFunctions}

	*[_type == "blog1Post" && slug.current == $slug][0] {
		_id,
		title,
		metaTitle,
		"slug": slug.current,
		"author": author-> {
			name,
			company,
			"image": reform::image(image)
		},
		articleTextPreview,
		"mainImage": reform::image(mainImage),
		"categories": categories[]->title,
		publishedAt,
		body[] {
			...,
			_type == "image" => reform::image(@),
			_type == "video" => reform::video(@)
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
	const parentMetadata = await parent
	const parentTitle = typeof parentMetadata.title === "string" ? parentMetadata.title : undefined

	const title = resolveMetaTitle({
		title: post?.metaTitle || post?.title,
		suffix: parentTitle,
	})
	const description = post?.articleTextPreview || parentMetadata.description
	const imageData = post?.mainImage && resolveOpenGraphImage(post?.mainImage)
	const newImage = imageData ? [imageData] : undefined

	const opengraph = newImage ?? parentMetadata.openGraph?.images
	const twitter = newImage ?? parentMetadata.twitter?.images

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
