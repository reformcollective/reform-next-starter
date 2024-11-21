import { defineField, defineType } from "sanity";

export default defineType({
	type: "document",
	name: "author",
	title: "Unified Component - Author",
	description: "",
	fields: [
		defineField({
			name: "fullName",
			type: "string",
			title: "Full Name",
			hidden: false,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "slug",
			type: "slug",
			title: "Slug",
			hidden: false,
			validation: (Rule) => Rule.required(),
			options: { source: "fullName" },
		}),
		defineField({
			name: "photo",
			type: "image",
			title: "Photo",
			hidden: false,
		}),
		defineField({
			name: "roleAndCompany",
			type: "string",
			title: "Role and Company",
			hidden: false,
			description: "For example, CEO of MyCompany",
		}),
		defineField({
			name: "biography",
			type: "text",
			title: "Biography",
			hidden: false,
		}),

		defineField({
			type: "boolean",
			description:
				"If this document was archived on Contentful at the time of export, the document will be in a read-only state.",
			name: "contentfulArchived",
			readOnly: true,
		}),
	],
	preview: { select: { title: "fullName" } },
	readOnly: ({ document }) =>
		(document == null ? void 0 : document.contentfulArchived) === !0,
});
