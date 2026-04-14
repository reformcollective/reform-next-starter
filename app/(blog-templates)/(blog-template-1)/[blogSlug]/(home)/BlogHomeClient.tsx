"use client"

import LargeCard from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/LargeCard"
import { Categories } from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/Categories"
import { FilterState } from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/FilterState"
import {
	useBlogCategory,
	useBlogQuery,
	useBlogShowAll,
	SearchBar,
} from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/SearchBar"
import SmallCard from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/SmallCard"
import { useHeaderTheme } from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/HeaderTheme"
import { colors } from "styles/colors.css"
import textStyles from "styles/text"
import { css, f, styled } from "library/styled/alpha"
import { useMedia } from "library/useMedia"
import { useSearchResults } from "library/useSearchResults"
import { getResponsivePixels } from "library/viewportUtils"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import type { Card, FeaturedCard } from "../types"

const PAGE_SIZE = 8

type BlogHomeClientProps = {
	allCards: Card[]
	featuredCaseStudy: FeaturedCard | null
}

export function BlogHomeClient({ allCards, featuredCaseStudy }: BlogHomeClientProps) {
	const featuredCard = featuredCaseStudy
	const isDebug = useSearchParams().has("debug")
	const baseCards = allCards.filter((card) => card?._id !== featuredCard?._id)
	const allUnfeaturedCards = isDebug
		? [1, 2, 3, 4, 5].flatMap((i) => baseCards.map((c) => ({ ...c, _id: `${c._id}-debug-${i}` })))
		: baseCards

	const [searchQuery] = useBlogQuery()
	const [categories] = useBlogCategory()
	const [showAll] = useBlogShowAll()
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	const isSmall = useMedia(false, false, true, true)
	const columnsRef = useRef<HTMLDivElement>(null)

	useHeaderTheme("dark")

	useEffect(() => {
		if ((searchQuery || categories.length > 0 || showAll) && columnsRef.current)
			window.lenisInstance?.scrollTo(columnsRef.current, { offset: -getResponsivePixels(120) })
		setVisibleCount(PAGE_SIZE)
	}, [searchQuery, categories, showAll, isSmall])

	const searchedCards = useSearchResults(
		searchQuery ?? "",
		[...allUnfeaturedCards],
		["articleTextPreview", "author", "slug", "title"],
		"_id",
	)
	const categorizedCards =
		categories.length > 0
			? searchedCards.filter((card) => categories.some((cat) => card.categories?.includes(cat)))
			: searchedCards

	const isFiltered = Boolean(searchQuery) || categories.length > 0
	const activeCards = isFiltered ? categorizedCards : allUnfeaturedCards
	const visibleCards = activeCards.slice(0, visibleCount)
	const hasMore = visibleCount < activeCards.length

	return (
		<BlogWrapper>
			<FeaturedSection>
				{featuredCard ? <LargeCard data={featuredCard} /> : undefined}
			</FeaturedSection>
			<Columns ref={columnsRef}>
				<Line />
				<Left>
					<StickyWrapper>
						<SearchBar />
						<Categories items={allCards} />
					</StickyWrapper>
				</Left>
				<Right>
					<FilterState />
					<Bottom>
						<Suspense fallback={<HelperText>Loading posts...</HelperText>}>
							<CardGroup>
								{visibleCards.map((card) => (
									<SmallCard key={card._id} data={card} />
								))}
								{isFiltered && activeCards.length === 0 && (
									<NotFoundWrapper>
										<NotFoundTitle>Nothing Found Yet</NotFoundTitle>
										<NotFoundDescription>
											We're constantly adding new content. Try a different search or check back
											soon.
										</NotFoundDescription>
									</NotFoundWrapper>
								)}
							</CardGroup>
						</Suspense>
						{hasMore && (
							<LoadMoreButton type="button" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
								Load More
							</LoadMoreButton>
						)}
					</Bottom>
				</Right>
			</Columns>
		</BlogWrapper>
	)
}

const BlogWrapper = styled("div", [
	f.responsive(css`
		grid-column: main;
		margin: 0 auto;
	`),
	f.small(css`
		width: 100%;
	`),
])

const Columns = styled("div", [
	f.responsive(css`
		position: relative;
		display: flex;
		justify-content: space-between;
		padding: 28px 42px 0;
	`),
	f.small(css`
		padding: 42px 14px 14px;
		width: 100%;
		flex-direction: column;
	`),
])

const StickyWrapper = styled("div", [
	f.responsive(css`
		position: sticky;
		top: 120px;
		width: 337px;
		display: flex;
		flex-direction: column;
		gap: 42px;
		
		.extra-margin {
			margin-right: 15px;
		}
	`),
	f.small(css`
		position: relative;
		width: 100%;
		gap: 30px;
		top: unset;
	`),
])

const Left = styled("div", [
	f.responsive(css`
		padding-bottom: 84px;
	`),
	f.small(css`
		width: 100%;
		padding-bottom: 0;
	`),
])

const Right = styled("div", [
	f.responsive(css`
		width: 827px;
	`),
	f.small(css`
		width: 100%;
	`),
])

const FeaturedSection = styled("div", [
	f.responsive(css`
		position: relative;
	`),
	f.small(css`
		padding: 14px;
	`),
])

const Line = styled("hr", [
	f.responsive(css`
		position: absolute;
		top: 0;
		left: 42px;
		right: 42px;
		height: 1px;
		width: calc(100% - 84px);
		background: ${colors.blog1Cream400};
	`),
	f.small(css`
		position: relative;
		margin: 0 0 42px;
		width: 100%;
		left: unset;
		right: unset;
	`),
])

const HelperText = styled("div", [
	f.responsive(css`
		${textStyles.p1};
	`),
])

const NotFoundTitle = styled("p", [
	f.responsive(css`
		${textStyles.h2Serif};
	`),
	f.small(css`
		${textStyles.h4Serif};
		text-align: center;
	`),
])

const NotFoundDescription = styled("p", [
	f.responsive(css`
		${textStyles.p2};
		width: 317px;
		text-align: center;
		margin-top: 60px;
	`),
	f.small(css`
		${textStyles.p3};
		width: 100%;
		margin-top: 32px;
	`),
])

const Bottom = styled("div", [
	f.responsive(css`
		padding-bottom: 84px;
	`),
	f.small(css`
		display: flex;
		flex-direction: column;
		align-items: center;
	`),
])

const CardGroup = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 42px 28px;
		padding-bottom: 5px;
	`),
	f.small(css`
		grid-template-columns: 1fr;
		gap: 36px;
	`),
])

const LoadMoreButton = styled("button", [
	f.responsive(css`
		${textStyles.p2};
		margin-top: 84px;
		padding: 24px;
		border-radius: 10px;
		border: 1px solid transparent;
		background: ${colors.blog1Cream400};
		color: ${colors.blog1Evergreen900};
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;

		&:hover {
			background: ${colors.blog1Cream300};
		}

		&:active {
			border-color: ${colors.blog1Cream400};
		}
	`),
	f.small(css`
		margin: 56px auto 0;
	`),
])

const NotFoundWrapper = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding: 108px 106px;
		width: 827px;
		grid-column: 1 / -1;
		background: ${colors.blog1Cream100};
		border-radius: 10px;
		border: 1px solid ${colors.blog1Cream400};
	`),
	f.small(css`
		position: relative;
		padding: 56px 28px;
		width: 100%;
		gap: 56px;
	`),
])
