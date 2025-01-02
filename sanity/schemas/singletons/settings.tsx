import { CogIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

export default defineType({
	name: "settings",
	title: "Settings",
	type: "document",
	icon: CogIcon,
	fields: [
		defineField({
			name: "defaultTitle",
			title: "Default Page Title",
			type: "string",
		}),
		defineField({
			name: "defaultDescription",
			title: "Default Page Description",
			type: "string",
			description:
				"This will be used when shared on socials, and by some search engines.",
		}),
		defineField({
			name: "ogImage",
			title: "Default Open Graph Image",
			type: "image",
			description: "Displayed on social cards and search engine results.",
			options: {
				hotspot: true,
				aiAssist: {
					imageDescriptionField: "alt",
				},
			},
			fields: [
				defineField({
					name: "alt",
					description: "Important for accessibility and SEO.",
					title: "Alternative text",
					type: "string",
					validation: (rule) => {
						return rule.custom((alt, context) => {
							if (
								(context.document?.ogImage as { asset?: { _ref?: string } })
									?.asset?._ref &&
								!alt
							) {
								return "Required"
							}
							return true
						})
					},
				}),
			],
		}),
	],
	preview: {
		prepare() {
			return {
				title: "Settings",
			}
		},
	},
})
