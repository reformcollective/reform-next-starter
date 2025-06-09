import { globby } from "globby"
import { siteURL } from "library/siteURL"
import type { MetadataRoute } from "next"
import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"

const sitemapPageQuery = defineQuery(`
	*[_type == "page" && defined(slug.current) && !(noIndex == true)]
	{"slug": slug.current}
`)

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

	const sitemap = [
		...remappedPages,
		...sanityPages.map((page) => (page.slug === "home" ? "" : `/${page.slug}`)),
	]
		.filter((page) => typeof page === "string")
		.map((page) => `${siteURL}${page}`)

	return sitemap.map((page) => ({
		url: page,
	}))
}
