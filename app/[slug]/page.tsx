import type { PageQueryResult } from "@/sanity.types"
import { EagerImages } from "library/StaticImage"
import type { DeepAssetMeta } from "library/sanity/assetMetadata"
import { resolveOpenGraphImage } from "library/sanity/utils"
import type { Metadata, ResolvingMetadata } from "next"
import { defineQuery } from "next-sanity"
import { notFound } from "next/navigation"
import { Fragment, type ReactNode } from "react"
import { sanityFetch } from "sanity/lib/live"
import SampleSection from "sections/Sample"
import { DynamicPageOrder } from "./client"

export type SectionTypes = NonNullable<
	NonNullable<PageQueryResult>["sections"]
>[number]["_type"]
export type GetSectionType<T extends SectionTypes> = DeepAssetMeta<
	NonNullable<NonNullable<PageQueryResult>["sections"]>[number] & { _type: T }
> & {
	// extra properties for creating data sanity attributes
	documentId: string
	documentType: string
	path: string
}

type AsyncFC<P = Record<string, unknown>> = (
	props: P,
) => ReactNode | Promise<ReactNode>

/**
 * When adding new sections:
 * - add them to the page schema by exporting the section's schema from `schemas/documents/sections/index.ts`
 * - section schemas muse not be default exports. They must be named exports
 * - then update this object to include the new section's component
 */
const components: {
	[sectionType in SectionTypes]: AsyncFC<GetSectionType<sectionType>>
} = {
	sample: SampleSection,
}

const pageQuery = defineQuery(`
	*[_type == "page" && slug.current == $slug][0]
`)

const pageSlugs = defineQuery(`
	*[_type == "page" && defined(slug.current)]
	{"slug": slug.current}
`)

// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 60

export async function generateStaticParams() {
	const { data } = await sanityFetch({
		query: pageSlugs,
		perspective: "published",
		stega: false,
	})
	return data
}

export async function generateMetadata(
	{ params }: { params: Promise<{ slug: string }> },
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { data: relevantPage } = await sanityFetch({
		query: pageQuery,
		params: {
			slug: (await params).slug,
		},
	})

	const title = relevantPage?.title
	const description = relevantPage?.description
	const imageData =
		relevantPage?.ogImage && resolveOpenGraphImage(relevantPage?.ogImage)
	const newImage = imageData ? [imageData] : undefined

	const opengraph = newImage ?? (await parent).openGraph?.images
	const twitter = newImage ?? (await parent).twitter?.images

	return {
		title,
		description,
		twitter: {
			card: "summary_large_image",
			images: twitter,
		},
		openGraph: {
			images: opengraph,
		},
	}
}

export default async function TemplatePage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { data: relevantPage } = await sanityFetch({
		query: pageQuery,
		params: {
			slug: (await params).slug,
		},
	})

	if (!relevantPage) notFound()
	if (!relevantPage.sections) notFound()

	return (
		<>
			{relevantPage.noIndex ? (
				<meta name="robots" content="noindex, nofollow" />
			) : null}
			<DynamicPageOrder
				documentId={relevantPage._id}
				documentType={relevantPage._type}
				sections={relevantPage.sections.map((section, index) => {
					const Component = components[section._type]
					if (!Component) {
						console.warn(`Unknown section type "${section._type}"`)
						return {
							key: Math.random().toString(),
							content: null,
						}
					}
					const Wrapper = index === 0 ? EagerImages : Fragment

					return {
						key: section._key,
						content: (
							<Wrapper>
								{/* @ts-ignore not possible to narrow the type here */}
								<Component {...section} />
							</Wrapper>
						),
					}
				})}
			/>
		</>
	)
}
