"use server"

import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"

const allPostsServerQuery = defineQuery(`
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

// groq-js does not infer $param from `match` expressions, so defineQuery cannot
// be used here. The query and return type are correct at runtime.
const searchedPostsQuery = `
	*[_type == "blog1Post" && [title, pt::text(body)] match $query] | order(publishedAt desc) {
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
`

type PostList = NonNullable<
	Awaited<ReturnType<typeof sanityFetch<typeof allPostsServerQuery>>>["data"]
>

export async function searchPosts(query: string): Promise<PostList> {
	if (!query.trim()) {
		const { data } = await sanityFetch({ query: allPostsServerQuery })
		return data ?? []
	}
	// Append * to each term for prefix matching (e.g. "Uta" matches "Utah")
	const wildcardQuery = query
		.trim()
		.split(/\s+/)
		.map((term) => `${term}*`)
		.join(" ")
	// cast required: groq-js cannot infer $param from match expressions
	const { data } = await sanityFetch({
		query: searchedPostsQuery as unknown as typeof allPostsServerQuery,
		params: { query: wildcardQuery },
	})
	return (data as PostList) ?? []
}
