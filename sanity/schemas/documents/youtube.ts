import { defineField, defineType } from "sanity"
import { PlayIcon } from "@sanity/icons"

export default defineType({
	name: "youtube",
	type: "object",
	title: "YouTube Embed",
	icon: PlayIcon,
	fields: [
		defineField({
			name: "url",
			type: "url",
			title: "YouTube video URL",
		}),
	],
})
