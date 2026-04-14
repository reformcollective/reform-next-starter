import type { DeepAssetMeta } from "library/sanity/assetMetadata"
import type { SanityImageData } from "library/sanity/SanityImage"
import type { Video } from "sanity.types"

type SanityImage = SanityImageData<"css", "false">

// Blog body block types matching blockContentType schema
type ImageBodyBlock = SanityImageData<"css", "false"> & { _type: "image"; _key?: string }
type VideoBodyBlock = DeepAssetMeta<Video> & { _type: "video"; _key?: string }
type BlockquoteBlock = {
	_type: "blockquoteWithAttribution"
	_key?: string
	description?: string | null
	authorName?: string | null
	authorTitle?: string | null
}
type TextBlock = {
	_type: "block"
	_key?: string
	style?: "normal" | "h1" | "h2" | "blockquote"
	listItem?: "bullet"
	markDefs?: Array<{ _type: string; href?: string }> | null
}
export type BlogBodyBlock = ImageBodyBlock | VideoBodyBlock | BlockquoteBlock | TextBlock

// Base post shape returned by allPostsQuery / blogHubQuery
export type RawCard = {
	_id: string
	title: string | null
	slug: string | null
	author: string | null
	articleTextPreview: string | null
	mainImage: SanityImage | null
	categories: (string | null)[] | null
	publishedAt: string | null
	readTime: string | null
}

// Author shape returned by singlePostQuery
export type RawAuthor = {
	name: string | null
	company: string | null
	image: SanityImage | null
}

// Full post shape returned by singlePostQuery
export type RawPost = Omit<RawCard, "author"> & {
	author: RawAuthor | null
	body: BlogBodyBlock[] | null
	relatedPosts: RawCard[]
	recentPosts: RawCard[]
}

export type Post = DeepAssetMeta<RawPost>
export type RecentPosts = DeepAssetMeta<RawCard>[]
export type RecentPost = DeepAssetMeta<RawCard>
export type Card = DeepAssetMeta<RawCard>
export type FeaturedCard = DeepAssetMeta<RawCard>
