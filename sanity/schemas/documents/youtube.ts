import { defineField, defineType, type SchemaTypeDefinition } from "sanity";

export default defineType({
	type: "document",
	name: "youtube",
	title: "Component - Youtube Video",
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
			name: "youtubeLink",
			type: "url",
			title: "Youtube Link",
			hidden: false,
			description:
				"A youtu.be short link to the video. On a youtube video, and click share to get a link.",
			validation: (Rule) =>
				Rule.required().uri({
					allowCredentials: true,
					allowRelative: true,
					relativeOnly: false,
					scheme: [/^http/, /^https/],
				}),
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
