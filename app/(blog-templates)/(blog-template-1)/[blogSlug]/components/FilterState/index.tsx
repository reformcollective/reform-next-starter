"use client"

import type { ReactNode } from "react"
import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import CaretSVG from "../../icons/caret.inline.svg"
import ClearFilterSVG from "./clear-filter.inline.svg"
import { useBlogCategory, useBlogQuery, useBlogShowAll } from "../SearchBar"

export function FilterState() {
	const [query, setQuery] = useBlogQuery()
	const [categories, setCategories] = useBlogCategory()
	const [, setShowAll] = useBlogShowAll()

	const hasCategories = categories.length > 0
	const isActive = Boolean(query) || hasCategories

	const clearAll = () => {
		void setQuery(null)
		void setCategories(null)
		void setShowAll(null)
	}

	const clearLabel =
		query && hasCategories
			? "Clear Filters"
			: query
				? "Clear Search"
				: categories.length > 1
					? "Clear Categories"
					: "Clear Category"

	const useCount = categories.length > 4 || (categories.length > 1 && Boolean(query))
	const categoryList = useCount ? (
		<Highlight>{categories.length} categories</Highlight>
	) : (
		<CategoryStack>
			{categories.map((cat, i) => (
				<span key={cat}>
					<Highlight>{cat}</Highlight>
					{i < categories.length - 2 && ", "}
					{i === categories.length - 2 && " & "}
				</span>
			))}
		</CategoryStack>
	)

	let label: ReactNode
	if (query && hasCategories) {
		label = (
			<>
				Search results for <Highlight>"{query}"</Highlight> in {categoryList}
			</>
		)
	} else if (query) {
		label = (
			<>
				Search results for <Highlight>"{query}"</Highlight>
			</>
		)
	} else if (hasCategories) {
		label = categoryList
	}

	return (
		<Bar>
			<BreadCrumb>
				<AllCategories onClick={clearAll}>All Categories</AllCategories>
				{isActive && (
					<>
						<Caret />
						<ActiveLabel>{label}</ActiveLabel>
					</>
				)}
			</BreadCrumb>
			{isActive && (
				<ClearButton type="button" onClick={clearAll}>
					<ClearIcon />
					{clearLabel}
				</ClearButton>
			)}
		</Bar>
	)
}

const Bar = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 0;
		margin-bottom: 24px;
	`),
	f.small(css`
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 16px;
	`),
])

const BreadCrumb = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		color: ${colors.blog1.primary700};
		${textStyles.blog1.p2};
	`),
	f.small(css`
		align-items: flex-start;
	`),
])

const CategoryStack = styled("span", [
	f.small(css`
		display: flex;
		flex-flow: row wrap;
		white-space: pre;
	`),
])

const AllCategories = styled("button", [
	f.responsive(css`
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
		white-space: nowrap;
		transform: translateY(-5px);
	`),
])

const Caret = styled(CaretSVG, [
	f.responsive(css`
		width: 9px;
		height: 9px;
		margin: 0 12px;
	`),
	f.small(css`
		flex-shrink: 0;
	`),
])

const ActiveLabel = styled("span", [
	f.responsive(css`
		${textStyles.blog1.p2};
		color: ${colors.blog1.secondary500};
	`),
])

const Highlight = styled("span", [
	f.responsive(css`
		color: ${colors.blog1.primary800};
	`),
])

const ClearButton = styled("button", [
	f.responsive(css`
		${textStyles.blog1.p2};
		display: flex;
		align-items: center;
		gap: 8px;
		color: ${colors.blog1.primary700};
		flex-shrink: 0;
		cursor: pointer;
		transition: color 0.15s ease;

		&:active {
			color: ${colors.blog1.primary300};

			svg path:first-child {
				fill: ${colors.blog1.primary300};
				stroke: ${colors.blog1.primary300};
			}

			svg path:not(:first-child) {
				stroke: white;
			}
		}
	`),
	f.small(css`
		padding: 0;
		gap: 0;
		margin-top: 20px;
	`),
])

const ClearIcon = styled(ClearFilterSVG, [
	f.responsive(css`
		width: 24px;
		height: 24px;
		flex-shrink: 0;
		transform: translateY(-1px);
		
		path {
			transition:
				fill 0.15s ease,
				stroke 0.15s ease;
		}
	`),
	f.small(css`
		margin-right: 8px;
	`),
])
