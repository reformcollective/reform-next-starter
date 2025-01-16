import { universalImage } from "library/sanity/reusables"
import { defineField, defineType } from "sanity"

export default defineType({
	type: "document",
	name: "author",
	title: "Author",
	fields: [
		defineField({
			name: "fullName",
			type: "string",
			title: "Full Name",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "slug",
			type: "slug",
			title: "Slug",
			validation: (Rule) => Rule.required(),
			options: { source: "fullName" },
		}),
		universalImage({
			name: "photo",
			title: "Photo",
			cropType: "sanity",
		}),
		defineField({
			name: "roleAndCompany",
			type: "string",
			title: "Role and Company",
			description: "For example, 'CEO of MyCompany'",
		}),
		defineField({
			name: "biography",
			type: "text",
			title: "Biography",
		}),
	],
})
