import type { Page } from "@/sanity.types"
import { EagerImages } from "library/StaticImage"
import type { DeepAssetMeta } from "library/sanity/assetMetadata"
import { resolveOpenGraphImage } from "library/sanity/utils"
import { siteURL } from "library/siteURL"
import type { Metadata } from "next"
import { defineQuery } from "next-sanity"
import { notFound } from "next/navigation"
import { type ComponentType, Fragment } from "react"
import { sanityFetch } from "sanity/lib/live"
import SectionSample from "sections/Sample"
import { DynamicPageOrder } from "./client"

export type SectionTypes = NonNullable<
	DeepAssetMeta<Page>["sections"]
>[number]["_type"]
export type GetSectionType<T extends SectionTypes> = DeepAssetMeta<
	NonNullable<DeepAssetMeta<Page>["sections"]>[number] & { _type: T }
> & {
	documentId: string
	documentType: string
	path: string
}

export const dynamic = "force-static"

const components: {
	[sectionType in SectionTypes]: ComponentType<GetSectionType<sectionType>>
} = {
	sample: SectionSample,
}

const pageQuery = defineQuery(`
	*[_type == "page" && slug.current == $slug][0]
`)

const pageSlugs = defineQuery(`
	*[_type == "page" && defined(slug.current)]
	{"slug": slug.current}
`)

const pageSettingsQuery = defineQuery(`*[_type == "settings"][0]`)

export async function generateStaticParams() {
	const { data } = await sanityFetch({
		query: pageSlugs,
		perspective: "published",
		stega: false,
	})
	return data.map((page: { slug: string | null }) => ({
		slug: page.slug === "home" ? undefined : page.slug?.split("/"),
	}))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string[] | undefined }>
}): Promise<Metadata> {
	const { data: relevantPage } = await sanityFetch({
		query: pageQuery,
		params: {
			slug: (await params).slug?.join("/") || "home",
		},
	})
	const { data: settings } = await sanityFetch({
		query: pageSettingsQuery,
	})

	const title = relevantPage?.title ?? settings?.defaultTitle
	const description = relevantPage?.description ?? settings?.defaultDescription
	const image = relevantPage?.ogImage
		? resolveOpenGraphImage(relevantPage?.ogImage)
		: settings?.ogImage
			? resolveOpenGraphImage(settings?.ogImage)
			: undefined
	const imageData = image ? [image] : undefined

	return {
		title,
		description,
		twitter: {
			card: "summary_large_image",
			images: imageData,
		},
		openGraph: {
			images: imageData,
		},
		metadataBase: new URL(siteURL),
	}
}

export default async function TemplatePage({
	params,
}: {
	params: Promise<{ slug: string[] | undefined }>
}) {
	const { data: relevantPage } = await sanityFetch({
		query: pageQuery,
		params: {
			slug: (await params).slug?.join("/") || "home",
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
