import { allPostsQuery } from "blog/queries"
import { sanityFetch } from "library/sanity/reusableFetch"
import { BlogHomeClient } from "./BlogHomeClient"

export default async function BlogHome() {
	const { data: allCards } = await sanityFetch({ query: allPostsQuery })

	return (
		<div>
			normal blog display
			<BlogHomeClient allCards={allCards} />
		</div>
	)
}
