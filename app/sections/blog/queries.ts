import { assetMetadataFunctions } from "library/sanity/assetMetadata"
import { defineQuery } from "next-sanity"
import { documentPathProjection } from "sanity/lib/slug-resolver"
import { articleCardProjection } from "sanity/schemas/sections/projections/blogHub"

const articlesUnderHub = `_type == "page" && kind == "blogPost" && string::startsWith(slug.current, $hubSlug + "/")`

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
		"hub": *[_type == "page" && kind == "blogHub" && ^.slug.current match slug.current + "/*"][0] {
			title,
			"path": ${documentPathProjection("@")}
		},
		"author": author-> {
			name,
			company,
			"image": reform::image(image)
		},
		"categories": categories[]->title,
		"related": *[
			_type == "page" && kind == "blogPost" && _id != ^._id &&
			count((categories[]->title)[@ in ^.^.categories[]->title]) > 0
		] | order(publishedAt desc) [0...3] ${articleCardProjection},
		"recent": *[_type == "page" && kind == "blogPost" && _id != ^._id]
			| order(publishedAt desc) [0...3] ${articleCardProjection}
	}
`)
