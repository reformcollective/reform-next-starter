import createImageUrlBuilder from "@sanity/image-url"

import { dataset, projectId } from "@/sanity/lib/api"
import type {
	internalGroqTypeReferenceTo,
	SanityImageCrop,
	SanityImageHotspot,
} from "@/sanity.types"

export type MainImage = NonNullable<Parameters<typeof urlForImage>[0]>

type URLForImageType =
	| string
	| {
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
	  }
	| null

const imageBuilder = createImageUrlBuilder({
	projectId: projectId || "",
	dataset: dataset || "",
})

export const urlForImage = (source: URLForImageType) => {
	// Ensure that source image contains a valid reference
	if (typeof source !== "string" && !source?.asset?._ref) {
		return undefined
	}

	return imageBuilder?.image(source).auto("format").fit("max")
}

export function resolveOpenGraphImage(
	image: MainImage,
	width = 1200,
	height = 627,
) {
	if (!image) return
	const url = urlForImage(image)?.width(1200).height(627).fit("crop").url()
	if (!url) return
	return { url, alt: "og image", width, height }
}

export function resolveHref(
	documentType?: string,
	slug?: string,
): string | undefined {
	switch (documentType) {
		case "post":
			return slug ? `/posts/${slug}` : undefined
		default:
			console.warn("Invalid document type:", documentType)
			return undefined
	}
}
