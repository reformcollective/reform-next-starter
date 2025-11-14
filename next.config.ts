import type { NextConfig } from "next"
import { serverSiteURL } from "./app/library/siteURL/determine"
import { withVanillaSplit } from "./app/library/vanilla/withVanillaSplit"

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_DEPLOY_URL: serverSiteURL,
	},

	cacheComponents: true,
	redirects: async () => [
		{ source: "/home", destination: "/", permanent: false },
	],
	reactCompiler: { panicThreshold: "all_errors" },
	experimental: { viewTransition: true },
	turbopack: {
		rules: {
			"*.inline.svg": {
				loaders: [
					{
						loader: "@svgr/webpack",
						options: {
							ssr: true,
						},
					},
				],

				as: "*.js",
			},
		},
	},
}

export default withVanillaSplit(nextConfig)
