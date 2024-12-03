import { DisplayDate } from "library/DisplayDate"
import { css, fresponsive, styled } from "library/styled"
import {
	internalGroqTypeReferenceTo,
	type SanityImageCrop,
	type SanityImageHotspot,
	type Slug,
} from "@/sanity.types"
import { Image } from "next-sanity/image"
import Link from "next/link"
import { urlForImage } from "@/sanity/lib/utils"

type Nullish = null | undefined

export function SmallCard({
	published,
	slug,
	title,
	image,
	preview,
	author,
}: {
	slug: string | Nullish
	title: string | Nullish
	preview: string | Nullish
	published: string | number | Nullish
	image: {
		asset?:
			| {
					_ref: string
					_type: "reference"
					_weak?: boolean | undefined
					[internalGroqTypeReferenceTo]?: "sanity.imageAsset" | undefined
			  }
			| undefined
		hotspot?: SanityImageHotspot | undefined
		crop?: SanityImageCrop | undefined
		_type: "image"
	} | null
	author: {
		fullName: string | null
		slug: Slug | null
	} | null
}) {
	const imageURL = urlForImage(image)?.url()

	return (
		<Wrapper href={`/blog/${slug}`}>
			<h2>{author?.fullName}</h2>
			{published && <DisplayDate date={published} />}
			{imageURL && (
				<CardImage width={400} height={230} src={imageURL} alt={title ?? ""} />
			)}
			<h1>{title}</h1>
			<p>{preview}</p>
		</Wrapper>
	)
}

const Wrapper = styled(
	Link,
	fresponsive(css`
		display: grid;
	`),
)

const CardImage = styled(
	Image,
	fresponsive(css`
		width: 400px;
		height: 230px;
	`),
)
