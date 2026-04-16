import type { AllPostsServerQueryResult } from "./sanity.types"

// Manually augment SanityQueries for queries that groq-js cannot type-infer,
// such as those using `match` expressions with runtime parameters.
declare module "@sanity/client" {
	interface SanityQueries {
		'\n\t*[_type == "blog1Post" && [title, pt::text(body)] match $searchQuery] | order(publishedAt desc) {\n\t\t_id,\n\t\ttitle,\n\t\t"slug": slug.current,\n\t\t"author": author->name,\n\t\tarticleTextPreview,\n\t\tmainImage {\n\t\t\t...,\n\t\t\t"data": {\n\t\t\t\t"lqip": asset->metadata.lqip,\n\t\t\t\t"aspectRatio": asset->metadata.dimensions.aspectRatio\n\t\t\t}\n\t\t},\n\t\t"categories": categories[]->title,\n\t\tpublishedAt\n\t}\n': AllPostsServerQueryResult
	}
}
