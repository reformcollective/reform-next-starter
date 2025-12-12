import { InsertAboveIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

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
	],
	preview: {
		prepare() {
			return {
				title: "Footer",
			}
		},
	},
})
