import { defineField, defineType } from "sanity"
import { DesktopIcon } from "@sanity/icons"

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
		defineField({
			name: "ogImage",
			title: "Default Open Graph Image",
			type: "image",
			description:
				"Leave blank to reuse the default, defined in Settings. Displayed on social cards and search engine results.",
			options: {
				hotspot: true,
				aiAssist: {
					imageDescriptionField: "alt",
				},
			},
			fields: [
				defineField({
					name: "alt",
					description: "Important for accessibility and SEO.",
					title: "Alternative text",
					type: "string",
					validation: (rule) => {
						return rule.custom((alt, context) => {
							if (
								(context.document?.ogImage as { asset?: { _ref?: string } })
									?.asset?._ref &&
								!alt
							) {
								return "Required"
							}
							return true
						})
					},
				}),
			],
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
