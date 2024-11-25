"use client"

import { LargeCard } from "components/blog/LargeCard"
import { SmallCard } from "components/blog/SmallCard"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { useSearchResults } from "library/useSearchResults"
import { useEffect } from "react"
import styled from "styled-components"
import type { PostQueryResult } from "@/sanity.types"
import { useQueryState } from "nuqs"

export default async function TemplateBlogContent({
	posts,
}: {
	posts: PostQueryResult[]
}) {
	const allCards = posts
		.filter((post) => post !== null)
		.map((post) => ({ ...post, id: post._id }))
	if (!allCards) return null

	// first card with featuredArticle
	const featuredCard = allCards.find((x) => x?.featuredArticle)
	const allUnfeaturedCards = allCards.filter(
		(card) => card?._id !== featuredCard?._id,
	)
	const firstPageCards = allUnfeaturedCards.slice(0, 9)
	const hasMoreThanOnePage = allUnfeaturedCards.length > 9

	const [query, setQuery] = useQueryState("query")
	const [category, setCategory] = useQueryState("category")
	const [showAll, setShowAll] = useQueryState("showAll")

	/**
	 * instant scroll to top on any query change
	 */
	// biome-ignore lint/correctness/useExhaustiveDependencies: allowable side effect
	useEffect(() => {
		if (query || category) setShowAll(null)
		ScrollSmoother.get()?.scrollTo(0)
	}, [query, category, showAll])

	const searchedCards = useSearchResults(query ?? "", allCards, [
		"author",
		"slug",
		"title",
	])
	const searchedAndCategorizedCards = category
		? searchedCards.filter((card) => card?.categories?.includes(category))
		: searchedCards

	const view = query || category ? "search" : showAll ? "all" : "firstPage"

	return (
		<Wrapper>
			{view === "all" && (
				<>
					<h1>all cards</h1>
					<Grid>
						{allCards.map((card) => (
							<SmallCard
								image={card?.mainImage}
								preview={card?.metadataDescription}
								published={card?.publishDate}
								slug={card?.slug?.current}
								title={card?.title}
								key={card?._id}
								author={card?.author?.name}
							/>
						))}
					</Grid>
				</>
			)}
			{view === "firstPage" && (
				<>
					<h1>normal blog display</h1>
					{featuredCard && (
						<LargeCard
							image={featuredCard.mainImage}
							preview={featuredCard.metadataDescription}
							published={featuredCard.publishDate}
							slug={featuredCard.slug?.current}
							title={featuredCard.title}
							key={featuredCard.id}
							author={featuredCard.author?.name}
						/>
					)}
					<Grid>
						{firstPageCards.map((card) => (
							<SmallCard
								image={card.mainImage}
								preview={card.metadataDescription}
								published={card.publishDate}
								slug={card.slug?.current}
								title={card.title}
								key={card.id}
								author={card.author?.name}
							/>
						))}
					</Grid>
					{hasMoreThanOnePage && (
						<ShowAll type="button" onClick={() => setShowAll("true")}>
							show all
						</ShowAll>
					)}
				</>
			)}
			{view === "search" && (
				<>
					{query && category ? (
						<h1>
							Search results for <span>“{query}”</span> in{" "}
							<span>{category}</span>
						</h1>
					) : category ? (
						<h1>Categories / {category}</h1>
					) : (
						<h1>
							Search results for <span>“{query}”</span>
						</h1>
					)}
					<ShowAll
						type="button"
						onClick={() => {
							setQuery("")
							setCategory("")
						}}
					>
						clear all
					</ShowAll>

					<Grid>
						{searchedAndCategorizedCards.map((card) => {
							if (!card) return null
							return (
								<SmallCard
									image={card.mainImage}
									preview={card?.metadataDescription}
									published={card?.publishDate}
									slug={card?.slug?.current}
									title={card?.title}
									key={card?._id}
									author={card?.author?.name}
								/>
							)
						})}
					</Grid>
				</>
			)}
		</Wrapper>
	)
}

const Wrapper = styled.div`
	position: relative;
`

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`

const ShowAll = styled.button``
