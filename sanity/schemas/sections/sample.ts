import { definePageSection, universalImage, universalLink } from "library/sanity/reusables"
import { defineField } from "sanity"

import preview from "./preview/sample.png"

export const sample = definePageSection({
	group: "Designed for SamplePage",
	type: "object",
	name: "sample",
	title: "Sample Section",
	// use browser devtools to capture an image of the section (ideally 1600x900 but can be any size)
	icon: preview,
	fields: [
		defineField({
			type: "string",
			name: "title",
			title: "Section Title",
		}),
		defineField({
			type: "string",
			name: "text",
			title: "Section Text",
		}),

		defineField({
			name: "sampleVideo",
			title: "Sample Video",
			type: "video",
		}),
		universalImage({
			name: "sampleImage",
			title: "Sample Image",
		}),
		universalLink({
			name: "sampleLink",
			title: "Sample Link",
		}),
	],
})
