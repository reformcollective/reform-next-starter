import BlogRich from "blog/BlogRich"
import { PostList } from "blog/components/PostList"
import { relatedPostsQuery, singlePostQuery } from "blog/queries"
import UniversalLink from "library/link"
import { resolveOpenGraphImage } from "library/sanity/utils"
import { css, fresponsive, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"
import type { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import { defineQuery } from "next-sanity"
import { Suspense } from "react"
import { sanityFetch } from "sanity/lib/live"

const postSlugsQuery = defineQuery(`
	*[_type == "post" && defined(slug.current)]{"slug": slug.current}
`)

export async function generateStaticParams() {
	const { data } = await sanityFetch({
		query: postSlugsQuery,
		perspective: "published",
		stega: false,
	})
	return data
}

export async function generateMetadata(
	{ params }: PageProps<"/blog/post/[slug]">,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { data: post } = await sanityFetch({
		query: singlePostQuery,
		params,
		stega: false,
	})

	const title = post?.title || (await parent).title
	const description = post?.preview || (await parent).description
	const imageData = post?.mainImage && resolveOpenGraphImage(post?.mainImage)
	const newImage = imageData ? [imageData] : undefined

	const opengraph = newImage ?? (await parent).openGraph?.images
	const twitter = newImage ?? (await parent).twitter?.images

	return {
		title,
		description,
		twitter: {
			card: "summary_large_image",
			images: twitter,
		},
		openGraph: {
			images: opengraph,
		},
	}
}

export default async function PostPage(props: PageProps<"/blog/post/[slug]">) {
	const { params } = props
	const [{ data: post }, { data: relatedPosts }] = await Promise.all([
		sanityFetch({
			query: singlePostQuery,
			params: { slug: (await params).slug },
		}),
		sanityFetch({
			query: relatedPostsQuery,
			params: {
				slug: (await params).slug,
			},
		}),
	])

	if (!post) return notFound()

	return (
		<Wrapper>
			<UniversalLink href={"/blog"}>back to blog</UniversalLink>

			<h1>{post.title}</h1>
			<UniversalImage width={1440} height={600} src={post.mainImage} />
			<div>{post.author?.fullName}</div>

			<Categories>
				post categories:
				{post.categories?.map((category) => (
					<UniversalLink href={"/blog/category/[category]"} key={category}>
						{category}
					</UniversalLink>
				))}
			</Categories>

			<BlogRich value={post.content} />

			{relatedPosts && relatedPosts.length > 0 && (
				<>
					related posts:
					<Suspense fallback={<div>Loading related posts...</div>}>
						<PostList posts={relatedPosts} />
					</Suspense>
				</>
			)}
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

const Categories = styled(
	"div",

	fresponsive(css`
		display: flex;
		gap: 8px;
	`),
)
