"use client"

import type { Author, Post } from "@/sanity.types"
import { useSearchResults } from "library/useSearchResults"
import { useBlogQuery } from "./SearchBar"
import { SmallCard } from "./SmallCard"
import { css, fresponsive, styled } from "library/styled"

export function PostList({
	posts,
}: {
	posts: (
		| (Omit<Post, "author"> & {
				author: Author | null | undefined
		  })
		| null
		| undefined
	)[]
}) {
	const [searchQuery] = useBlogQuery()

	const searchedCards = useSearchResults(
		searchQuery,
		posts
			?.filter((post) => post !== null && post !== undefined)
			.map((post) => ({ ...post, id: post._id })) ?? [],
		["author", "slug", "title"],
	)

	return (
		<Wrapper>
			{searchedCards.map((post) => (
				<SmallCard key={post._id} post={post} />
			))}
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	`),
)
