import { universalImage } from "library/sanity/reusables"
import { defineField, defineType } from "sanity"

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
			name: "description",
			title: "Page Description",
			type: "string",
			description:
				"Leave blank to reuse the default, defined in Settings. This will be used when shared on socials, and by some search engines.",
		}),
		universalImage({
			name: "ogImage",
			title: "Open Graph Image",
			description:
				"Leave blank to reuse the default, defined in Settings. Displayed on social cards and search engine results.",
			cropType: "sanity",
			withAlt: false,
		}),
		defineField({
			name: "noIndex",
			type: "boolean",
			title: "Hide from Search Engines",
			description: "Enable this to hide the page from search engines like Google.",
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
