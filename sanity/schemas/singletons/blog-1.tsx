import { universalLink } from "library/sanity/reusables"
import { defineField, defineType } from "sanity"

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

export const blog1Hub = defineType({
	name: "blog1Hub",
	title: "Blog 1 Hub",
	type: "document",
	description: "Choose a featured blog post to highlight on the blog hub page",
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			description:
				"The title of the blog homepage. For internal organization only. Will not be displayed in this design.",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "featuredPost",
			type: "reference",
			title: "Featured Blog Post",
			hidden: false,
			description: "Choose ONE blog post to feature.",
			validation: (Rule) => Rule.required(),
			to: [{ type: "blog1Post" }],
		}),
		defineField({
			name: "slug",
			type: "slug",
			title: "Slug",
			description: "The URL path for the blog hub page (e.g. 'blog-1' → /blog-1).",
			validation: (Rule) => Rule.required(),
			options: {
				source: () => "blog-1",
				slugify: (input) => input.trim().replace(/^\/+/, ""),
			},
		}),
		defineField({
			name: "discoverCTA",
			title: "Discover CTA",
			type: "object",
			fields: [...discoverCTAFields],
		}),
	],
	preview: {
		prepare() {
			return {
				title: `Blog 1 Hub Page`,
			}
		},
	},
})
