import { DesktopIcon } from "@sanity/icons"
import { redirect, universalImage } from "library/sanity/reusables"
import { siteURL } from "library/siteURL"
import { styled } from "library/styled"
import { defineField, defineType } from "sanity"
import * as sections from "./sections"

const allSections = Object.values(sections)
const groupNames = new Set(
	allSections
		.flatMap((section) => section.groups?.map((group) => group.name))
		.filter((group) => group !== undefined),
)

const groups = Array.from(groupNames).map((name) => ({
	name,
	of: allSections
		.filter((section) => section.groups?.some((group) => group.name === name))
		.map((section) => section.name)
		.filter((section) => section !== undefined),
}))

const Code = styled("code", {
	border: "1px solid rgb(from currentcolor r g b / 20%)",
	borderRadius: "4px !important",
	padding: "0 4px",
})

export const pageMetadata = [
	defineField({
		type: "string",
		name: "title",
		title: "Page Title",
		validation: (Rule) => Rule.required(),
	}),
	defineField({
		type: "slug",
		name: "slug",
		title: "Page Slug",
		description: (
			<>
				<p>
					This will be used to generate the URL for this page. For example, <Code>about</Code> will
					create a page at <Code>{siteURL}/about</Code>
				</p>
				<br />
				<p>
					<Code>home</Code> is a special slug that will create a page at <Code>{siteURL}</Code>
				</p>
				<br />
				<p>
					You can also use a nested slug. For example, <Code>about/us</Code> will create a page at{" "}
					<Code>{siteURL}/about/us</Code>
				</p>
				<br />
			</>
		),
		options: {
			source: "title",
		},
		validation: (rule) =>
			rule.custom((slug) => {
				if (slug?.current?.startsWith("/"))
					return {
						message: "Page slug must not start with a slash",
					}
				if (slug?.current?.endsWith("/"))
					return {
						message: "Page slug must not end with a slash",
					}
				if (slug?.current?.includes(" "))
					return {
						message: "Page slug must not contain spaces",
					}
				if (!slug?.current)
					return {
						message: "Page slug must not be empty",
					}
				return true
			}),
	}),
	defineField({
		name: "description",
		title: "Page Description",
		type: "string",
		description:
			"Leave blank to reuse the default, defined in Settings. This will be used when shared on socials, and by some search engines.",
	}),
	universalImage({
		name: "ogImage",
		title: "Open Graph Image",
		description:
			"Leave blank to reuse the default, defined in Settings. Displayed on social cards and search engine results.",
		cropType: "sanity",
		withAlt: false,
	}),
	defineField({
		name: "noIndex",
		type: "boolean",
		title: "Hide from Search Engines",
		description: (
			<>
				Enable this to hide the page from search engines like Google. Note that once a page has been
				detected by a search engine, disabling this will not immediately remove the page from search
				engines.
			</>
		),
	}),
]

export default defineType({
	icon: DesktopIcon,
	name: "page",
	title: "Page",
	type: "document",
	fields: [
		...pageMetadata,
		defineField({
			type: "array",
			name: "sections",
			of: [...allSections, redirect],
			options: {
				insertMenu: {
					groups: groups,
					views: [{ name: "list" }, { name: "grid" }],
				},
			},
		}),
	],
})
