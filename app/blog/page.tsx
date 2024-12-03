import type { PostsQueryResult } from "@/sanity.types"
import { Categories } from "blog/(components)/Categories"
import { SearchBar } from "blog/(components)/SearchBar"
import { css, fresponsive, styled } from "library/styled"
import { Suspense } from "react"
import { sanityFetch } from "sanity/lib/fetch"
import { postsQuery } from "sanity/lib/queries"
import TemplateBlogContent from "./blog-layout"

export default async function TemplateBlogPage() {
	const data: PostsQueryResult = await sanityFetch({ query: postsQuery })

	return (
		<Wrapper>
			<div>pre blog content! anything can go here! make a component!</div>
			<Suspense>
				<SearchBar />
				<Categories data={data} />
				<TemplateBlogContent posts={data} />
			</Suspense>
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
