export const blogArticleProjection = `_type == "blogArticle" => {
	body[] {
		...,
		_type == "image" => reform::image(@),
		_type == "video" => reform::video(@)
	}
}` as const
