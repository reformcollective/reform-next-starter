import type { Metadata } from "next"
import type { MainPageQueryResult } from "sanity.types"

import InitialHeaderMode from "app/lib/InitialHeaderMode"
import { resolveMetaTitle } from "app/lib/metadata"
import FaqSection from "app/sections/Faq"
import SampleSection from "app/sections/Sample"
import { PageCommitSignal } from "library/link/usePageTransition"
import { assetMetadataFunctions } from "library/sanity/assetMetadata"
import { resolveDocumentTitle, resolveProductionUrl } from "library/sanity/document-helpers"
import {
	getSanityDataAttribute,
	type SanityDataAttributeContext,
} from "library/sanity/getSanityDataAttribute"
import { resolveOpenGraphImage } from "library/sanity/opengraph"
import { Redirect } from "library/sanity/redirect"
import { siteURL } from "library/siteURL"
import { EagerImages } from "library/StaticImage"
import { defineQuery } from "next-sanity"
import { notFound } from "next/navigation"
import { Fragment } from "react"
import { sanityFetch } from "sanity/lib/live"
import { documentPathProjection } from "sanity/lib/slug-resolver"

type PageSection = NonNullable<NonNullable<MainPageQueryResult>["sections"]>[number]
type SectionTypes = PageSection["_type"]

type WithExtraProps<T> = T & {
	pageTitle: string
	sanityDataAttribute: SanityDataAttributeContext
}

export type GetSectionType<T extends SectionTypes> = WithExtraProps<
	Extract<PageSection, { _type: T }>
>

const mainPageQuery = defineQuery(`
	${assetMetadataFunctions}

	*[${documentPathProjection("@")} == $pathname][0] {
		...,
		metaTitle,
		description,
		ogImage,
		sections[] {
			...,
			_type == "sample" => {
				"sampleVideo": reform::video(sampleVideo),
				"sampleImage": reform::image(sampleImage),
				"sampleLink": reform::link(sampleLink)
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

// The root of this optional catch-all can arrive as several different shapes:
// undefined normally, ["index"] during ISR regeneration (Next's on-disk name for the
// root — normalizePagePath turns "/" into "/index", so they are the same cache entry),
// and degenerate empties like [] or [""]. All of them mean the root. Joining without
// normalizing turns "index" into the pathname "/index", which matches no document and
// would cache a 404 on the homepage.
function resolvePathname(slug: string[] | undefined) {
	const joined = slug?.filter(Boolean).join("/")
	if (!joined || joined === "index") return "/"
	return `/${joined}`
}

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
	const pathname = resolvePathname((await params).slug)

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
	const canonicalTitle = resolveMetaTitle({
		title: relevantPage?.metaTitle || resolveDocumentTitle(relevantPage),
		separator: settings?.metaTitleSeparator,
		suffix: settings?.defaultTitle,
	})
	const canonicalDescription = relevantPage?.description || settings?.defaultDescription

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

export default async function TemplatePage({ params }: PageProps<"/[[...slug]]">) {
	const pathname = resolvePathname((await params).slug)
	const { data: relevantPage } = await sanityFetch({
		query: mainPageQuery,
		params: { pathname },
	})

	if (!relevantPage) notFound()
	if (!relevantPage.sections) notFound()

	const pageTitle = resolveDocumentTitle(relevantPage)
	const sections: PageSection[] = relevantPage.sections
	if (!pageTitle) notFound()

	// seed the header's theme from the first section, so it is correct on the frame after
	// navigation instead of flashing the default until the observer catches up
	const firstSection = sections[0]
	const initialHeaderMode =
		firstSection && "headerMode" in firstSection ? firstSection.headerMode : undefined

	const pageDataAttribute = getSanityDataAttribute(
		{
			documentId: relevantPage._id,
			documentType: "page",
			pathPrefix: "",
		},
		"sections",
	)

	return (
		<>
			<PageCommitSignal />
			<InitialHeaderMode headerMode={initialHeaderMode} />
			{relevantPage.noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
			{/* Register this page document with Presentation Tool's "Documents on this page" panel.
			    Without this, pages whose sections have no text (e.g. image-only) are invisible to the panel. */}
			<div hidden data-sanity={pageDataAttribute} />
			{sections.map((section, index: number) => {
				const Wrapper = index === 0 ? EagerImages : Fragment

				const sectionContext = {
					pageTitle,
					sanityDataAttribute: {
						documentId: relevantPage._id,
						documentType: relevantPage._type,
						pathPrefix: `sections[${index}]`,
					},
				}

				switch (section._type) {
					case "sample":
						return (
							<Wrapper key={section._key}>
								<SampleSection {...section} {...sectionContext} />
							</Wrapper>
						)
					case "faq":
						return (
							<Wrapper key={section._key}>
								<FaqSection {...section} {...sectionContext} />
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
