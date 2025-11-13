"use client"

import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled/alpha"
import { useQueryState, useQueryStates } from "nuqs"

export const useBlogQuery = () => {
	return useQueryState("query", parseAsString.withDefault(""))
}

export function SearchBar() {
	const [query, setQuery] = useQueryState(
		"query",
		parseAsString.withDefault(""),
	)

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
