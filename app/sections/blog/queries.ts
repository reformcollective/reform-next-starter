import { assetMetadataFunctions } from "library/sanity/assetMetadata"
import { defineQuery } from "next-sanity"
import { documentPathProjection } from "sanity/lib/slug-resolver"
import { articleCardProjection } from "sanity/schemas/sections/projections/blogHub"

/**
 * Articles a hub lists: everything nested under its slug, minus anything belonging to a
 * hub nested deeper. `$nestedHubPrefixes` is empty for every hub that has no hub beneath
 * it, which is the normal case — the exclusion then costs nothing.
 */
const articlesUnderHub = `_type == "page" && kind == "hubDetail"
	&& string::startsWith(slug.current, $hubSlug + "/")
	&& count($nestedHubPrefixes[@ != "" && string::startsWith(^.slug.current, @)]) == 0`

export const nestedHubsQuery = defineQuery(`
	*[
		_type == "page" && kind == "hub" &&
		slug.current != $hubSlug &&
		string::startsWith(slug.current, $hubSlug + "/")
	].slug.current
`)

export const hubArticlesQuery = defineQuery(`
	${assetMetadataFunctions}

	*[${articlesUnderHub}] | order(publishedAt desc) ${articleCardProjection}
`)

// groq-js does not infer $param from `match` expressions, so defineQuery cannot
// be used here. The query and return type are correct at runtime.
export const hubArticlesSearchQuery = `
	${assetMetadataFunctions}

	*[${articlesUnderHub} && [title, pt::text(sections[_type == "blogArticle"].body)] match $searchQuery] | order(publishedAt desc) ${articleCardProjection}
`

export const articleContextQuery = defineQuery(`
	${assetMetadataFunctions}

	*[_type == "page" && _id == $id][0] {
		// longest matching slug first, so a nested hub wins over its parent
		"hubDoc": *[
			_type == "page" && kind == "hub" &&
			string::startsWith(^.slug.current, slug.current + "/")
		] | order(length(slug.current) desc) [0],
		...
	} {
		"hub": hubDoc {
			title,
			"path": ${documentPathProjection("@")}
		},
		"author": author-> {
			name,
			company,
			"image": reform::image(image)
		},
		"categories": categories[]->title,
		// scoped to this article's own hub, so a press article never suggests a blog post
		"related": *[
			_type == "page" && kind == "hubDetail" && _id != ^._id &&
			string::startsWith(slug.current, ^.hubDoc.slug.current + "/") &&
			count((categories[]->title)[@ in ^.^.categories[]->title]) > 0
		] | order(publishedAt desc) [0...3] ${articleCardProjection},
		"recent": *[
			_type == "page" && kind == "hubDetail" && _id != ^._id &&
			string::startsWith(slug.current, ^.hubDoc.slug.current + "/")
		] | order(publishedAt desc) [0...3] ${articleCardProjection}
	}
`)
