import { PlayIcon } from "@sanity/icons/Play"
import { defineField, defineType } from "sanity"

export const VIDEO_TEST_SCENARIOS = [
	{ title: "Source", value: "source" },
	{ title: "Mode", value: "mode" },
	{ title: "Trigger", value: "trigger" },
	{ title: "Carousel", value: "carousel" },
	{ title: "Safari hidden video", value: "safari" },
	{ title: "Poster", value: "poster" },
	{ title: "Analytics", value: "analytics" },
	{ title: "Regression", value: "regression" },
]

/**
 * A fixture for the `/visual-tests/universal-video` page. The page looks fixtures up by `key` and
 * adds the code-only props each example needs, so the `video` object here is the real editor path.
 */
export const videoTestCase = defineType({
	name: "videoTestCase",
	type: "document",
	title: "Video Test Case",
	icon: PlayIcon,
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "key",
			type: "string",
			title: "Key",
			description: "Stable identifier the test page uses to find this case. Do not rename.",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "scenario",
			type: "string",
			title: "Scenario",
			options: { list: VIDEO_TEST_SCENARIOS },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "note",
			type: "text",
			title: "Note",
			description: "What this case demonstrates and what to look for.",
			rows: 3,
		}),
		defineField({
			name: "order",
			type: "number",
			title: "Order",
			initialValue: 0,
		}),
		defineField({
			name: "video",
			type: "video",
			title: "Video",
			validation: (Rule) => Rule.required(),
		}),
	],
	orderings: [
		{
			title: "Scenario and order",
			name: "scenarioOrder",
			by: [
				{ field: "scenario", direction: "asc" },
				{ field: "order", direction: "asc" },
			],
		},
	],
	preview: {
		select: { title: "title", subtitle: "scenario" },
	},
})
