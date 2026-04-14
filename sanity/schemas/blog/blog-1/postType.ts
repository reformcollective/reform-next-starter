import { DocumentTextIcon } from "@sanity/icons"
import { universalImage } from "library/sanity/reusables"
import { defineArrayMember, defineField, defineType } from "sanity"
import { ReadTimeInput } from "./ReadTimeInput"

export const blog1PostType = defineType({
	name: "blog1Post",
	title: "Blog 1 Post",
	type: "document",
	icon: DocumentTextIcon,
	fields: [
		defineField({
			name: "title",
			type: "string",
		}),
		defineField({
			name: "slug",
			type: "slug",
			options: {
				source: "title",
			},
		}),
		defineField({
			name: "author",
			type: "reference",
			to: { type: "blog1Author" },
		}),
		defineField({
			name: "articleTextPreview",
			type: "text",
			title: "Article Text Preview",
			description:
				"A short description of the article. Used on the blog hub page and at the top of the article. Supports line breaks.",
			validation: (Rule) => Rule.required(),
		}),
		{
			...universalImage({ name: "mainImage", title: "Main Image", cropType: "css" }),
		},
		defineField({
			name: "categories",
			type: "array",
			of: [defineArrayMember({ type: "reference", to: { type: "blog1Category" } })],
			validation: (Rule) => Rule.max(2),
		}),
		defineField({
			name: "publishedAt",
			type: "datetime",
		}),
		defineField({
			name: "body",
			type: "blog1BlockContent",
		}),
		defineField({
			name: "readTime",
			title: "Read Time",
			type: "string",
			components: { input: ReadTimeInput },
		}),
	],
	preview: {
		select: {
			title: "title",
			author: "author.name",
			media: "mainImage",
		},
		prepare(selection) {
			const { author } = selection
			return { ...selection, subtitle: author && `by ${author}` }
		},
	},
})
