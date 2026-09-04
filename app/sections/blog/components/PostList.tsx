"use client"

import { useSearchResults } from "library/useSearchResults"

import type { RecentPosts } from "../types"

import { useBlogQuery } from "./SearchBar"
import SmallCard from "./SmallCard"

export function PostList({ posts }: { posts: RecentPosts }) {
	const [searchQuery] = useBlogQuery()

	const seen = new Set<string>()
	const uniquePosts = (posts ?? []).filter((post) => {
		if (seen.has(post._id)) return false
		seen.add(post._id)
		return true
	})

	const searchedCards = useSearchResults(
		searchQuery,
		uniquePosts,
		["author", "path", "title"],
		"_id",
	)

	return (
		<>
			{searchedCards.map((post) => (
				<SmallCard key={post._id} data={post} />
			))}
		</>
	)
}
