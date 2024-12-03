import { CogIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

export default defineType({
	name: "settings",
	title: "Settings",
	type: "document",
	icon: CogIcon,
	fields: [
		defineField({
			name: "ogImage",
			title: "Open Graph Image",
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
				defineField({
					name: "metadataBase",
					type: "url",
					description: (
						<a
							href="https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase"
							rel="noreferrer noopener"
						>
							More information
						</a>
					),
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
