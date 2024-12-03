import Image from "next/image"
import { css, fresponsive, styled } from "library/styled"
import {
	internalGroqTypeReferenceTo,
	type SanityImageCrop,
	type SanityImageHotspot,
	type Slug,
} from "@/sanity.types"
import UniversalLink from "library/Loader/UniversalLink"
import { urlForImage } from "@/sanity/lib/utils"

type Nullish = null | undefined

export function LargeCard({
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
			<Author>{author?.fullName}</Author>
			{published && <DisplayDate>{published}</DisplayDate>}
			{imageURL && <CardImage src={imageURL} alt={title ?? ""} />}
			<h1>{title}</h1>
			<p>{preview}</p>
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
	Image,
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
