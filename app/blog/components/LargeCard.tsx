import type { Author as AuthorType, Post } from "@/sanity.types"
import { DisplayDate } from "library/DisplayDate"
import UniversalLink from "library/Loader/UniversalLink"
import { css, fmobile, fresponsive, styled } from "library/styled"
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
	const {
		slug,
		author,
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
			href={{
				pathname: "/blog/post/[slug]",
				query: { slug: slug.current },
			}}
		>
			<div>{author?.fullName}</div>
			{published && <DisplayDate date={published} />}
			<UniversalImage width={400} height={230} src={mainImage} alt={title} />
			<h1>{title}</h1>
			<p>{preview}</p>
		</Wrapper>
	)
}

const Wrapper = styled(UniversalLink, {
	...fresponsive(css`
		display: block;
		border: 1px solid green;
		padding: 10px;
	`),
	...fmobile(css`
		width: 100%;
	`),
})
