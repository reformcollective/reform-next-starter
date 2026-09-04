import { ImagesIcon } from "@sanity/icons"
import { universalImage } from "library/sanity/reusables"
import { defineField, defineType } from "sanity"

/**
 * A named group of images referenced by whichever sections need it, rather than each
 * section holding its own copy. Reference it from a section with:
 *
 *   defineField({ name: "logoSet", type: "reference", to: [{ type: "logoSet" }] })
 *
 * and dereference it in that section's projection: `logoSet->{ logos[] { ... } }`
 */
export const logoSet = defineType({
	name: "logoSet",
	type: "document",
	title: "Logo Set",
	icon: ImagesIcon,
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			description: "Internal name for this logo set (e.g. 'Partner Logos')",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "logos",
			type: "array",
			of: [
				universalImage({
					name: "logo",
					title: "Company Logo",
				}),
			],
			title: "Logos",
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: "title",
		},
	},
})
