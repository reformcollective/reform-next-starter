import { EagerImages } from "library/StaticImage"
import type { DeepAssetMeta } from "library/sanity/assetMetadata"
import { Redirect } from "library/sanity/redirect"
import { siteURL } from "library/siteURL"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { defineQuery } from "next-sanity"
import { type ComponentType, Fragment } from "react"
import { sanityFetch } from "sanity/lib/live"
import { resolveProductionUrl } from "sanity/lib/slug-resolver"
import type { Page } from "sanity.types"
import SampleSection from "app/sections/Sample"
import { resolveOpenGraphImage } from "library/sanity/opengraph"

export type SectionTypes = NonNullable<DeepAssetMeta<Page>["sections"]>[number]["_type"]

export type GetSectionType<T extends SectionTypes> = DeepAssetMeta<
	NonNullable<DeepAssetMeta<Page>["sections"]>[number] & { _type: T }
> & {
	documentId: string
	documentType: string
	path: string
}

const components: {
	[sectionType in SectionTypes]: ComponentType<GetSectionType<sectionType>>
} = {
	sample: SampleSection,
	redirect: Redirect,
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
		disableStega: true,
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
	const slug = (await params).slug?.join("/") || "home"

	const { data: relevantPage } = await sanityFetch({
		query: pageQuery,
		params: { slug },
		disableStega: true,
	})

	const pageUrl = resolveProductionUrl(relevantPage)
	const { data: settings } = await sanityFetch({
		query: pageSettingsQuery,
		disableStega: true,
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
		openGraph: {
			type: "website",
			url: pageUrl,
			siteName: settings?.defaultTitle ?? undefined,
			images: imageData,
		},
		twitter: {
			card: "summary_large_image",
			images: imageData,
		},
		alternates: {
			canonical: pageUrl,
		},
		metadataBase: new URL(siteURL),
	}
}

export * from "library/segmentDefaults"

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

	/** Render sections in order */
	return (
		<>
			{relevantPage.noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
			{relevantPage.sections.map(
				(section: { _type: SectionTypes; _key: string }, index: number) => {
					const Component = components[section._type]
					if (!Component) {
						console.warn(`unknown section type "${section._type}"`)
						return null
					}

					const Wrapper = index === 0 ? EagerImages : Fragment

					return (
						<Wrapper key={section._key}>
							{/* @ts-ignore not possible to narrow the type here */}
							<Component {...section} />
						</Wrapper>
					)
				},
			)}
		</>
	)
}
