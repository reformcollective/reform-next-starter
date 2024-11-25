import { DisplayDate } from "library/DisplayDate"
import styled from "styled-components"
import { Author, type AuthorInfo } from "./Author"
import {
	internalGroqTypeReferenceTo,
	type SanityImageCrop,
	type SanityImageHotspot,
} from "@/sanity.types"
import Image from "next/image"
import Link from "next/link"

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
	author: AuthorInfo
}) {
	return (
		<Wrapper href={`/blog/${slug}`}>
			<Author author={author} />
			{published && <DisplayDate date={published} />}
			{image && <Image src={image?.asset?._ref ?? ""} alt={title ?? ""} />}
			<h1>{title}</h1>
			<p>{preview}</p>
		</Wrapper>
	)
}

const Wrapper = styled(Link)`
	border: 1px solid orange;
	display: grid;
`
