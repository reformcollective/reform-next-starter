import { PostList } from "blog/components/PostList"
import { allPostsQuery } from "blog/queries"
import { Suspense } from "react"
import { sanityFetch } from "sanity/lib/live"

export default async function BlogCategories({
	params,
}: {
	params: Promise<{ category: string }>
}) {
	const { data: allPosts } = await sanityFetch({ query: allPostsQuery })
	const category = (await params).category

	const thisCategory = allPosts.filter(async (post) =>
		post.categories?.includes(category),
	)

	return (
		<>
			<h1>category: {category}</h1>

			<Suspense fallback={<p>Loading Posts...</p>}>
				<PostList posts={thisCategory} />
			</Suspense>
		</>
	)
}
