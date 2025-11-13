import { PostList } from "blog/components/PostList"
import { allPostsQuery } from "blog/queries"
import { Suspense } from "react"
import { sanityFetch } from "sanity/lib/live"

export default async function BlogCategories(
	props: PageProps<"/blog/category/[category]">,
) {
	const { params } = props
	const { data: allPosts } = await sanityFetch({ query: allPostsQuery })
	const category = (await params).category

	const checks = await Promise.all(
		allPosts.map(async (post) => {
			return post.categories?.includes(category)
		}),
	)
	const thisCategory = allPosts.filter((_, i) => checks[i])

	return (
		<>
			<h1>category: {category}</h1>

			<Suspense fallback={<p>Loading Posts...</p>}>
				<PostList posts={thisCategory} />
			</Suspense>
		</>
	)
}
