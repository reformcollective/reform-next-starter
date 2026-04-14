import type { AllPostsQueryResult, BlogHubQueryResult, SinglePostQueryResult } from "sanity.types"

// Individual post card — used on list pages, related posts, recent posts
export type Card = AllPostsQueryResult[number]

// Featured post on the hub page
export type FeaturedCard = NonNullable<NonNullable<BlogHubQueryResult>["featuredPost"]>

// Full single post
export type Post = NonNullable<SinglePostQueryResult>

// Author from single post
export type PostAuthor = NonNullable<Post["author"]>

// Body block union
export type BlogBodyBlock = NonNullable<Post["body"]>[number]

// Convenience aliases
export type RecentPost = Card
export type RecentPosts = Card[]
