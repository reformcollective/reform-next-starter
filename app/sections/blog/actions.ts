"use server"

import { sanityFetch } from "sanity/lib/live"

import { hubArticlesQuery, hubArticlesSearchQuery } from "./queries"

type PostList = NonNullable<
	Awaited<ReturnType<typeof sanityFetch<typeof hubArticlesQuery>>>["data"]
>

export async function searchPosts(
	query: string,
	hubSlug: string,
	nestedHubPrefixes: string[],
): Promise<PostList> {
	if (!query.trim()) {
		const { data } = await sanityFetch({
			query: hubArticlesQuery,
			params: { hubSlug, nestedHubPrefixes },
		})
		return data ?? []
	}
	// Append * to each term for prefix matching (e.g. "Uta" matches "Utah")
	const wildcardQuery = query
		.trim()
		.split(/\s+/)
		.map((term) => `${term}*`)
		.join(" ")
	// groq-js cannot infer params from match expressions — plain string query, params typed freely
	const { data } = await sanityFetch({
		query: hubArticlesSearchQuery,
		params: { searchQuery: wildcardQuery, hubSlug, nestedHubPrefixes },
	})
	return (data ?? []) as PostList
}
