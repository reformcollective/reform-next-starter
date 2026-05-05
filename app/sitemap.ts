import type { MetadataRoute } from "next"

import { listStaticRoutes } from "library/list-pages"
import { siteURL } from "library/siteURL"
import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"
import { documentPathProjection } from "sanity/lib/slug-resolver"

const sitemapCmsQuery = defineQuery(`
  *[
    (
      _type == "page" &&
      defined(slug.current) &&
      !(noIndex == true)
    ) ||
    (
      _type == "blog1Hub" &&
      defined(slug.current) &&
      !(noIndex == true)
    ) ||
    (
      _type == "blog1Post" &&
      defined(slug.current)
    )
  ] {
    "path": ${documentPathProjection("@")}
  }
`)

interface SitemapDocument {
	path: string | null
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// 1) File-based static routes
	const fileRoutes = await listStaticRoutes()

	// 2) CMS routes
	const { data: cmsDocuments } = await sanityFetch({ query: sitemapCmsQuery })
	const cmsRoutes = cmsDocuments
		.map((document: SitemapDocument) => document.path)
		.filter((path): path is string => Boolean(path))

	// 3) Combine, dedupe, and build absolute URLs safely
	const allPaths = Array.from(new Set([...fileRoutes, ...cmsRoutes]))

	return allPaths.map((path) => ({
		url: new URL(path, siteURL).toString(),
	}))
}
