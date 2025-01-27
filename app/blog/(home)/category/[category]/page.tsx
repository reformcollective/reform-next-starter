import { PostList } from "blog/components/PostList"
import { allPostsQuery } from "blog/queries"
import { sanityFetch } from "library/sanity/reusableFetch"
import type { SinglePostQueryResult } from "@/sanity.types"

export default async function BlogCategories({
	params,
}: {
	params: Promise<{ category: string }>
}) {
	const { data: allPosts } = await sanityFetch({ query: allPostsQuery })
	const category = (await params).category

	const thisCategory = allPosts.filter(async (post: SinglePostQueryResult) =>
		post?.categories?.includes(category),
	)

	return (
		<>
			<h1>category: {category}</h1>
			<PostList posts={thisCategory} />
		</>
	)
}
