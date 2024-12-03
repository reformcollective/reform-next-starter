import { defineQuery, type PortableTextBlock } from "next-sanity"
import type { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import PortableText from "blog/portable-text"

import { sanityFetch } from "sanity/lib/fetch"
import { postQuery, postsQuery, settingsQuery } from "sanity/lib/queries"
import { resolveOpenGraphImage, urlForImage } from "sanity/lib/utils"
import { css, fresponsive, styled } from "library/styled"
import UniversalLink from "library/Loader/UniversalLink"
import { Image } from "next-sanity/image"
import { SmallCard } from "blog/(components)/SmallCard"
import type {
	PostQueryResult,
	PostsQueryResult,
	SettingsQueryResult,
} from "@/sanity.types"

type Props = {
	params: Promise<{ slug: string }>
}

const postSlugs = defineQuery(
	`*[_type == "post" && defined(slug.current)]{"slug": slug.current}`,
)

export async function generateStaticParams() {
	return await sanityFetch({
		query: postSlugs,
		perspective: "published",
		stega: false,
	})
}

export async function generateMetadata(
	{ params }: Props,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const post = await sanityFetch({
		query: postQuery,
		params,
		stega: false,
	})
	const previousImages = (await parent).openGraph?.images || []
	const ogImage = post?.mainImage
		? resolveOpenGraphImage(post.mainImage)
		: undefined

	return {
		authors: post?.author?.fullName ? [{ name: post?.author?.fullName }] : [],
		title: post?.title,
		description: post?.metadataDescription,
		openGraph: {
			images: ogImage ? [ogImage, ...previousImages] : previousImages,
		},
	} satisfies Metadata
}

export default async function PostPage({ params }: Props) {
	try {
		const [post, settings, allPosts]: [
			PostQueryResult,
			SettingsQueryResult,
			PostsQueryResult,
		] = await Promise.all([
			sanityFetch({ query: postQuery, params }),
			sanityFetch({ query: settingsQuery }),
			sanityFetch({ query: postsQuery }),
		])

		if (!post) return null

		const related = allPosts
		const { articleText } = post

		const mainImageURL = urlForImage(post.mainImage)?.url()

		return (
			<Wrapper>
				<UniversalLink href="/blog">back to blog</UniversalLink>
				<h1>{post.title}</h1>
				{mainImageURL && (
					<MainImage
						width={1440}
						height={600}
						src={mainImageURL}
						alt={mainImageURL ?? ""}
					/>
				)}
				<Author>{post.author?.fullName}</Author>
				<Categories>
					post categories:
					{post.categories?.map((category) => (
						<UniversalLink href={`/blog?category=${category}`} key={category}>
							{category}
						</UniversalLink>
					))}
				</Categories>
				{typeof articleText !== "undefined" && articleText && (
					// Bad but not sure how else to do this
					<PortableText value={articleText as PortableTextBlock[]} />
				)}

				<Related>
					related articles:
					{related.length > 0 &&
						related.map((article) => (
							<SmallCard
								author={article.author}
								image={article.mainImage}
								preview={article.metadataDescription}
								published={article.publishDate}
								slug={article?.slug?.current}
								title={article.title}
								key={article._id}
							/>
						))}
				</Related>
			</Wrapper>
		)
	} catch (error) {
		console.error("Post page rendering error:", error)
		return notFound()
	}
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
	Image,
	fresponsive(css`
		width: 400px;
		height: 200px;
	`),
)

const Author = styled("div", fresponsive(css``))
