"use client"

import type { AllPostsQueryResult } from "@/sanity.types"
import { PostList } from "blog/components/PostList"
import { LargeCard } from "blog/components/LargeCard"
import { useBlogQuery } from "blog/components/SearchBar"
import UniversalLink from "library/link"

export function BlogHomeClient({
	allCards,
}: {
	allCards: AllPostsQueryResult
}) {
	const featuredCard = allCards.find((x) => x?.isFeatured)
	const allUnfeaturedCards = allCards.filter(
		(card) => card?._id !== featuredCard?._id,
	)
	const firstPageCards = allUnfeaturedCards.slice(0, 9)
	const hasMoreThanOnePage = allUnfeaturedCards.length > 9

	const [searchQuery] = useBlogQuery()

	return (
		<>
			{!searchQuery && (
				<>
					<h1>featured</h1>
					<LargeCard post={featuredCard} />
					<h2>rest of cards</h2>
				</>
			)}
			<PostList posts={firstPageCards} />
			<UniversalLink href={{ pathname: "/blog/all" }}>show all</UniversalLink>
		</>
	)
}
