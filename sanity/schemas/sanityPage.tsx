import { defineField, defineType } from "sanity"
import { DesktopIcon } from "@sanity/icons"

import * as sections from "./sections"
import { universalImage } from "library/sanity/reusables"

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

export default defineType({
	icon: DesktopIcon,
	name: "page",
	title: "Page",
	type: "document",
	fields: [
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
			options: {
				source: "title",
			},
		}),
		defineField({
			name: "description",
			title: "Default Page Description",
			type: "string",
			description:
				"Leave blank to reuse the default, defined in Settings. This will be used when shared on socials, and by some search engines.",
		}),
		universalImage({
			name: "ogImage",
			title: "Default Open Graph Image",
			description:
				"Leave blank to reuse the default, defined in Settings. Displayed on social cards and search engine results.",
			cropType: "sanity",
			withAlt: false,
		}),
		defineField({
			name: "noIndex",
			type: "boolean",
			title: "Hide from Search Engines",
			description: (
				<>
					Enable this to hide the page from search engines like Google. Note
					that once a page has been detected by a search engine, disabling this
					will not immediately remove the page from search engines.
				</>
			),
		}),
		defineField({
			type: "array",
			name: "sections",
			of: allSections,
			options: {
				insertMenu: {
					groups: groups,
					views: [{ name: "list" }, { name: "grid" }],
				},
			},
		}),
	],
})
