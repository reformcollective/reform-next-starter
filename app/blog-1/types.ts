import type { DeepAssetMeta } from "library/sanity/assetMetadata"
import type { SanityImageSource } from "@sanity/image-url/lib/types/types"

// Base post shape returned by allPostsQuery / blogHubQuery
export type RawCard = {
	_id: string
	title: string | null
	slug: string | null
	author: string | null
	articleTextPreview: string | null
	mainImage: SanityImageSource | null
	categories: (string | null)[] | null
	publishedAt: string | null
	readTime: string | null
}

// Author shape returned by singlePostQuery
export type RawAuthor = {
	name: string | null
	company: string | null
	image: SanityImageSource | null
}

// Full post shape returned by singlePostQuery
export type RawPost = RawCard & {
	author: RawAuthor | null
	body: unknown[] | null
	discoverCTA: Record<string, unknown> | null
	relatedPosts: RawCard[]
	recentPosts: RawCard[]
}

export type Post = DeepAssetMeta<RawPost>
export type RecentPosts = DeepAssetMeta<RawCard>[]
export type RecentPost = DeepAssetMeta<RawCard>
export type Card = DeepAssetMeta<RawCard>
export type FeaturedCard = DeepAssetMeta<RawCard>
