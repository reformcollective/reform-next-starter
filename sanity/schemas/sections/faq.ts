import { definePageSection, faqItems } from "library/sanity/reusables"
import { defineField } from "sanity"

import preview from "./preview/faq.png"

export const faq = definePageSection({
	group: "Designed for Any Page",
	type: "object",
	name: "faq",
	title: "FAQ Section",
	// currently using a plain faq background. Update as needed faq.png
	icon: preview,
	preview: {
		prepare() {
			return {
				title: "FAQ Section",
				subtitle: "Commonly asked questions and answers in an accordion format.",
			}
		},
	},
	fields: [
		defineField({
			type: "string",
			name: "kicker",
			title: "Kicker",
		}),
		defineField({
			type: "string",
			name: "title",
			title: "Title",
			validation: (Rule) => Rule.required(),
		}),
		faqItems(),
	],
})
