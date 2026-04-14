import { DocumentTextIcon } from "@sanity/icons"
import { universalLink } from "library/sanity/reusables"
import { defineArrayMember, defineField, defineType } from "sanity"
import { ReadTimeInput } from "./ReadTimeInput"

const discoverCTAFields = [
	defineField({
		type: "string",
		name: "title",
		title: "Section Title",
		description: "The large header text for the CTA section.",
		initialValue: "Discover What's Possible",
		validation: (Rule) => Rule.required(),
	}),
	defineField({
		type: "string",
		name: "text",
		title: "Section Text",
		description: "The smaller supporting text for the CTA section.",
		validation: (Rule) => Rule.required(),
	}),
	defineField({
		type: "string",
		name: "colorScheme",
		title: "Color Scheme",
		options: {
			list: [
				{ title: "Light", value: "light" },
				{ title: "Dark", value: "dark" },
			],
			layout: "radio",
		},
		initialValue: "light",
		validation: (Rule) => Rule.required(),
	}),
	{
		...universalLink({ title: "Link", name: "link", defaultType: "internal" }),
		initialValue: { type: "internal", toNewTab: false, text: "Learn More" },
	},
]

export const blog1PostType = defineType({
	name: "blog1Post",
	title: "Blog 1 Post",
	type: "document",
	icon: DocumentTextIcon,
	groups: [
		{ name: "content", title: "Content", default: true },
		{ name: "discoverCTA", title: "Discover CTA" },
	],
	fields: [
		defineField({
			name: "title",
			type: "string",
			group: "content",
		}),
		defineField({
			name: "slug",
			type: "slug",
			options: {
				source: "title",
			},
			group: "content",
		}),
		defineField({
			name: "author",
			type: "reference",
			to: { type: "blog1Author" },
			group: "content",
		}),
		defineField({
			name: "articleTextPreview",
			type: "text",
			title: "Article Text Preview",
			description:
				"A short description of the article. Used on the blog hub page and at the top of the article. Supports line breaks.",
			validation: (Rule) => Rule.required(),
			group: "content",
		}),
		defineField({
			name: "mainImage",
			type: "image",
			options: {
				hotspot: true,
			},
			fields: [
				defineField({
					name: "alt",
					type: "string",
					title: "Alternative text",
				}),
			],
			group: "content",
		}),
		defineField({
			name: "categories",
			type: "array",
			of: [defineArrayMember({ type: "reference", to: { type: "blog1Category" } })],
			validation: (Rule) => Rule.max(2),
			group: "content",
		}),
		defineField({
			name: "publishedAt",
			type: "datetime",
			group: "content",
		}),
		defineField({
			name: "body",
			type: "blog1BlockContent",
			group: "content",
		}),
		defineField({
			name: "readTime",
			title: "Read Time",
			type: "string",
			components: { input: ReadTimeInput },
			group: "content",
		}),
		defineField({
			name: "discoverCTA",
			title: "Discover CTA",
			type: "object",
			group: "discoverCTA",
			fields: [...discoverCTAFields],
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
