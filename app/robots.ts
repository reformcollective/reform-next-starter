import type { MetadataRoute } from "next"

import { siteURL } from "library/siteURL"

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${siteURL}/sitemap.xml`,
	}
}
