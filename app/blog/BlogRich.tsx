"use client"

import { YoutubeEmbed } from "components/YoutubeEmbed"
import type { DeepAssetMeta } from "library/sanity/assetMetadata"
import { TypedPortableText } from "library/sanity/PortableText"
import UniversalImage from "library/UniversalImage"
import type { Post } from "@/sanity.types"

export default function BlogRich({
	className,
	value,
}: {
	className?: string
	value: DeepAssetMeta<Post["content"]>
}) {
	if (!value) return null
	return (
		<div className={className}>
			<TypedPortableText
				value={value}
				components={{
					types: {
						image: ({ value }) => {
							return <UniversalImage src={value} />
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
