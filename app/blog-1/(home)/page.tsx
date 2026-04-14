import { colors } from "app/styles/colors.css"
import { css, f, styled } from "library/styled/alpha"
import type { Metadata } from "next"
import { defineQuery } from "next-sanity"
import { Suspense } from "react"
import { sanityFetch } from "sanity/lib/live"
import { DiscoverCTA } from "app/blog-1/components/DiscoverCTA"
import { BlogHomeClient } from "./BlogHomeClient"

export const dynamic = "force-static"

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
		publishedAt,
		readTime
	}
`)

const blogHubQuery = defineQuery(`
	*[_type == "blog1Hub"][0] {
		title,
		discoverCTA {
			...,
			"link": link {
				...,
				"internalSlug": internalLink->slug.current
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
			publishedAt,
			readTime
		}
	}
`)

export const metadata: Metadata = {
	title: "Blog",
	description: "Insights and updates from our team.",
}

export default async function BlogHome() {
	const { data: allCards } = await sanityFetch({ query: allPostsQuery })
	const { data: blogHub } = await sanityFetch({ query: blogHubQuery, disableStega: true })

	return (
		<>
			<Inner>
				<Suspense fallback={<div>Loading blog...</div>}>
					<BlogHomeClient
						allCards={(allCards ?? []) as Parameters<typeof BlogHomeClient>[0]["allCards"]}
						featuredCaseStudy={
							(blogHub?.featuredPost ?? null) as Parameters<
								typeof BlogHomeClient
							>[0]["featuredCaseStudy"]
						}
					/>
				</Suspense>
			</Inner>
			{blogHub?.discoverCTA && <DiscoverCTA {...blogHub.discoverCTA} />}
		</>
	)
}

const Inner = styled("div", [
	f.responsive(css`
		position: relative;
		grid-column: fullbleed;
		grid-template-columns: subgrid;
		width: 1416px;
		margin: 0 auto;
		background: ${colors.blog1Cream200};
		border-radius: 16px;
	`),
	f.small(css`
		width: 100%;
	`),
])
