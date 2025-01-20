import { PlayIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

export default defineType({
	name: "youtube",
	type: "object",
	title: "YouTube",
	icon: PlayIcon,
	fields: [
		defineField({
			name: "url",
			type: "url",
			title: "YouTube video URL",
		}),
	],
})
