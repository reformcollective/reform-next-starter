import { ImageIcon, PlayIcon } from "@sanity/icons"
import { universalImage } from "library/sanity/reusables"
import { defineField, defineType } from "sanity"

export default defineType({
	type: "document",
	name: "post",
	title: "Blog Post",
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "slug",
			type: "slug",
			title: "Slug",
			validation: (Rule) => Rule.required(),
			options: { source: "title" },
		}),
		universalImage({
			name: "mainImage",
			title: "Main Image",
			cropType: "sanity",
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
			name: "isFeatured",
			type: "boolean",
			title: "Is Featured",
			description:
				"if multiple posts are marked as featured, the most recent one will display",
		}),
		defineField({
			name: "publishOverride",
			type: "datetime",
			title: "Publish Date Override",
			description:
				"Set if you want to override the visible publish date (for example, if this was originally published in the past)",
			options: { timeFormat: "H:mmZ" },
		}),
		defineField({
			name: "preview",
			type: "text",
			title: "Synopsis",
			description:
				"used as post preview. also used when shared via social media, and by some search engines",
		}),
		defineField({
			name: "content",
			type: "array",
			of: [
				{ type: "block" },
				universalImage({
					name: "image",
					icon: ImageIcon,
					cropType: "uncropped",
				}),
				{ type: "youtube", icon: PlayIcon },
			],
			title: "Text",
			validation: (Rule) => Rule.required(),
		}),
	],
})
