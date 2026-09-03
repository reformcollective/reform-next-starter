import type { ReactNode } from "react"
import type { Page } from "sanity.types"

import { DesktopIcon } from "@sanity/icons"
import { redirect, universalImage } from "library/sanity/reusables"
import { siteURL } from "library/siteURL"
import { type ConditionalProperty, defineArrayMember, defineField, defineType } from "sanity"
import { apiVersion } from "sanity/lib/api"

import { ReadTimeInput } from "./blog/ReadTimeInput"
import * as sections from "./sections"

const allSections = Object.values(sections)
const groupNames = new Set(
	allSections
		.flatMap((section) => section.groups?.map((group) => group.name))
		.filter((group) => group !== undefined),
)

const groups = Array.from(groupNames).map((name) => ({
	name,
	of: allSections
		.filter((section) => section.groups?.some((group) => group.name === name))
		.map((section) => section.name)
		.filter((section) => section !== undefined),
}))

const Code = ({ children }: { children: ReactNode }) => (
	<code
		style={{
			border: "1px solid rgb(from currentcolor r g b / 20%)",
			borderRadius: "4px",
			padding: "0 4px",
		}}
	>
		{children}
	</code>
)

export const pageKinds = ["page", "hub", "hubDetail"] as const

export const pageMetadata = [
	defineField({
		type: "string",
		name: "kind",
		title: "Page Kind",
		description:
			"A Hub lists the pages nested under its slug — a blog, a partner directory, case studies. A Hub Detail Page is one of those nested pages. This drives which sections the page is designed for; sections from other kinds can still be added when you need them.",
		options: {
			list: [
				{ title: "Page", value: "page" },
				{ title: "Hub", value: "hub" },
				{ title: "Hub Detail Page", value: "hubDetail" },
			],
			layout: "radio",
		},
		initialValue: "page",
		validation: (Rule) => Rule.required(),
	}),
	defineField({
		type: "string",
		name: "title",
		title: "Page Title",
		validation: (Rule) => Rule.required(),
	}),
	defineField({
		type: "slug",
		name: "slug",
		title: "Page Slug",
		description: (
			<>
				<p>
					This will be used to generate the URL for this page. For example, <Code>about</Code> will
					create a page at <Code>{siteURL}/about</Code>
				</p>
				<br />
				<p>
					<Code>home</Code> is a special slug that will create a page at <Code>{siteURL}</Code>
				</p>
				<br />
				<p>
					You can also use a nested slug. For example, <Code>about/us</Code> will create a page at{" "}
					<Code>{siteURL}/about/us</Code>
				</p>
				<br />
			</>
		),
		options: {
			source: "title",
		},
		validation: (rule) =>
			rule.custom(async (slug, context) => {
				if (slug?.current?.startsWith("/"))
					return {
						message: "Page slug must not start with a slash",
					}
				if (slug?.current?.endsWith("/"))
					return {
						message: "Page slug must not end with a slash",
					}
				if (slug?.current?.includes(" "))
					return {
						message: "Page slug must not contain spaces",
					}
				if (!slug?.current)
					return {
						message: "Page slug must not be empty",
					}

				// A document exists under several ids at once — published, `drafts.`, and a
				// `versions.<release>.` id per content release — so compare base ids, or a
				// page counts its own draft or release version as a duplicate of itself.
				const baseId = context.document?._id.replace(/^(drafts|versions\.[^.]+)\./, "")
				const duplicates = await context
					.getClient({ apiVersion })
					.fetch<number>(
						`count(*[_type == "page" && slug.current == $slug && coalesce(_system.base.id, _id) != $baseId])`,
						{ slug: slug.current, baseId },
					)
				if (duplicates > 0)
					return {
						message: `Another page already uses the slug "${slug.current}". Two pages cannot share a URL.`,
					}

				return true
			}),
	}),
	defineField({
		name: "metaTitle",
		title: "Meta Title",
		type: "string",
		description: "Optional. Overrides the page title used in browser tabs and search results.",
	}),
	defineField({
		name: "description",
		title: "Page Description",
		type: "string",
		description:
			"Leave blank to reuse the default, defined in Settings. This will be used when shared on socials, and by some search engines.",
	}),
	universalImage({
		name: "ogImage",
		title: "Open Graph Image",
		description:
			"Leave blank to reuse the default, defined in Settings. Displayed on social cards and search engine results.",
		withAlt: false,
	}),
	defineField({
		name: "noIndex",
		type: "boolean",
		title: "Hide from Search Engines",
		description: (
			<>
				Enable this to hide the page from search engines like Google. Note that once a page has been
				detected by a search engine, disabling this will not immediately remove the page from search
				engines.
			</>
		),
	}),
]

const isNotHubDetail: ConditionalProperty = ({ document }) => document?.kind !== "hubDetail"

type PageKind = NonNullable<Page["kind"]>
type SectionType = NonNullable<Page["sections"]>[number]["_type"]

const isPageKind = (value: unknown): value is PageKind => pageKinds.includes(value as PageKind)

const kindTitles: Record<PageKind, string> = {
	page: "Page",
	hub: "Hub",
	hubDetail: "Hub Detail Page",
}

const kindSectionTypes: Partial<Record<PageKind, SectionType[]>> = {
	hub: ["blogHub"],
	hubDetail: ["blogArticle"],
}

const articleFields = [
	defineField({
		name: "author",
		title: "Author",
		type: "reference",
		to: [{ type: "blogAuthor" }],
		hidden: isNotHubDetail,
	}),
	universalImage({
		name: "mainImage",
		title: "Main Image",
		description: "Shown at the top of the article and on cards in the blog hub.",
		hidden: isNotHubDetail,
	}),
	defineField({
		name: "categories",
		title: "Categories",
		type: "array",
		of: [defineArrayMember({ type: "reference", to: { type: "blogCategory" } })],
		validation: (Rule) => Rule.max(2),
		hidden: isNotHubDetail,
	}),
	defineField({
		name: "publishedAt",
		title: "Published At",
		type: "datetime",
		hidden: isNotHubDetail,
	}),
	defineField({
		name: "articleTextPreview",
		title: "Article Text Preview",
		type: "text",
		description:
			"A short description of the article. Used on the blog hub page and at the top of the article. Supports line breaks.",
		hidden: isNotHubDetail,
	}),
	defineField({
		name: "readTime",
		title: "Read Time",
		type: "string",
		readOnly: true,
		components: { input: ReadTimeInput },
		hidden: isNotHubDetail,
	}),
]

export default defineType({
	icon: DesktopIcon,
	name: "page",
	title: "Page",
	type: "document",
	fields: [
		...pageMetadata,
		...articleFields,
		defineField({
			type: "array",
			name: "sections",
			of: [...allSections, redirect],
			options: {
				insertMenu: {
					groups: groups,
					views: [{ name: "list" }, { name: "grid" }],
				},
			},
			validation: (Rule) =>
				Rule.warning().custom((value: Page["sections"], context) => {
					const kind = context.document?.kind
					if (!isPageKind(kind)) return true

					const expected = kindSectionTypes[kind]
					if (!expected) return true

					const present = value?.map((section) => section._type) ?? []

					if (!present.some((type) => expected.includes(type)))
						return `A ${kindTitles[kind]} usually contains a ${expected.join(" or ")} section.`

					const foreign = Object.entries(kindSectionTypes).flatMap(([otherKind, types]) =>
						otherKind === kind ? [] : (types?.filter((type) => present.includes(type)) ?? []),
					)
					if (foreign.length > 0)
						return `This page also contains ${foreign.join(", ")}, which ${kindTitles[kind]} pages are not designed for.`

					return true
				}),
		}),
	],
})
