"use client"

import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled"
import { parseAsString, useQueryState } from "nuqs"
import { useEffect, useState } from "react"

export const useBlogQuery = () => {
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	if (!isClient) {
		return ["", () => {}] as const
	}

	return useQueryState("query", parseAsString.withDefault(""))
}

export function SearchBar() {
	const [query, setQuery] = useBlogQuery()

	return (
		<Wrapper>
			search
			<Label>
				<Input value={query} onChange={(e) => setQuery(e.target.value)} />
			</Label>
			{query && (
				<UniversalLink type="button" onClick={() => setQuery("")}>
					clear
				</UniversalLink>
			)}
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 10px;
	`),
)

const Label = styled(
	"label",
	fresponsive(css`
		display: grid;
	`),
)

const Input = styled(
	"input",
	fresponsive(css`
		border: 1px solid red;
		padding: 10px;
	`),
)
