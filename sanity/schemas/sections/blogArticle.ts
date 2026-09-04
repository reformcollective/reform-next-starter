import { definePageSection } from "library/sanity/reusables"
import { defineField } from "sanity"

import preview from "./preview/blogArticle.png"

export const blogArticle = definePageSection({
	group: "Designed for Blog",
	type: "object",
	name: "blogArticle",
	title: "Blog Article",
	icon: preview,
	fields: [
		defineField({
			name: "body",
			type: "blogBlockContent",
			title: "Body",
		}),
	],
	preview: {
		prepare() {
			return {
				title: "Blog Article",
				subtitle: "The article's main image and body",
			}
		},
	},
})
