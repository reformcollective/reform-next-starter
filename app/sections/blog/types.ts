import type { GetSectionType } from "page"
import type { ArticleContextQueryResult, HubArticlesQueryResult } from "sanity.types"

// Individual post card — used on list pages, related posts, recent posts
export type Card = HubArticlesQueryResult[number]

// Featured post on the hub page
export type FeaturedCard = NonNullable<GetSectionType<"blogHub">["featuredPost"]>

// Everything an article needs that lives outside its own document
export type ArticleContext = NonNullable<ArticleContextQueryResult>

// Author from an article's context
export type PostAuthor = NonNullable<ArticleContext["author"]>

// Body block union
export type BlogBodyBlock = NonNullable<GetSectionType<"blogArticle">["body"]>[number]

export type RecentPosts = Card[]
