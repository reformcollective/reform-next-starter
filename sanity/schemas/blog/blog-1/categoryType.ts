import { TagIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

export const blog1CategoryType = defineType({
	name: "blog1Category",
	title: "Blog 1 Category",
	type: "document",
	icon: TagIcon,
	fields: [
		defineField({
			name: "title",
			type: "string",
		}),
		defineField({
			name: "slug",
			type: "slug",
			options: {
				source: "title",
			},
		}),
		defineField({
			name: "description",
			type: "text",
		}),
	],
})
