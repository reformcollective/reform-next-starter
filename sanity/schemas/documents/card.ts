import { defineField, defineType, type SchemaTypeDefinition } from "sanity";

export default defineType({
	type: "document",
	name: "card",
	title: "Component - Quote Card",
	description: "",
	fields: [
		defineField({
			name: "quotation",
			type: "text",
			title: "Quotation",
			hidden: false,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "attribution",
			type: "string",
			title: "Attribution",
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
	preview: { select: { title: "quotation" } },
	readOnly: ({ document }) =>
		(document == null ? void 0 : document.contentfulArchived) === !0,
});
