import { globby } from "globby"
import { sanityFetch } from "sanity/lib/live"
import type { MetadataRoute } from "next"
import { defineQuery } from "next-sanity"

export const siteURL =
	// netlify branch URL
	process.env.DEPLOY_PRIME_URL ??
	// netlify production URL
	process.env.URL ??
	// vercel URL
	process.env.VERCEL_URL ??
	// localhost fallback
	"http://localhost:3000"

if (process.env.NODE_ENV === "production" && siteURL.includes("localhost")) {
	console.warn(
		"sitemap depends on NETLIFY or VERCEL environment variables, which are not present.",
	)
}

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