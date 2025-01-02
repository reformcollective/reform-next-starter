import { Categories } from "blog/components/Categories"
import { SearchBar } from "blog/components/SearchBar"
import { sanityFetch } from "sanity/lib/live"
import { css, fresponsive, styled } from "library/styled"
import { defineQuery } from "next-sanity"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import TemplateBlogContent from "./BlogLayout"

const postsQuery = defineQuery(`
	*[_type == "post"]{
		...,
		author->
	}
`)

export default async function TemplateBlogPage() {
	const { data } = await sanityFetch({ query: postsQuery })

	if (!data) notFound()

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
