import BlogRich from "blog/BlogRich"
import { SmallCard } from "blog/components/SmallCard"
import UniversalLink from "library/Loader/UniversalLink"
import { resolveOpenGraphImage } from "library/sanity/utils"
import { css, fresponsive, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"
import type { Metadata } from "next"
import { defineQuery } from "next-sanity"
import { notFound } from "next/navigation"
import { sanityFetch } from "sanity/lib/live"

type PageProps = {
	params: Promise<{ slug: string }>
}

const postQuery = defineQuery(`
	*[_type == "post" && slug.current == $slug][0]{
		...,
		author->
	}
`)

const relatedPostsQuery = defineQuery(`
	*[_type == "post" && slug.current != $slug][0...3]{
		...,
		author->
	}
`)

const postSlugs = defineQuery(`
    *[_type == "post" && defined(slug.current)]{"slug": slug.current}
`)

export async function generateStaticParams() {
	const { data: slugs } = await sanityFetch({
		query: postSlugs,
		perspective: "published",
		stega: false,
	})
	return slugs
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { data: post } = await sanityFetch({
		query: postQuery,
		params,
		stega: false,
	})

	const imageData = post?.mainImage && resolveOpenGraphImage(post?.mainImage)
	const newImage = imageData ? [imageData] : undefined

	return {
		authors: post?.author?.fullName ? [{ name: post?.author?.fullName }] : [],
		title: post?.title,
		description: post?.preview,
		twitter: {
			card: "summary_large_image",
			images: newImage,
		},
		openGraph: {
			images: newImage,
		},
	} satisfies Metadata
}

export default async function PostPage({ params }: PageProps) {
	const [{ data: post }, { data: relatedPosts }] = await Promise.all([
		sanityFetch({ query: postQuery, params: { slug: (await params).slug } }),
		sanityFetch({
			query: relatedPostsQuery,
			params: {
				slug: (await params).slug,
			},
		}),
	])

	if (!post) return notFound()

	const { articleText } = post

	return (
		<Wrapper>
			<UniversalLink href="/blog">back to blog</UniversalLink>
			<h1>{post.title}</h1>

			<MainImage
				width={1440}
				height={600}
				src={post.mainImage}
				alt={post.mainImage?.alt}
			/>
			<Author>{post.author?.fullName}</Author>
			<Categories>
				post categories:
				{post.categories?.map((category) => (
					<UniversalLink href={`/blog?category=${category}`} key={category}>
						{category}
					</UniversalLink>
				))}
			</Categories>
			<BlogRich value={articleText} />
			<Related>
				related articles:
				{relatedPosts &&
					relatedPosts.length > 0 &&
					relatedPosts.map((article) => (
						<SmallCard key={article._id} post={article} />
					))}
			</Related>
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

const Related = styled(
	"div",

	fresponsive(css`
		display: flex;
		gap: 8px;
	`),
)

const MainImage = styled(
	UniversalImage,
	fresponsive(css`
		width: 400px;
	`),
)

const Author = styled("div", fresponsive(css``))
