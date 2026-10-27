import { ImagesIcon } from "@sanity/icons/Images"
import { documentLinkType, smsLinkType, staticPageLinkType } from "library/link/resolve"
import { universalImage, universalLink } from "library/sanity/reusables"
import { defineField, defineType } from "sanity"

/**
 * A named group of images referenced by whichever sections need it, rather than each
 * section holding its own copy. Reference it from a section with:
 *
 *   defineField({ name: "logoSet", type: "reference", to: [{ type: "logoSet" }] })
 *
 * and dereference it in that section's projection: `logoSet->{ logos[] { ... } }`
 */
export const logoSet = defineType({
	name: "logoSet",
	type: "document",
	title: "Logo Set",
	icon: ImagesIcon,
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			description: "Internal name for this logo set (e.g. 'Partner Logos')",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "logosLink",
			type: "boolean",
			title: "Logos link out",
			description:
				"Turn on for sets whose logos should be clickable, like press mentions. Sections that don't render logo links ignore it.",
			initialValue: false,
		}),
		defineField({
			name: "logos",
			type: "array",
			of: [
				defineField({
					...universalImage({
						name: "logo",
						title: "Company Logo",
						fields: [
							defineField({
								...universalLink({
									name: "link",
									title: "Link",
									withText: false,
								}),
								description:
									"Optional. Where this logo links to: a source article or an internal page.",
								hidden: ({ document }) => document?.logosLink !== true,
								validation: (Rule) =>
									Rule.custom(
										(field: { type?: string; url?: string } | undefined, { document }) => {
											if (document?.logosLink !== true) return true
											if (field?.type === "external" && field.url && !field.url.startsWith("http"))
												return { message: "External links must start with http", path: ["url"] }
											return true
										},
									),
							}),
						],
					}),
					preview: {
						select: {
							alt: "alt",
							media: "asset",
							fallback: "asset.originalFilename",
							linkType: "link.type",
							internalSlug: "link.internalLink.slug.current",
							url: "link.url",
							email: "link.email",
							phone: "link.phone",
							sms: "link.sms",
							value: "link.value",
							fileName: "link.documentLink.asset.originalFilename",
						},
						prepare({
							alt,
							media,
							fallback,
							linkType,
							internalSlug,
							url,
							email,
							phone,
							sms,
							value,
							fileName,
						}) {
							const destinations: Record<string, unknown> = {
								internal: internalSlug && (internalSlug === "home" ? "/" : `/${internalSlug}`),
								external: url,
								email,
								phone,
								[smsLinkType]: sms,
								[staticPageLinkType]: value,
								[documentLinkType]: fileName,
							}
							const destination = destinations[linkType]

							return {
								media,
								title: alt || fallback,
								subtitle: typeof destination === "string" ? `Links to ${destination}` : undefined,
							}
						},
					},
				}),
			],
			title: "Logos",
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: "title",
		},
	},
})
