import { definePageSection } from "library/sanity/reusables"
import { defineField } from "sanity"

import preview from "./preview/sample.png"

export const blogArticle = definePageSection({
	group: "Designed for Blog",
	type: "object",
	name: "blogArticle",
	title: "Blog Article",
	// TODO placeholder preview — capture the blog article section and replace
	icon: preview,
	fields: [
		defineField({
			name: "body",
			type: "blog1BlockContent",
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
