import { UserIcon } from "@sanity/icons"
import { universalImage } from "library/sanity/reusables"
import { defineArrayMember, defineField, defineType } from "sanity"

export const blog1AuthorType = defineType({
	name: "blog1Author",
	title: "Blog 1 Author",
	type: "document",
	icon: UserIcon,
	fields: [
		defineField({
			name: "name",
			type: "string",
			description: "Author's name and Job title (e.g. Jane, CEO )",
		}),
		defineField({
			name: "company",
			type: "string",
		}),
		defineField({
			name: "slug",
			type: "slug",
			options: {
				source: "name",
			},
		}),
		universalImage({ name: "image", title: "Image", cropType: "css", withAlt: false }),
		defineField({
			name: "bio",
			type: "array",
			of: [
				defineArrayMember({
					type: "block",
					styles: [{ title: "Normal", value: "normal" }],
					lists: [],
				}),
			],
		}),
	],
	preview: {
		select: {
			title: "name",
			media: "image",
		},
	},
})
