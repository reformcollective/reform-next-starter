import { colors } from "app/styles/colors.css"
import { resolveOpenGraphImage } from "library/sanity/opengraph"
import { css, f, styled } from "library/styled/alpha"
import { siteURL } from "library/siteURL"
import type { Metadata } from "next"
import { defineQuery } from "next-sanity"
import { Suspense } from "react"
import { sanityFetch } from "sanity/lib/live"
import { BlogHomeClient } from "./BlogHomeClient"

export const dynamic = "force-static"
export const dynamicParams = false

const hubSlugQuery = defineQuery(`*[_type == "blog1Hub"][0]{"slug": slug.current}`)

export async function generateStaticParams() {
	const { data } = await sanityFetch({
		query: hubSlugQuery,
		perspective: "published",
		disableStega: true,
	})
	if (!data?.slug) return []
	return [{ blogSlug: data.slug }]
}

const allPostsQuery = defineQuery(`
	*[_type == "blog1Post"] | order(publishedAt desc) {
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
		publishedAt
	}
`)

const pageSettingsQuery = defineQuery(`*[_type == "settings"][0]`)

const blogHubQuery = defineQuery(`
	*[_type == "blog1Hub"][0] {
		title,
		description,
		noIndex,
		searchMode,
		ogImage {
			...,
			"data": {
				"lqip": asset->metadata.lqip,
				"aspectRatio": asset->metadata.dimensions.aspectRatio
			}
		},
		"featuredPost": featuredPost-> {
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
			publishedAt
		}
	}
`)

export async function generateMetadata({ params }: PageProps<"/[blogSlug]">): Promise<Metadata> {
	const { blogSlug } = await params
	const [{ data: blogHub }, { data: settings }] = await Promise.all([
		sanityFetch({ query: blogHubQuery, disableStega: true }),
		sanityFetch({ query: pageSettingsQuery, disableStega: true }),
	])

	const title = blogHub?.title ?? settings?.defaultTitle
	const description = blogHub?.description ?? settings?.defaultDescription
	const image = blogHub?.ogImage
		? resolveOpenGraphImage(blogHub.ogImage)
		: settings?.ogImage
			? resolveOpenGraphImage(settings.ogImage)
			: undefined
	const imageData = image ? [image] : undefined

	return {
		title,
		description,
		openGraph: {
			type: "website",
			url: `${siteURL}/${blogSlug}`,
			siteName: settings?.defaultTitle ?? undefined,
			images: imageData,
		},
		twitter: {
			card: "summary_large_image",
			images: imageData,
		},
		alternates: {
			canonical: `${siteURL}/${blogSlug}`,
		},
		metadataBase: siteURL,
	}
}

export default async function BlogHome() {
	const { data: blogHub } = await sanityFetch({ query: blogHubQuery, disableStega: true })
	const searchMode = blogHub?.searchMode === "server" ? "server" : "client"
	const { data: allCards } =
		searchMode === "client" ? await sanityFetch({ query: allPostsQuery }) : { data: [] }

	return (
		<>
			{blogHub?.noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
			<Inner>
				<Suspense fallback={<div>Loading blog...</div>}>
					<BlogHomeClient
						allCards={allCards ?? []}
						featuredCaseStudy={blogHub?.featuredPost ?? null}
						searchMode={searchMode}
					/>
				</Suspense>
			</Inner>
		</>
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
