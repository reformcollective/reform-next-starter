import { PostList } from "blog/components/PostList"
import { allPostsQuery } from "blog/queries"
import { sanityFetch } from "library/sanity/reusableFetch"
import { Suspense } from "react"

export default async function BlogAll() {
	const { data: allPosts } = await sanityFetch({ query: allPostsQuery })

	return (
		<>
			<h1>all cards</h1>
			<Suspense fallback={<p>Loading...</p>}>
				<PostList posts={allPosts} />
			</Suspense>
		</>
	)
}
