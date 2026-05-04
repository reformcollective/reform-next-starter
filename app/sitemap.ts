import { listStaticRoutes, normalizeRoutePath } from "library/list-pages"
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// 1) File-based routes (exclude blog-1 — its URL is driven by the Sanity hub slug)
	const fileRoutes = await listStaticRoutes()

	// 2) CMS routes
	const [{ data: sanityPages }, { data: blogPosts }, { data: blogHub }] = await Promise.all([
		sanityFetch({ query: sitemapPageQuery }),
		sanityFetch({ query: sitemapBlogQuery }),
		sanityFetch({ query: sitemapBlogHubQuery }),
	])

	const hubSlug = blogHub?.slug ?? "blog-1"

	const cmsRoutes = [
		...sanityPages.map((p: SanityPage) =>
			normalizeRoutePath(p.slug === "home" ? "/" : `/${p.slug}`),
		),
		...(blogHub?.noIndex ? [] : [normalizeRoutePath(`/${hubSlug}`)]),
		...blogPosts.map((p: BlogPost) => normalizeRoutePath(`/${hubSlug}/${p.slug}`)),
	]

	// 3) Combine, dedupe, and build absolute URLs safely
	const allPaths = Array.from(new Set([...fileRoutes, ...cmsRoutes]))

	return allPaths.map((path) => ({
		url: new URL(path, siteURL).toString(),
	}))
}
