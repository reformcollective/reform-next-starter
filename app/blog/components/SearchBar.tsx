"use client"

import { useQueryState } from "nuqs"

export function SearchBar() {
	const [query, setQuery] = useQueryState("query")

	return (
		<div>
			search
			<input value={query ?? ""} onChange={(e) => setQuery(e.target.value)} />
		</div>
	)
}
