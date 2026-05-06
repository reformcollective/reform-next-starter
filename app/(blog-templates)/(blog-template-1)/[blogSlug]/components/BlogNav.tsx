"use client"

import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import UniversalLink from "library/link"
import { css, f, styled } from "library/styled"

import type { Post } from "../types"

import CaretSVG from "../icons/caret.inline.svg"
import { useHeaderTheme } from "./HeaderTheme"
import Kicker from "./Kicker"

export default function BlogNav({ categories }: { categories: Post["categories"] }) {
	useHeaderTheme("dark")
	return (
		<BlogNavWrapper>
			<BreadCrumbs>
				<StyledUniversalLink href="/blog-1">Blog Home</StyledUniversalLink>
				<Caret />
				<span>Article</span>
			</BreadCrumbs>
			{categories && categories.length > 0 && (
				<Categories>
					<Inner>
						{categories.length > 1 ? "Categories:" : "Category:"}
						<Row>
							{categories.filter(Boolean).map((category: string) => (
								<Kicker size="tag" variant="light" key={category}>
									{category}
								</Kicker>
							))}
						</Row>
					</Inner>
				</Categories>
			)}
		</BlogNavWrapper>
	)
}

const Categories = styled("div", [
	f.responsive(css`
		position: relative;
		width: fit-content;
	`),
	f.small(css`
		width: 100%;
		overflow: scroll;
		mask-image: linear-gradient(to right, black calc(100% - 40px), transparent 100%);

		&::-webkit-scrollbar {
			display: none;
		}

		-ms-overflow-style: none;
		scrollbar-width: none;
	`),
])

const Row = styled("div", [
	f.responsive(css`
		display: flex;
		gap: 8px;
	`),
	f.small(css`
		display: flex;
		gap: 8px;
		margin-left: 20px;
	`),
])

const Inner = styled("div", [
	f.responsive(css`
		display: flex;
		gap: 20px;
		align-items: center;
		${textStyles.blog1.p2};
	`),
	f.small(css`
		width: auto;
		white-space: nowrap;
		gap: 0;
	`),
])

const BlogNavWrapper = styled("nav", [
	f.responsive(css`
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 96px;
		border-bottom: 1px solid ${colors.blog1.secondary400};
		padding: 28px 42px;
		flex-shrink: 0;
	`),
	f.small(css`
		width: 100%;
		height: 145px;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-between;
		padding: 28px 0 14px 14px;
		flex-shrink: 0;
	`),
])

const BreadCrumbs = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		color: ${colors.blog1.primary700};
		${textStyles.blog1.p2};
	`),
	f.small(css`
		gap: unset;
		justify-content: flex-start;
	`),
])

const Caret = styled(CaretSVG, [
	f.responsive(css`
		width: 9px;
		height: 9px;
		margin: 0 20px;
	`),
])

const StyledUniversalLink = styled(UniversalLink, [
	f.responsive(css`
		${textStyles.blog1.p2};
		color: ${colors.blog1.primary700};
		opacity: 0.5;
		cursor: pointer;
		transition:
			color 0.3s ease,
			opacity 0.3s ease;

		&:hover {
			color: ${colors.blog1.primary300};
			opacity: 1;
		}

		&:active {
			color: ${colors.blog1.primary400};
			opacity: 1;
		}
	`),
	f.small(css`
		${textStyles.blog1.p3};
	`),
])
