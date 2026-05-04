import { defineDocumentPaths } from "library/sanity/define-document-paths"

/**
 * maps from linkable document types to their pathname and page title in JS
 * used when you already have a document and need to determine its slug
 *
 * for consistency, include a leading slash and no trailing slash
 *
 * @see library/sanity/document-helpers
 */
export const documentPaths = defineDocumentPaths({
	page: (document) => ({
		path: document.slug?.current === "home" ? "/" : `/${document.slug?.current}`,
		title: document.title ?? "Untitled Page",
	}),
	blog1Hub: (document) => ({
		path: document.slug?.current ? `/${document.slug.current}` : null,
		title: document.title ?? "Blog",
	}),
})

/**
 * maps from linkable document types to their pathname in GROQ
 * used in sitemaps, link projections, and page queries
 *
 * for consistency, include a leading slash and no trailing slash
 *
 * @see library/assetMetadata.ts
 * @see app/sitemap.ts
 * @see app/[[...slug]]/page.tsx
 */
export const documentPathProjection = <T extends string>(document: T) =>
	`
	select(
	  !defined(${document}) => null,
		${document}._type == "page" => select(
			${document}.slug.current == "home" => "/",
			"/" + ${document}.slug.current
		),
		${document}._type == "blog1Hub" => "/" + ${document}.slug.current,
		${document}._type == "blog1Post" => select(
			defined(*[_type == "blog1Hub"][0].slug.current) =>
				"/" + *[_type == "blog1Hub"][0].slug.current + "/" + ${document}.slug.current
		)
	)
` as const
