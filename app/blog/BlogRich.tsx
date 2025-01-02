"use client"

import type { Post } from "@/sanity.types"
import { YoutubeEmbed } from "components/YoutubeEmbed"
import type { DeepImageMeta } from "library/sanity/imageMetadata"
import { TypedPortableText } from "library/sanity/PortableText"
import { css, fresponsive, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"

export default function BlogRich({
	className,
	value,
}: {
	className?: string
	value: DeepImageMeta<Post["articleText"]>
}) {
	if (!value) return null
	return (
		<div className={className}>
			<TypedPortableText
				value={value}
				components={{
					types: {
						image: ({ value }) => {
							return (
								<ArticleImage
									src={value}
									alt={value.alt}
									width={1242}
									height={746}
								/>
							)
						},
						youtube: ({ value }) => {
							return <YoutubeEmbed video={value} />
						},
					},
				}}
			/>
		</div>
	)
}

const ArticleImage = styled(
	UniversalImage,
	fresponsive(css`
		object-fit: cover;
		width: 100%;
		height: auto;
	`),
)
