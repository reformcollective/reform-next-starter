import { createSectionPreview } from "library/sanity/reusables"
import { defineArrayMember, defineField } from "sanity"

export const sample = defineArrayMember({
	type: "object",
	name: "sample",
	title: "Sample Section",
	icon: createSectionPreview("https://picsum.photos/160/90"),
	fields: [
		defineField({
			type: "string",
			name: "title",
			title: "Section Title",
		}),
		defineField({
			type: "string",
			name: "text",
			title: "Section Text",
		}),
	],
})
