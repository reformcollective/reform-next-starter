import { ImageIcon } from "@sanity/icons"
import { imageWithAlt } from "library/sanity/reusables"
import { defineField, defineType } from "sanity"

export default defineType({
	type: "document",
	name: "post",
	title: "Blog Post",
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
		defineField({
			name: "isFeatured",
			type: "boolean",
			title: "Is Featured Article",
			description:
				"if multiple articles are marked as featured, the most recent one will display",
		}),
		defineField({
			name: "publishDate",
			type: "datetime",
			title: "Publish Date",
			description:
				"If this post was initially published in the past, you can set that here",
			options: { timeFormat: "H:mmZ" },
		}),
		defineField({
			name: "articleText",
			type: "array",
			of: [
				{ type: "block" },
				imageWithAlt({
					name: "image",
					icon: ImageIcon,
				}),
				{ type: "youtube" },
			],
			title: "Article Text",
			validation: (Rule) => Rule.required(),
		}),
	],
})
