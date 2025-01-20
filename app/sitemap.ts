import { globby } from "globby"
import { siteURL } from "library/siteURL"
import type { MetadataRoute } from "next"
import { defineQuery } from "next-sanity"
import { route } from "nextjs-routes"
import { sanityFetch } from "sanity/lib/live"

const sitemapPageQuery = defineQuery(`
	*[_type == "page" && defined(slug.current) && !(noIndex == true)]
	{"slug": slug.current}
`)

const sitemapBlogQuery = defineQuery(`
    *[_type == "post" && defined(slug.current)]{"slug": slug.current, "categories": categories}
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
	const { data: blogPosts } = await sanityFetch({ query: sitemapBlogQuery })

	const allCategories = new Set(
		blogPosts.flatMap((category) => category.categories),
	)

	const sitemap = [
		...remappedPages,
		...sanityPages.map((page) =>
			page.slug
				? route({
						pathname: "/[slug]",
						query: { slug: page.slug === "home" ? "" : page.slug },
					})
				: [],
		),
		...blogPosts.flatMap((item) =>
			item.slug
				? route({
						pathname: "/blog/post/[slug]",
						query: { slug: item.slug },
					})
				: [],
		),
		...Array.from(allCategories).map((category) =>
			category
				? route({ pathname: "/blog/category/[category]", query: { category } })
				: [],
		),
	]
		.filter((page) => typeof page === "string")
		.map((page) => `${siteURL}${page}`)

	return sitemap.map((page) => ({
		url: page,
	}))
}
