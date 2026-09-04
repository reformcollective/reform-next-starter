import type { ReactNode } from "react"

import { ImageIcon } from "@sanity/icons"
import { universalImage } from "library/sanity/reusables"
import { defineType, defineArrayMember, defineField } from "sanity"

const H1 = ({ children }: { children: ReactNode }) => (
	<span className="studio-block studio-block-h1">{children}</span>
)

const H2 = ({ children }: { children: ReactNode }) => (
	<span className="studio-block studio-block-h2">{children}</span>
)

const Normal = ({ children }: { children: ReactNode }) => (
	<span className="studio-block studio-block-normal">{children}</span>
)

const BlockQuote = ({ children }: { children: ReactNode }) => (
	<span className="studio-block studio-block-quote">{children}</span>
)

export const blogBlockContentType = defineType({
	title: "Block Content",
	name: "blogBlockContent",
	type: "array",
	of: [
		defineArrayMember({
			type: "block",
			styles: [
				{ title: "Normal", value: "normal", component: Normal },
				{ title: "H1", value: "h1", component: H1 },
				{ title: "H2", value: "h2", component: H2 },
				{ title: "Quote", value: "blockquote", component: BlockQuote },
			],
			lists: [{ title: "Bullet", value: "bullet" }],
			marks: {
				decorators: [
					{
						title: "Strong",
						value: "strong",
						component: ({ children }: { children: ReactNode }) => (
							<strong className="studio-strong">{children}</strong>
						),
					},
					{
						title: "Emphasis",
						value: "em",
						component: ({ children }: { children: ReactNode }) => (
							<em className="studio-em">{children}</em>
						),
					},
				],
				annotations: [
					{
						title: "URL",
						name: "link",
						type: "object",
						fields: [
							{
								title: "URL",
								name: "href",
								type: "url",
								validation: (Rule) => Rule.uri({ scheme: ["http", "https", "mailto"] }),
							},
						],
					},
				],
			},
		}),
		defineArrayMember({
			...universalImage({ name: "image", title: "Image" }),
			icon: ImageIcon,
		}),
		defineArrayMember({
			type: "video",
		}),
		defineArrayMember({
			type: "object",
			name: "blockquoteWithAttribution",
			title: "Blockquote",
			fields: [
				defineField({
					type: "text",
					name: "description",
					title: "Quote",
					rows: 4,
				}),
				defineField({
					type: "string",
					name: "authorName",
					title: "Author Name",
				}),
				defineField({
					type: "string",
					name: "authorTitle",
					title: "Author Title",
				}),
			],
		}),
	],
})
