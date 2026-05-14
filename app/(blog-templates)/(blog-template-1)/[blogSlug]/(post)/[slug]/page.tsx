import type { Metadata, ResolvingMetadata } from "next"

import PostContent from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/PostContent"
import { colors } from "app/styles/colors.css"
import { imageField, videoField } from "library/sanity/assetMetadata"
import { resolveOpenGraphImage } from "library/sanity/opengraph"
import { siteURL } from "library/siteURL"
import { css, f, styled } from "library/styled"
import { defineQuery } from "next-sanity"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import {
	getDynamicFetchOptions,
	sanityFetch,
	sanityFetchStaticParams,
	type DynamicFetchOptions,
} from "sanity/lib/live"

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
	const data = await sanityFetchStaticParams({
		query: postSlugsQuery,
	})
	if (data.length === 0) return [{ slug: "__missing-post__" }]

	return data
}

export async function generateMetadata(
	{ params }: PageProps<"/[blogSlug]/[slug]">,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { blogSlug, slug } = await params
	const { perspective } = await getDynamicFetchOptions()
	const post = await cachedPostMetadata({ slug, perspective })

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

async function cachedPostMetadata({
	slug,
	perspective,
}: { slug: string } & Pick<DynamicFetchOptions, "perspective">) {
	"use cache"

	const { data: post } = await sanityFetch({
		query: singlePostQuery,
		params: { slug },
		perspective,
		stega: false,
	})
	return post
}

export default async function PostPage({ params }: PageProps<"/[blogSlug]/[slug]">) {
	const { isEnabled: isDraftMode } = await draftMode()
	if (isDraftMode) {
		return (
			<Suspense fallback={null}>
				<DynamicPostPage params={params} />
			</Suspense>
		)
	}

	const { slug } = await params
	return <CachedPostPage slug={slug} perspective="published" stega={false} />
}

async function DynamicPostPage({ params }: Pick<PageProps<"/[blogSlug]/[slug]">, "params">) {
	const { slug } = await params
	const { perspective, stega } = await getDynamicFetchOptions()
	return <CachedPostPage slug={slug} perspective={perspective} stega={stega} />
}

async function CachedPostPage({
	slug,
	perspective,
	stega,
}: { slug: string } & Pick<DynamicFetchOptions, "perspective" | "stega">) {
	"use cache"

	const { data: post } = await sanityFetch({
		query: singlePostQuery,
		params: { slug },
		perspective,
		stega,
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
