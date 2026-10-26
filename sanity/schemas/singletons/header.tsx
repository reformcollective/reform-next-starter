import { InsertAboveIcon } from "@sanity/icons/InsertAbove"
import { defineField, defineType } from "sanity"

export default defineType({
	name: "header",
	title: "Header",
	type: "document",
	icon: InsertAboveIcon,
	fields: [
		defineField({
			title: "Text",
			name: "headerText",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		prepare() {
			return {
				title: "Header",
			}
		},
	},
})
