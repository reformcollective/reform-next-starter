import { InsertAboveIcon } from "@sanity/icons"
import { universalLink } from "library/sanity/reusables"
import { defineArrayMember, defineField, defineType } from "sanity"

export default defineType({
	name: "footer",
	title: "Footer",
	type: "document",
	icon: InsertAboveIcon,
	fields: [
		defineField({
			title: "Text",
			name: "footerText",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			title: "Links",
			name: "links",
			type: "array",
			of: [defineArrayMember(universalLink({ name: "link", title: "Link" }))],
		}),
	],
	preview: {
		prepare() {
			return {
				title: "Footer",
			}
		},
	},
})
