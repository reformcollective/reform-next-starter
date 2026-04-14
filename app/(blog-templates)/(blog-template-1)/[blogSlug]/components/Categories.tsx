"use client"

import { colors } from "styles/colors.css"
import textStyles from "styles/text"
import { css, f, styled } from "library/styled/alpha"
import { useBlogCategory } from "./SearchBar"
import type { Card } from "../types"

export function Categories({ items }: { items: Card[] }) {
	const [categories, setCategories] = useBlogCategory()

	const uniqueCategories = Array.from(
		new Set(
			items.flatMap((item) => item?.categories?.filter((c): c is string => c !== null) ?? []),
		),
	).sort((a, b) => a.localeCompare(b))

	const toggle = (item: string) => {
		if (categories.includes(item)) {
			setCategories(categories.filter((c) => c !== item))
		} else {
			setCategories([...categories, item])
		}
	}

	return (
		<Wrapper>
			<CategoryHeader>Categories</CategoryHeader>
			<PillGroup>
				<Pill
					type="button"
					data-selected={categories.length === 0}
					onClick={() => setCategories(null)}
				>
					All
				</Pill>
				{uniqueCategories.map((item) => {
					const selected = categories.includes(item)
					return (
						<Pill type="button" key={item} onClick={() => toggle(item)} data-selected={selected}>
							{item}
						</Pill>
					)
				})}
			</PillGroup>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		color: ${colors.blog1Evergreen700};
	`),
	f.small(css`
		padding-top: 25px;
		padding-bottom: 50px;
		margin-bottom: 20px;
	`),
])

const CategoryHeader = styled("div", [
	f.responsive(css`
		${textStyles.p2};
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 24px;
		padding-bottom: 24px;
		border-bottom: 1px solid ${colors.blog1Cream400};
	`),
])

const PillGroup = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	`),
])

const Pill = styled("button", [
	f.responsive(css`
		${textStyles.p3};
		padding: 12px 14px;
		border-radius: 999px;
		border: 1px solid transparent;
		background: ${colors.blog1Cream400};
		color: ${colors.blog1Evergreen700};
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s;

		&:active {
			background: ${colors.blog1Cream300};
			border-color: ${colors.blog1Cream400};
		}

		&[data-selected="true"] {
			background: ${colors.blog1Evergreen200};
			border-color: transparent;
		}

		&[data-selected="true"]:active {
			background: ${colors.blog1Evergreen100};
			border-color: ${colors.blog1Evergreen200};
		}
	`),
])
