import { DisplayDate } from "library/DisplayDate"
import { css, fresponsive, styled } from "library/styled"
import type { Author, Post } from "@/sanity.types"
import UniversalImage from "library/UniversalImage"
import UniversalLink from "library/Loader/UniversalLink"

export function SmallCard({
	post,
}: {
	post:
		| (Omit<Post, "author"> & {
				author: Author | null | undefined
		  })
		| null
		| undefined
}) {
	if (!post) return null
	const { author, slug, publishDate, mainImage, title, metadataDescription } =
		post

	const publishedAt = publishDate ? publishDate : undefined

	return (
		<Wrapper href={`/blog/${slug?.current}`}>
			<h2>{author?.fullName}</h2>
			{publishedAt && <DisplayDate date={publishedAt} />}
			<CardImage
				width={400}
				height={230}
				src={mainImage}
				alt={mainImage?.alt}
			/>
			<h1>{title}</h1>
			<p>{metadataDescription}</p>
		</Wrapper>
	)
}

const Wrapper = styled(
	UniversalLink,
	fresponsive(css`
		display: grid;
	`),
)

const CardImage = styled(
	UniversalImage,
	fresponsive(css`
		width: 400px;
	`),
)
