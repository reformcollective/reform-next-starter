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
		reactCompiler: {
			panicThreshold: "ALL_ERRORS",
		},
		viewTransition: true,
	},
	env: {
		// Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
		SC_DISABLE_SPEEDY: "false",
		NEXT_PUBLIC_DEPLOY_URL: serverSiteURL,
	},

	turbopack: {
		rules: {
			"*.inline.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
			"*.svg": {
				loaders: [
					{
						loader: require.resolve("./app/library/svg.js"),
						options: {},
					},
				],
				as: "*.js",
			},
		},
	},
	webpack(config) {
		// biome-ignore lint/suspicious/noExplicitAny: webpack moment
		const { options: loaderOptions } = config.module.rules.find((rule: any) =>
			rule?.test?.test?.(".svg"),
		)
		config.module.rules.push({
			test: /\.svg$/,
			use: ["@svgr/webpack"],
			resourceQuery: /inline/,
		})
		config.module.rules.push({
			test: /\.inline\.svg$/,
			use: ["@svgr/webpack"],
		})
		config.module.rules.push({
			test: /\.svg$/,
			resourceQuery: { not: [/inline/] },
			exclude: /\.inline\.svg$/,
			loader: "next-image-loader",
			options: loaderOptions,
		})

		return config
	},
}

export default withBundleAnalyzer(nextConfig)
