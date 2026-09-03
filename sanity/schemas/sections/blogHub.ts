import { definePageSection } from "library/sanity/reusables"
import { defineField } from "sanity"

import preview from "./preview/sample.png"

export const blogHub = definePageSection({
	group: "Designed for Blog",
	type: "object",
	name: "blogHub",
	title: "Blog Hub",
	// TODO placeholder preview — capture the blog hub section and replace
	icon: preview,
	fields: [
		defineField({
			name: "featuredPost",
			type: "reference",
			title: "Featured Article",
			description: "Choose ONE article to feature at the top of this hub.",
			to: [{ type: "page" }],
			options: {
				filter: 'kind == "hubDetail"',
			},
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
				title: "Blog Hub",
				subtitle: "Lists every article nested under this page",
			}
		},
	},
})
