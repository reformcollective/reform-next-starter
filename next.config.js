const bundleAnalyzer = require("@next/bundle-analyzer")

const PORT = process.env.PORT || 3000
const isVercel = process.env.VERCEL === "1"
const isNetlify = process.env.NETLIFY === "true"

const netlifyURL = isNetlify
	? process.env.HEAD === "main"
		? process.env.URL
		: process.env.DEPLOY_URL
	: null

const vercelURL = isVercel
	? process.env.VERCEL_GIT_COMMIT_REF === "main"
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: `https://${process.env.VERCEL_URL}`
	: null

const serverSiteURL = vercelURL || netlifyURL || `http://localhost:${PORT}`

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
})

const nextConfig = {
	redirects: async () => [
		{ source: "/home", destination: "/", permanent: false },
	],

	experimental: {
		reactCompiler: { panicThreshold: "ALL_ERRORS" },
		viewTransition: true,
	},
	env: {
		SC_DISABLE_SPEEDY: "false",
		NEXT_PUBLIC_DEPLOY_URL: serverSiteURL,
	},
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

module.exports = withBundleAnalyzer(nextConfig)
