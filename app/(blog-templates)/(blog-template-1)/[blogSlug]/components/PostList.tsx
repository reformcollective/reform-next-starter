"use client"

import { useSearchResults } from "library/useSearchResults"
import { useBlogQuery } from "./SearchBar"
import SmallCard from "./SmallCard"
import type { RecentPosts } from "../types"

export function PostList({ posts }: { posts: RecentPosts }) {
	const [searchQuery] = useBlogQuery()

	const seen = new Set<string>()
	const uniquePosts = (posts ?? [])
		.filter((p): p is { _id: string } & typeof p => Boolean(p?._id))
		.filter((p) => {
			if (seen.has(p._id)) return false
			seen.add(p._id)
			return true
		})

	const searchedCards = useSearchResults(
		searchQuery,
		uniquePosts,
		["author", "slug", "title"],
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
