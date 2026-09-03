export const blogArticleProjection = `_type == "blogArticle" => {
	"pageMainImage": reform::image(^.mainImage),
	body[] {
		...,
		_type == "image" => reform::image(@),
		_type == "video" => reform::video(@)
	}
}` as const
