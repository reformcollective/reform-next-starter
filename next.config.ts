import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"
import { serverSiteURL } from "./app/library/siteURL/determine"

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
})

const nextConfig: NextConfig = {
	redirects: async () => [
		{ source: "/home", destination: "/", permanent: false },
	],

	experimental: {
		reactCompiler: { panicThreshold: "ALL_ERRORS" },
		viewTransition: true,
	},
	env: {
		// Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
		SC_DISABLE_SPEEDY: "false",
		NEXT_PUBLIC_DEPLOY_URL: serverSiteURL,
	},
	//Don't think this will hurt anything, but not sure if needed.
	typedRoutes: true,

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

export default withBundleAnalyzer(nextConfig)
