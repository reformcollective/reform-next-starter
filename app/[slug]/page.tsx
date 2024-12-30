import type { PageQueryResult } from "@/sanity.types"
import type { DeepImageMeta } from "library/sanity/imageMetadata"
import { resolveOpenGraphImage } from "library/sanity/utils"
import { EagerImages } from "library/UniversalImage"
import type { Metadata, ResolvingMetadata } from "next"
import { defineQuery } from "next-sanity"
import { notFound } from "next/navigation"
import { Fragment, type ReactNode } from "react"
import { sanityFetch } from "sanity/lib/live"
import SampleSection from "sections/Sample"

export type SectionTypes = NonNullable<
	NonNullable<PageQueryResult>["sections"]
>[number]["_type"]
export type GetSectionType<T extends SectionTypes> = DeepImageMeta<
	NonNullable<NonNullable<PageQueryResult>["sections"]>[number] & { _type: T }
>

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
		openGraph: {
			images: opengraph,
		},
		twitter: {
			images: twitter,
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

	return (
		<>
			{relevantPage.sections?.map((section, index) => {
				const Component = components[section._type]
				if (!Component) return "Component not found"
				const Wrapper = index === 0 ? EagerImages : Fragment

				return (
					<Wrapper key={section._key}>
						{/* @ts-expect-error not possible to narrow the type here */}
						<Component {...section} />
					</Wrapper>
				)
			})}
		</>
	)
}
