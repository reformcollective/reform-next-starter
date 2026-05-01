import SampleSection from "app/sections/Sample"
import { EagerImages } from "library/StaticImage"
import { imageField, linkField, videoField } from "library/sanity/assetMetadata"
import { createSanityDataAttribute } from "library/sanity/createSanityDataAttribute"
import { resolveDocumentTitle, resolveProductionUrl } from "library/sanity/document-helpers"
import { resolveOpenGraphImage } from "library/sanity/opengraph"
import { Redirect } from "library/sanity/redirect"
import { siteURL } from "library/siteURL"
import type { Metadata } from "next"
import { defineQuery } from "next-sanity"
import { notFound } from "next/navigation"
import { Fragment } from "react"
import type { MainPageQueryResult } from "sanity.types"
import { sanityFetch } from "sanity/lib/live"
import { documentPathProjection } from "sanity/lib/slug-resolver"

type PageSection = NonNullable<NonNullable<MainPageQueryResult>["sections"]>[number]
type SectionTypes = PageSection["_type"]

type WithExtraProps<T> = T & {
	pageTitle: string
	generateSanityDataAttribute: (property: keyof T) => string
}

export type GetSectionType<T extends SectionTypes> = WithExtraProps<
	Extract<PageSection, { _type: T }>
>

const mainPageQuery = defineQuery(`
	*[${documentPathProjection("@")} == $pathname][0] {
		...,
		description,
		ogImage,
		sections[] {
			...,
			_type == "sample" => {
				${videoField("sampleVideo")},
				${imageField("sampleImage")},
				${linkField("sampleLink")}
			}
		}
	}
`)

const mainPageSlugsQuery = defineQuery(`
  *[${documentPathProjection("@")} != null] {
    _id,
    "path": ${documentPathProjection("@")}
  }
`)

const mainPageSettingsQuery = defineQuery(`*[_type == "settings"][0]`)

export async function generateStaticParams() {
	const { data } = await sanityFetch({
		query: mainPageSlugsQuery,
		perspective: "published",
		disableStega: true,
	})
	return data.map((item) => ({
		slug: item.path === "/" ? undefined : item.path?.replace(/^\/+/, "").split("/"),
	}))
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">): Promise<Metadata> {
	const slug = (await params).slug
	const pathname = slug ? `/${slug.join("/")}` : "/"

	const [{ data: relevantPage }, { data: settings }] = await Promise.all([
		sanityFetch({
			query: mainPageQuery,
			params: { pathname },
			disableStega: true,
		}),
		sanityFetch({
			query: mainPageSettingsQuery,
			disableStega: true,
		}),
	])

	const canonicalUrl = resolveProductionUrl(relevantPage)
	const canonicalTitle = resolveDocumentTitle(relevantPage) || settings?.defaultTitle
	const canonicalDescription = relevantPage.description || settings?.defaultDescription

	const image = relevantPage?.ogImage
		? resolveOpenGraphImage(relevantPage.ogImage)
		: settings?.ogImage
			? resolveOpenGraphImage(settings?.ogImage)
			: undefined
	const imageList = image ? [image] : undefined

	return {
		metadataBase: siteURL,
		title: canonicalTitle,
		description: canonicalDescription,
		openGraph: {
			type: "website",
			url: canonicalUrl,
			siteName: settings?.defaultTitle ?? undefined,
			images: imageList,
		},
		twitter: {
			card: "summary_large_image",
			images: imageList,
		},
		alternates: {
			canonical: canonicalUrl,
		},
	}
}

export * from "library/segmentDefaults"

export default async function TemplatePage({ params }: PageProps<"/[[...slug]]">) {
	const slug = (await params).slug
	const pathname = slug ? `/${slug.join("/")}` : "/"
	const { data: relevantPage } = await sanityFetch({
		query: mainPageQuery,
		params: { pathname },
	})

	if (!relevantPage) notFound()
	if (!relevantPage.sections) notFound()

	const pageTitle = resolveDocumentTitle(relevantPage)
	const sections: PageSection[] = relevantPage.sections
	if (!pageTitle) notFound()

	return (
		<>
			{relevantPage.noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
			{sections.map((section, index: number) => {
				const Wrapper = index === 0 ? EagerImages : Fragment

				/**
				 * @param path path to the property on the object. for example, if you were rendering
				 * mySection.myObject.myImage you would pass "myObject.myImage"
				 * @returns the data attribute for the data-sanity prop
				 */
				const dataAttributeCreator = (path: string) =>
					createSanityDataAttribute({
						documentId: relevantPage._id,
						documentType: relevantPage._type,
						path: `sections[${index}].${path}`,
					})

				const sectionContext = {
					pageTitle,
					generateSanityDataAttribute: dataAttributeCreator,
				}

				switch (section._type) {
					case "sample":
						return (
							<Wrapper key={section._key}>
								<SampleSection {...section} {...sectionContext} />
							</Wrapper>
						)
					case "redirect":
						return (
							<Wrapper key={section._key}>
								<Redirect {...section} {...sectionContext} />
							</Wrapper>
						)
					default:
						// if you get an error here you are missing a section above
						section satisfies never
						return null
				}
			})}
		</>
	)
}
