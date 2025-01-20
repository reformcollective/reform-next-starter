import { PostList } from "blog/components/PostList"
import { allPostsQuery } from "blog/queries"
import { sanityFetch } from "library/sanity/reusableFetch"

export default async function BlogAll() {
	const { data: allPosts } = await sanityFetch({ query: allPostsQuery })

	return (
		<>
			<h1>all cards</h1>
			<PostList posts={allPosts} />
		</>
	)
}
