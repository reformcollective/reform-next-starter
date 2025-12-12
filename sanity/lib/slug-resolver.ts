/** biome-ignore-all lint/suspicious/noExplicitAny: types are not well known ahead of time */

import type { AllSanitySchemaTypes } from "sanity.types"
import { siteURL } from "library/siteURL"
import type { DocumentLocation, DocumentLocationResolver } from "sanity/presentation"

import { map } from "library/sanity/rxjs"

type Schemas = Extract<AllSanitySchemaTypes, { _type: string }>

type SchemaResolver<U extends { _type: string }> = {
	[K in U["_type"]]?: (param: Extract<U, { _type: K }>) => {
		self: DocumentLocation | undefined
		otherRelevantPages?: DocumentLocation[]
	}
}

/**
 * this resolver will set up studio for the given schema type
 * you're still responsible for creating the page.tsx that will render the page
 */
const slugResolver: SchemaResolver<Schemas> = {
	page: (item) => {
		return {
			self: item.slug?.current
				? {
						href: item.slug?.current === "home" ? "/" : item.slug?.current,
						title: item.title ?? "Untitled Page",
					}
				: undefined,
		}
	},
}

/**
 * take a document and return the locations from the slug resolver
 */
const resolveDocument = (document: any) => {
	const resolver = slugResolver[document._type as keyof typeof slugResolver]
	if (!resolver) return undefined

	const locations = resolver(document)
	if (!locations) return undefined

	return locations
}

/**
 * take a document and return the href
 */
export const resolveLink = (document: any) => {
	const locations = resolveDocument(document)
	if (!locations?.self) return undefined

	return locations.self.href
}

/**
 * take a document and return the *production* url
 */
export const resolveProductionUrl = (document: any) => {
	const link = resolveLink(document)

	return `${siteURL}${link}`
}

/**
 * document locations resolver for the presentation tool
 */
export const resolveDocumentLocations: DocumentLocationResolver = ({ id }, context) => {
	const doc$ = context.documentStore.listenQuery(
		`*[_id==$id][0]`,
		{ id },
		{ perspective: "previewDrafts" },
	)

	return doc$.pipe(
		map((document) => {
			const locations = resolveDocument(document)
			if (!locations) return { locations: [] }

			const self = locations.self
			const otherRelevantPages = locations.otherRelevantPages ?? []

			return {
				locations: [self, ...otherRelevantPages].filter(Boolean),
			}
		}),
	)
}

/**
 * get all linkable schema types configured by the slug resolver
 */
export const getLinkableTypes = () => {
	return Object.keys(slugResolver)
}
