import { css, fresponsive, styled } from "library/styled"
import type { Post, Author as AuthorType } from "@/sanity.types"
import UniversalLink from "library/Loader/UniversalLink"
import UniversalImage from "library/UniversalImage"

export function LargeCard({
	post,
}: {
	post:
		| (Omit<Post, "author"> & {
				author: AuthorType | null | undefined
		  })
		| null
		| undefined
}) {
	if (!post) return null
	const { slug, author, publishDate, mainImage, title, metadataDescription } =
		post

	return (
		<Wrapper href={`/blog/${slug?.current}`}>
			<Author>{author?.fullName}</Author>
			{publishDate && <DisplayDate>{publishDate}</DisplayDate>}
			<CardImage src={mainImage} alt={title ?? ""} />
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

const DisplayDate = styled(
	"div",
	fresponsive(css`
		position: relative;
	`),
)

const CardImage = styled(
	UniversalImage,
	fresponsive(css`
		width: 60px;
		height: 100%;
	`),
)

const Author = styled(
	"div",
	fresponsive(css`
		position: relative;
	`),
)
