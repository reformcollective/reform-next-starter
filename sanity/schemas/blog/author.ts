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
			title: "Author Slug",
			description: "Used in the URL to refer to this author",
			validation: (Rule) => Rule.required(),
			options: { source: "fullName" },
		}),
		universalImage({
			name: "photo",
			title: "Author Photo",
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
			title: "Biography",
			type: "array",
			of: [{ type: "block" }],
		}),
	],
})
