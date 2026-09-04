import { documentPathProjection } from "sanity/lib/slug-resolver"

const articleCardFields = `{
	_id,
	title,
	"path": ${documentPathProjection("@")},
	"author": author->name,
	articleTextPreview,
	"mainImage": reform::image(mainImage),
	"categories": categories[]->title,
	publishedAt,
	readTime
}` as const

export const blogHubProjection = `_type == "blogHub" => {
	searchMode,
	"featuredPost": featuredPost-> ${articleCardFields}
}` as const

export const articleCardProjection = articleCardFields
