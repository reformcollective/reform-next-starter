import { defineField, defineType } from "sanity"
import {
	BlockquoteIcon,
	DoubleChevronDownIcon,
	DoubleChevronUpIcon,
	ImageIcon,
	DocumentIcon,
} from "@sanity/icons"
import { imageWithAlt } from "library/sanity/reusables"

export default defineType({
	type: "document",
	name: "post",
	title: "Template - Blog Post",
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Post Title",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "slug",
			type: "slug",
			title: "Post Slug",
			validation: (Rule) => Rule.required(),
			options: { source: "title" },
		}),
		imageWithAlt({
			name: "mainImage",
			title: "Main Image",
		}),
		defineField({
			name: "author",
			type: "reference",
			title: "Author",
			to: [{ type: "author" }],
		}),
		defineField({
			name: "categories",
			type: "array",
			of: [{ type: "string" }],
			title: "Categories",
			options: { layout: "tags" },
		}),
		defineField({
			name: "metadataDescription",
			type: "text",
			title: "Metadata Description",
			description:
				"used as a synopsis. also used when shared via social media, and by some search engines",
		}),
		defineField({
			name: "ogImage",
			type: "image",
			title: "Open Graph Image",
		}),
		// TODO portable text utilities
		defineField({
			name: "articleText",
			type: "array",
			of: [
				{
					type: "block",
					styles: [
						{ title: "Heading 1", value: "h1" },
						{ title: "Heading 2", value: "h2" },
						{ title: "Heading 3", value: "h3" },
						{ title: "Heading 4", value: "h4" },
						{ title: "Heading 5", value: "h5" },
						{ title: "Heading 6", value: "h6" },
						{ title: "Normal", value: "normal" },
						{
							title: "Blockquote",
							value: "blockquote",
							icon: BlockquoteIcon,
						},
					],
					lists: [
						{ title: "Bullet", value: "bullet" },
						{ title: "Numbered", value: "number" },
					],

					marks: {
						decorators: [
							{ title: "Strong", value: "strong" },
							{ title: "Emphasis", value: "em" },
							{ title: "Code", value: "code" },
							{ title: "Underline", value: "underline" },
							{ title: "Strike", value: "strike-through" },
							{ title: "Super", value: "super", icon: DoubleChevronUpIcon },
							{ title: "Sub", value: "sub", icon: DoubleChevronDownIcon },
						],
						annotations: [
							{
								type: "object",
								name: "link",
								title: "url",
								fields: [
									defineField({
										type: "string",
										name: "href",
										title: "URL",
										validation: (Rule) => Rule.required(),
									}),
									defineField({
										type: "string",
										name: "target",
										title: "Target",
										options: {
											list: [
												{ value: "_blank", title: "Blank" },
												{ value: "_parent", title: "Parent" },
											],
										},
									}),
								],
							},
						],
					},
				},
				{ type: "image", icon: ImageIcon },
				{ type: "file", icon: DocumentIcon },
				{ type: "youtube" },
			],
			title: "Article Text",
			hidden: false,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "isFeatured",
			type: "boolean",
			title: "Is Featured Article",
			description:
				"if multiple articles are marked as featured, the most recent one will display",
			initialValue: false,
		}),
		defineField({
			name: "publishDate",
			type: "datetime",
			title: "Publish Date",
			description:
				"If this post was initially published in the past, you can set that here",
			options: { timeFormat: "H:mmZ" },
		}),
	],
})
