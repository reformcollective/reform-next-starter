import { blogArticleProjection } from "sanity/schemas/sections/projections/blogArticle"
import { blogHubProjection } from "sanity/schemas/sections/projections/blogHub"
import { sampleProjection } from "sanity/schemas/sections/projections/sample"

export const sectionProjection = `
	${sampleProjection},
	${blogHubProjection},
	${blogArticleProjection}
` as const
