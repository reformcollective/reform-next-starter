import { CogIcon } from "@sanity/icons"
import { universalImage } from "library/sanity/reusables"
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
		universalImage({
			name: "ogImage",
			title: "Default Open Graph Image",
			description: "Displayed on social cards and search engine results.",
			cropType: "sanity",
			withAlt: false,
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
