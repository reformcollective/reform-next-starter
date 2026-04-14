import { ImageIcon } from "@sanity/icons"
import { universalImage } from "library/sanity/reusables"
import { defineType, defineArrayMember, defineField } from "sanity"
import type { ReactNode } from "react"

// h6Sans: 40px, weight 600, letter-spacing -5%
const H1 = ({ children }: { children: ReactNode }) => (
	<span
		style={{
			display: "block",
			fontSize: 40,
			fontWeight: 600,
			lineHeight: 1,
			letterSpacing: "-0.05em",
		}}
	>
		{children}
	</span>
)

// h7Serif: 21px, weight 400, line-height 120%
const H2 = ({ children }: { children: ReactNode }) => (
	<span
		style={{
			display: "block",
			fontSize: 21,
			fontWeight: 400,
			lineHeight: 1.2,
			fontFamily: "serif",
		}}
	>
		{children}
	</span>
)

// p2: 14px, weight 500, line-height 150%, letter-spacing -1%
const Normal = ({ children }: { children: ReactNode }) => (
	<span
		style={{
			display: "block",
			fontSize: 14,
			fontWeight: 500,
			lineHeight: 1.5,
			letterSpacing: "-0.01em",
		}}
	>
		{children}
	</span>
)

const BlockQuote = ({ children }: { children: ReactNode }) => (
	<span
		style={{
			display: "block",
			fontSize: 14,
			fontWeight: 500,
			lineHeight: 1.5,
			fontStyle: "italic",
			borderLeft: "3px solid currentcolor",
			paddingLeft: "1em",
			opacity: 0.7,
		}}
	>
		{children}
	</span>
)

export const blog1BlockContentType = defineType({
	title: "Block Content",
	name: "blog1BlockContent",
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
							<strong style={{ fontWeight: 700 }}>{children}</strong>
						),
					},
					{
						title: "Emphasis",
						value: "em",
						component: ({ children }: { children: ReactNode }) => (
							<em style={{ fontStyle: "italic" }}>{children}</em>
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
			...universalImage({ name: "image", title: "Image", cropType: "uncropped" }),
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
