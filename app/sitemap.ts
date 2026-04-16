import { globSync } from "node:fs"
import { siteURL } from "library/siteURL"
import type { MetadataRoute } from "next"
import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"

const sitemapPageQuery = defineQuery(`
  *[_type == "page" && defined(slug.current) && !(noIndex == true)]
  {"slug": slug.current}
`)

const sitemapBlogQuery = defineQuery(`
  *[_type == "blog1Post" && defined(slug.current)]
  {"slug": slug.current}
`)

const sitemapBlogHubQuery = defineQuery(`
  *[_type == "blog1Hub"][0] {
    "slug": slug.current,
    noIndex
  }
`)

interface SanityPage {
	slug: string | null
}
interface BlogPost {
	slug: string | null
}

function stripRouteGroupsAndFile(path: string) {
	// remove leading app/ and split
	const rel = path.replace(/^app\//, "")
	const parts = rel.split("/").filter(Boolean)

	// drop route groups exactly
	const noGroups = parts.filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")))

	// drop the final file segment (page.tsx)
	const noFile = noGroups.filter((seg) => seg !== "page.tsx")

	// turn segments back into a route
	return `/${noFile.join("/")}`
}

function normalizePath(path: string) {
	let normalizedPath = path.startsWith("/") ? path : `/${path}`
	// collapse multiple slashes
	normalizedPath = normalizedPath.replace(/\/{2,}/g, "/")
	// remove trailing slash except root
	if (normalizedPath.length > 1 && normalizedPath.endsWith("/"))
		normalizedPath = normalizedPath.slice(0, -1)
	return normalizedPath
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// 1) File-based routes (exclude blog-1 — its URL is driven by the Sanity hub slug)
	const pages = globSync("app/**/page.tsx")
	const fileRoutes = pages
		// skip dynamic routes like [slug], [[...slug]]
		.filter((p) => !/\[.+\]/.test(p))
		.map(stripRouteGroupsAndFile)
		.map(normalizePath)

	// 2) CMS routes
	const [{ data: sanityPages }, { data: blogPosts }, { data: blogHub }] = await Promise.all([
		sanityFetch({ query: sitemapPageQuery }),
		sanityFetch({ query: sitemapBlogQuery }),
		sanityFetch({ query: sitemapBlogHubQuery }),
	])

	const hubSlug = blogHub?.slug ?? "blog-1"

	const cmsRoutes = [
		...sanityPages.map((p: SanityPage) => normalizePath(p.slug === "home" ? "/" : `/${p.slug}`)),
		...(blogHub?.noIndex ? [] : [normalizePath(`/${hubSlug}`)]),
		...blogPosts.map((p: BlogPost) => normalizePath(`/${hubSlug}/${p.slug}`)),
	]

	// 3) Combine, dedupe, and build absolute URLs safely
	const allPaths = Array.from(new Set([...fileRoutes, ...cmsRoutes]))

	return allPaths.map((path) => ({
		url: new URL(path, siteURL).toString(),
	}))
}
