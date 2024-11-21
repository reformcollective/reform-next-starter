import { defineField, defineType } from "sanity";

export default defineType({
	type: "document",
	name: "ctaSchema",
	title: "Component: Call to Action",
	description: "",
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			hidden: false,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "paragraphText",
			type: "text",
			title: "Paragraph Text",
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
	preview: { select: { title: "title" } },
	readOnly: ({ document }) =>
		(document == null ? void 0 : document.contentfulArchived) === !0,
});
