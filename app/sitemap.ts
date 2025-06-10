import { globby } from "globby"
import { siteURL } from "library/siteURL"
import type { MetadataRoute } from "next"
import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"

const sitemapPageQuery = defineQuery(`
	*[_type == "page" && defined(slug.current) && !(noIndex == true)]
	{"slug": slug.current}
`)

const sitemapBlogQuery = defineQuery(`
    *[_type == "post" && defined(slug.current)]{"slug": slug.current, "categories": categories}
`)

interface SanityPage {
	slug: string | null
}

interface BlogPost {
	slug: string | null
	categories: string[] | null
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const pages = await globby(["**/page.tsx"])

	const filteredPages = pages.filter((page) => !page.includes("["))
	const remappedPages = filteredPages
		.map((page) =>
			page
				.replaceAll(/^app\//g, "")
				.replaceAll(/\/\([a-zA-Z0-9_-]*\)/g, "")
				.replaceAll(/\/page\.tsx/g, ""),
		)
		.map((page) => `/${page}`)

	const { data: sanityPages } = await sanityFetch({ query: sitemapPageQuery })
	const { data: blogPosts } = await sanityFetch({ query: sitemapBlogQuery })

	const sitemap: string[] = [
		...remappedPages,
		...sanityPages.map((page: SanityPage) =>
			page.slug === "home" ? "" : `/${page.slug}`,
		),
		...blogPosts.map((post: BlogPost) =>
			post.slug === "home" ? "" : `/blog/${post.slug}`,
		),
	]
		.filter((page): page is string => typeof page === "string")
		.map((page: string) => `${siteURL}${page}`)

	return sitemap.map((page) => ({
		url: page,
	}))
}
