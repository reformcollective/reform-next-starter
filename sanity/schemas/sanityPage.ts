import {
	defineArrayMember,
	defineField,
	defineType,
	// type ObjectItemProps,
} from "sanity"
// import { Card } from "@sanity/ui"
import { DesktopIcon } from "@sanity/icons"

import * as sections from "./sections"

export default defineType({
	icon: DesktopIcon,
	name: "page",
	title: "Page",
	type: "document",
	fields: [
		defineField({
			type: "string",
			name: "title",
			title: "Page Title",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			type: "slug",
			name: "slug",
			title: "Page Slug",
			options: {
				source: "title",
			},
			description: "'home' is an alias to the root of the site: '/'",
		}),
		defineField({
			name: "description",
			title: "Default Page Description",
			type: "string",
			description:
				"Leave blank to reuse the default, defined in Settings. This will be used when shared on socials, and by some search engines.",
		}),
		defineField({
			name: "ogImage",
			title: "Default Open Graph Image",
			type: "image",
			description:
				"Leave blank to reuse the default, defined in Settings. Displayed on social cards and search engine results.",
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
		defineField({
			type: "array",
			name: "sections",
			of: [...Object.values(sections)].map((section) =>
				defineArrayMember({
					...section,
					// components: {
					// 	item: (props: ObjectItemProps) => {
					// 		const { inputProps, ...restProps } = props
					// 		const { renderPreview, ...restInputProps } = inputProps

					// 		return (
					// 			<Card>
					// 				{restProps.renderDefault({
					// 					...restProps,
					// 					inputProps: {
					// 						...restInputProps,
					// 						renderPreview: (previewProps) => (
					// 							<Card>{props.children}</Card>
					// 						),
					// 					},
					// 					open: false,
					// 				})}
					// 			</Card>
					// 		)
					// 	},
					// },
				}),
			),
			options: { layout: "list" },
		}),
	],
})
