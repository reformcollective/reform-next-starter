import { defineField, defineType } from "sanity";

export default defineType({
	name: "break",
	title: "Break",
	type: "document",
	fields: [
		defineField({
			name: "style",
			type: "string",
			options: {
				list: [
					{ title: "Line break", value: "lineBreak" },
					{ title: "Read more", value: "readMore" },
				],
			},
		}),
	],
});
