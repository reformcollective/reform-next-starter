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
			withAlt: false,
		}),
		defineField({
			name: "noIndex",
			type: "boolean",
			title: "Hide from Search Engines",
			description: "Enable this to hide the page from search engines like Google.",
		}),
		defineField({
			name: "searchMode",
			type: "string",
			title: "Search Mode",
			description:
				"Client-side: all posts are loaded upfront and filtered in the browser — fast, no latency, searches title and preview text only. Server-side: searches are sent to Sanity on each keystroke — adds ~100–300ms latency but enables full body text search. Switch to server-side when you need full article search or have so many posts that loading them all upfront is too slow.",
			options: {
				list: [
					{ title: "Client-side (default — fast, title + preview)", value: "client" },
					{ title: "Server-side (full body text search)", value: "server" },
				],
				layout: "radio",
			},
			initialValue: "client",
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
