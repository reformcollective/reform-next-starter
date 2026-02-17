import { createSectionPreview } from "library/sanity/reusables"
import { defineArrayMember, defineField } from "sanity"
import preview from "./preview/sample.png"

export const sample = defineArrayMember({
	groups: [{ name: "Designed for SamplePage" }],
	type: "object",
	name: "sample",
	title: "Sample Section",
	// use browser devtools to capture an image of the section (ideally 1600x900 but can be any size)
	icon: createSectionPreview(preview),
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
			name: "genericVideo",
			title: "Generic Video (Test)",
			type: "video",
		}),
		defineField({
			name: "genericVideo2",
			title: "Generic Video 2 (Test)",
			type: "video",
		}),
		defineField({
			name: "genericVideo3",
			title: "Generic Video 3 (Test)",
			type: "video",
		}),
	],
})
