import type { NextConfig } from "next"
import nextRoutes from "nextjs-routes/config"
const withRoutes = nextRoutes({
	outDir: "app/types",
})

const nextConfig: NextConfig = {
	// use the homepage as a CMS page by rewriting the slug
	rewrites: async () => [{ source: "/", destination: "/home" }],
	redirects: async () => [
		{ source: "/home", destination: "/", permanent: false },
	],

	experimental: {
		reactCompiler: true,
	},
	env: {
		// Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
		SC_DISABLE_SPEEDY: "false",
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
			test: /\.svg$/,
			resourceQuery: { not: [/inline/] },
			loader: "next-image-loader",
			options: loaderOptions,
		})

		return config
	},
}

export default withRoutes(nextConfig)
