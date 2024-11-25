import { Categories } from "components/blog/Categories"
import { SearchBar } from "components/blog/SearchBar"
import TemplateBlogContent from "blog/blog-layout"
import styled from "styled-components"
import { postsQuery } from "sanity/lib/queries"
import { sanityFetch } from "sanity/lib/fetch"
import type { PostQueryResult } from "@/sanity.types"

export default async function TemplateBlogPage() {
	const data: PostQueryResult[] = await sanityFetch({ query: postsQuery })

	return (
		<Wrapper>
			<div>pre blog content! anything can go here! make a component!</div>
			<SearchBar />
			<Categories data={data} />
			<TemplateBlogContent posts={data} />
		</Wrapper>
	)
}

const Wrapper = styled.div`
	max-width: 1024px;
	margin: 0 auto;
	border: 1px solid red;
	background: 1px solid orange;
`
