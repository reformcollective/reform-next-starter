/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import UniversalLink from "library/Loader/UniversalLink"
import { css, fresponsive, styled } from "library/styled"
import {
	PortableText,
	type PortableTextComponents,
	type PortableTextBlock,
} from "next-sanity"
import { Image } from "next-sanity/image"
import textStyles from "styles/text"
import { SmallCard } from "./(components)/SmallCard"
import { urlForImage } from "@/sanity/lib/utils"
import { YoutubeEmbed } from "./(components)/YoutubeEmbed"

export default function CustomPortableText({
	className,
	value,
}: {
	className?: string
	value: PortableTextBlock[]
}) {
	console.log("CustomPortableText", value)

	const portableTextComponents: PortableTextComponents = {
		// Block styles
		block: {
			// Headers
			h1: ({ children }) => <H1>{children}</H1>,
			h2: ({ children }) => <H2>{children}</H2>,
			h3: ({ children }) => <H3>{children}</H3>,
			h4: ({ children }) => <H4>{children}</H4>,
			h5: ({ children }) => <H5>{children}</H5>,
			h6: ({ children }) => <H6>{children}</H6>,
			// Normal paragraph
			normal: ({ children }) => <p className="mb-4">{children}</p>,
			// Blockquote
			blockquote: ({ children }) => (
				<BlockQuote className="pl-4 border-l-4 border-gray-200 italic">
					{children}
				</BlockQuote>
			),
		},

		// List styles
		list: {
			// Bullet lists
			bullet: ({ children }) => <UnorderedList>{children}</UnorderedList>,
			// Numbered lists
			number: ({ children }) => <OrderedList>{children}</OrderedList>,
		},

		// List item
		listItem: {
			// Bullet list item
			bullet: ({ children }) => <BulletListItem>{children}</BulletListItem>,
			// Numbered list item
			number: ({ children }) => <NumberListItem>{children}</NumberListItem>,
		},

		// Marks (inline styles)
		marks: {
			// Links
			link: ({ children, value }) => {
				const href = value?.href || ""
				const target = href.startsWith("http") ? "_blank" : undefined
				const rel = target === "_blank" ? "noopener noreferrer" : undefined

				return (
					<UniversalLink href={href} target={target} rel={rel}>
						{children}
					</UniversalLink>
				)
			},
			// Bold
			strong: ({ children }) => (
				<strong className="font-bold">{children}</strong>
			),
			// Italic
			em: ({ children }) => <em className="italic">{children}</em>,
			// Code
			code: ({ children }) => <Code>{children}</Code>,
			// Underline
			underline: ({ children }) => (
				<span className="underline">{children}</span>
			),
			// Strike-through
			strike: ({ children }) => (
				<span className="line-through">{children}</span>
			),
		},

		// Custom types
		types: {
			// Image
			image: ({ value }) => {
				if (!value?.asset?._ref) {
					return null
				}

				const imageURL = urlForImage(value)?.url()
				return (
					<ArticleImage
						src={imageURL ?? ""}
						alt={value.alt || ""}
						width={1242}
						height={746}
						className="inline-image"
					/>
				)
			},
			// YouTube embed
			youtube: ({ value }) => {
				if (!value?._id) {
					return null
				}

				return <YoutubeEmbed url={value.url} />
			},
			// Call to Action
			// ctaSchema: ({ value }) => {
			// 	if (!value?._id) {
			// 		return null
			// 	}

			// 	return <CallToAction id={value._id} title={value.title} />
			// },
			// Card
			// card: ({ value }) => {
			// 	if (!value?._id) {
			// 		return null
			// 	return <SmallCard title={value.title} />

			// 	return <SmallCard  title={} />
			// },
		},
	}

	return (
		<div className={["prose", className].filter(Boolean).join(" ")}>
			<PortableText components={portableTextComponents} value={value} />
		</div>
	)
}

// Todo: Add styles for the components

const H1 = styled(
	"h1",
	fresponsive(css`
		${textStyles.h1}
	`),
)

const H2 = styled(
	"h1",
	fresponsive(css`
		font-size: 30px;
	`),
)

const H3 = styled(
	"h1",
	fresponsive(css`
		${textStyles.h1}
	`),
)

const H4 = styled(
	"h1",
	fresponsive(css`
		${textStyles.h1}
	`),
)

const H5 = styled(
	"h1",
	fresponsive(css`
		${textStyles.h1}
	`),
)

const H6 = styled(
	"h1",
	fresponsive(css`
		${textStyles.h1}
	`),
)

const BlockQuote = styled("blockquote", {
	color: "red",
})

const ArticleImage = styled(
	Image,
	fresponsive(css`
		object-fit: cover;
		width: 100%;
		height: auto;
	`),
)

const UnorderedList = styled(
	"ul",

	fresponsive(css`
		// add unordered list styles here
		list-style-type: disc;
	`),
)

const OrderedList = styled(
	"ol",
	fresponsive(css`
		// add ordered list styles here
		list-style-type: decimal;
	`),
)

const BulletListItem = styled(
	"li",
	fresponsive(css`
		list-style-type: disc;
		margin-left: 1.5em;

		& > ul {
			li {
				list-style-type: circle;
				margin-left: 1.5em;
			}

			& > li > ul {
				li {
					list-style-type: square;
					margin-left: 1.5em;
				}

				& > li > ul {
					li {
						list-style-type: disc;

						margin-left: 1.5em;
					}
				}
			}
		}
	`),
)

const NumberListItem = styled(
	"li",
	fresponsive(css`
		list-style-type: decimal;
		margin-left: 1.5em;
		& > ol {
			li {
				list-style-type: lower-alpha;
				margin-left: 1.5em;
			}

			& > li > ol {
				li {
					list-style-type: lower-roman;
					margin-left: 1.5em;
				}

				& > li > ol {
					li {
						list-style-type: upper-latin;
						margin-left: 1.5em;
					}
				}
			}
		}
	`),
)

const Code = styled(
	"code",
	fresponsive(css`
		background-color: black;
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-family: "Courier New", Courier, monospace;
		font-size: 0.95em;
		color: white;
		white-space: pre-wrap;
	`),
)

const YouTubeEmbed = styled(
	"iframe",
	fresponsive(css`
		width: 100%;
		height: auto;
	`),
)
