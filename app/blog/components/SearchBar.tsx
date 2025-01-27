"use client"

import UniversalLink from "library/Loader/UniversalLink"
import { styled, fresponsive, css } from "library/styled"
import { useQueryState, parseAsString } from "nuqs"

export const useBlogQuery = () =>
	useQueryState("query", parseAsString.withDefault(""))

export function SearchBar() {
	const [query, setQuery] = useBlogQuery()

	return (
		<Wrapper>
			<label
				htmlFor="search"
				aria-label="search the blog"
				style={{ display: "grid" }}
			>
				search
				<input
					id="search"
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					style={{ border: "1px solid red", padding: "10px" }}
				/>
			</label>
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
