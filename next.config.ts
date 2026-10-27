import type { NextConfig } from "next"

import { withVanillaSplit } from "./library/vanilla/withVanillaSplit"

const nextConfig: NextConfig = {
	redirects: async () => [{ source: "/home", destination: "/", permanent: false }],

	// type-aware linting checks this separately from next build
	typescript: { ignoreBuildErrors: true },

	images: {
		qualities: [90],
	},

	// enable react compiler, error when a file can't be compiled
	reactCompiler: { panicThreshold: "all_errors" },

	experimental: {
		// the vanilla split loader writes virtual files Turbopack doesn't track, so a restored
		// build cache serves stale styled exports ("Export X doesn't exist in target module")
		turbopackFileSystemCacheForBuild: false,
	},

	turbopack: {
		rules: {
			// importing inline SVGs as React components
			// SVGs not caught by this rule will be imported using next image (raster)
			"*.inline.svg": {
				loaders: [{ loader: "@svgr/webpack", options: { ssr: true } }],
				as: "*.js",
			},
		},
	},
}

export default withVanillaSplit(nextConfig)
