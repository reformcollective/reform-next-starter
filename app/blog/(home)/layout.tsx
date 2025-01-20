import { Categories } from "blog/components/Categories"
import { SearchBar } from "blog/components/SearchBar"
import { allPostsQuery } from "blog/queries"
import { sanityFetch } from "library/sanity/reusableFetch"
import { css, fresponsive, styled } from "library/styled"
import type { ReactNode } from "react"

export default async function BlogLayout({
	children,
}: {
	children: ReactNode
}) {
	const { data: allCards } = await sanityFetch({ query: allPostsQuery })

	return (
		<Wrapper>
			<div>pre blog content! anything can go here! make a component!</div>
			<SearchBar />
			<Categories items={allCards} />

			{children}
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		max-width: 1024px;
		margin: 0 auto;
	`),
)
