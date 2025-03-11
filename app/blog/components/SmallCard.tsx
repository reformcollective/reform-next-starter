import { DisplayDate } from "library/DisplayDate"
import { css, fresponsive, styled } from "library/styled"
import type { Author, Post } from "@/sanity.types"
import UniversalImage from "library/UniversalImage"
import UniversalLink from "library/link"

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
	const {
		author,
		slug,
		publishOverride,
		mainImage,
		title,
		preview,
		_createdAt,
	} = post

	const published = publishOverride ?? _createdAt

	if (!slug?.current) return null
	return (
		<Wrapper
			href={{ pathname: "/blog/post/[slug]", query: { slug: slug.current } }}
		>
			<h2>{author?.fullName}</h2>
			{published && <DisplayDate date={published} />}
			<UniversalImage
				width={400}
				height={230}
				src={mainImage}
				alt={mainImage?.alt}
			/>
			<h1>{title}</h1>
			<p>{preview}</p>
		</Wrapper>
	)
}

const Wrapper = styled(
	UniversalLink,
	fresponsive(css`
		display: block;
		border: 1px solid dodgerblue;
		padding: 10px;
		width: 400px;
	`),
)
