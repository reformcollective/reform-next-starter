import type { NextConfig } from "next"
import { serverSiteURL } from "./app/library/siteURL/determine"

const nextConfig: NextConfig = {
	redirects: async () => [
		{ source: "/home", destination: "/", permanent: false },
	],
	reactCompiler: { panicThreshold: "all_errors" },
	experimental: {
		viewTransition: true,
	},
	env: {
		NEXT_PUBLIC_DEPLOY_URL: serverSiteURL,
	},

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

export default nextConfig
