import { Categories } from "blog/(components)/Categories"
import { SearchBar } from "blog/(components)/SearchBar"
import TemplateBlogContent from "./blog-layout"
import { css, fresponsive, styled } from "library/styled"
import { postsQuery } from "sanity/lib/queries"
import { sanityFetch } from "sanity/lib/fetch"
import type { PostsQueryResult } from "@/sanity.types"

export default async function TemplateBlogPage() {
	const data: PostsQueryResult = await sanityFetch({ query: postsQuery })

	return (
		<Wrapper>
			<div>pre blog content! anything can go here! make a component!</div>
			<SearchBar />
			<Categories data={data} />
			<TemplateBlogContent posts={data} />
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		max-width: 1024px;
		margin: 0 auto;
		border: 1px solid red;
		background: 1px solid orange;
	`),
)
