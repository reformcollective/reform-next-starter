import { defineField, defineType } from "sanity"

export default defineType({
	type: "object",
	name: "link",
	title: "Link",
	fields: [
		defineField({
			name: "linkText",
			type: "string",
			title: "Link Text",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "url",
			type: "string",
			title: "URL",
			initialValue: "/",
			validation: (Rule) => Rule.required(),
		}),
	],
})
