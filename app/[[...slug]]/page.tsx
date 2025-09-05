import { EagerImages } from "library/StaticImage"
import type { DeepAssetMeta } from "library/sanity/assetMetadata"
import { Redirect } from "library/sanity/redirect"
import { resolveOpenGraphImage } from "library/sanity/utils"
import { siteURL } from "library/siteURL"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { defineQuery } from "next-sanity"
import { type ComponentType, Fragment } from "react"
import { sanityFetch } from "sanity/lib/live"
import SampleSection from "sections/Sample"
import type { Page } from "@/sanity.types"
import { DynamicPageOrder, type StickyConfig } from "./client"

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
	sample: SampleSection,
	redirect: Redirect,
}

/**
 * stickyConfigsBySection is a mapping of section _type to sticky config
 * only add a section here if you want it to be sticky
 * if a section is not listed, it will not be sticky by default
 * @example
 * sample: { fullWidth: "0", zIndex: 1 },
 * redirect: { fullWidth: "0", zIndex: 2 },
 */

const stickyConfigsBySection: Partial<Record<SectionTypes, StickyConfig>> = {
	// sample: { fullWidth: "0", zIndex: 1 },
	// redirect: { fullWidth: "0", zIndex: 2 },
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

	/**
	 * for each section, get the sticky config if it exists, otherwise default to null
	 */
	return (
		<>
			{relevantPage.noIndex ? (
				<meta name="robots" content="noindex, nofollow" />
			) : null}
			<DynamicPageOrder
				documentId={relevantPage._id}
				documentType={relevantPage._type}
				sections={relevantPage.sections.map(
					(section: { _type: SectionTypes; _key: string }, index: number) => {
						const Component = components[section._type]
						if (!Component) {
							console.warn(`unknown section type "${section._type}"`)
							return {
								key: section._key,
								content: null,
								stickyConfig: null,
							}
						}

						const Wrapper = index === 0 ? EagerImages : Fragment
						// get sticky config if present, otherwise null
						const stickyConfig = stickyConfigsBySection[section._type] ?? null

						const content = (
							<Wrapper key={section._key}>
								{/* @ts-ignore not possible to narrow the type here */}
								<Component {...section} />
							</Wrapper>
						)

						return {
							key: section._key,
							content,
							stickyConfig,
						}
					},
				)}
			/>
		</>
	)
}
