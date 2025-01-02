import { globby } from "globby"
import type { MetadataRoute } from "next"
import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"
import { siteURL } from "utils/site-url"

const sitemapPageQuery = defineQuery(`
	*[_type == "page" && defined(slug.current)]
	{"slug": slug.current}
`)

const sitemapBlogQuery = defineQuery(`
    *[_type == "post" && defined(slug.current)]{"slug": slug.current}
`)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const pages = await globby(["**/page.tsx"])

	const filteredPages = pages.filter((page) => !page.includes("["))

	const remappedPages = filteredPages.map((page) =>
		page
			.replaceAll(/^app\//g, "")
			.replaceAll(/\/\([a-zA-Z0-9_-]*\)/g, "")
			.replaceAll(/\/page\.tsx/g, ""),
	)

	const { data: sanityPages } = await sanityFetch({ query: sitemapPageQuery })
	const { data: blogArticles } = await sanityFetch({ query: sitemapBlogQuery })

	const sitemap = [
		...remappedPages,
		...sanityPages.map((page) => (page.slug === "home" ? "" : page.slug)),
		...blogArticles.map((item) => `blog/${item.slug}`),
	]
		.filter((page) => typeof page === "string")
		.map((page) => `${siteURL}/${page}`)

	return sitemap.map((page) => ({
		url: page,
	}))
}
