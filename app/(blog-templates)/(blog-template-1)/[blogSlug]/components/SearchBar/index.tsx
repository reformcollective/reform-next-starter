"use client"

import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import SearchIcon from "./search.inline.svg"
import { css, f, styled } from "library/styled/alpha"
import { useDebounceFn } from "ahooks"
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs"
import { useEffect, useState } from "react"

export const useBlogQuery = () => {
	return useQueryState("query", parseAsString.withDefault(""))
}

export const useBlogCategory = () => {
	return useQueryState(
		"category",
		parseAsArrayOf(parseAsString).withDefault([]).withOptions({ scroll: false }),
	)
}

export const useBlogShowAll = () => {
	return useQueryState("showAll", parseAsString.withDefault(""))
}

export function SearchBar() {
	const [query, setQuery] = useBlogQuery()
	const [inputValue, setInputValue] = useState(() => query ?? "")

	const { run: debouncedSetQuery } = useDebounceFn((value: string) => setQuery(value || null), {
		wait: 500,
	})

	useEffect(() => {
		if (!query) setInputValue("")
	}, [query])

	return (
		<Wrapper>
			<Row>
				<Input
					name="search"
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value)
						debouncedSetQuery(e.target.value)
					}}
					type="text"
					placeholder="Search..."
				/>
				<StyledSearchIcon />
			</Row>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		width: 337px;
	`),
	f.small(css`
		width: 100%;
	`),
])

const Row = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		flex-grow: 1;
	`),
])

const Input = styled("input", [
	f.responsive(css`
		padding: 21px 0 21px 48px;
		height: 40px;
		width: 100%;
		${textStyles.blog1.p2};
		background: ${colors.blog1.secondary400};
		border-radius: 10px;
		border: 1px solid transparent;
		transition: border-color 0.3s ease;

		&::placeholder {
			color: ${colors.blog1.secondary500};
		}

		&:hover {
			border-color: ${colors.blog1.secondary500};
		}

		&:focus,
		&:not(:placeholder-shown) {
			border-color: ${colors.blog1.secondary500};
		}

		&:focus {
			outline: none;
		}
	`),
])

const StyledSearchIcon = styled(SearchIcon, {
	base: [
		f.responsive(css`
			position: absolute;
			left: 20px;
			width: 20px;
			height: 20px;
		`),
	],
})
