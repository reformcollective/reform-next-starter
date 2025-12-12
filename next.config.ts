import type { NextConfig } from "next"
import { serverSiteURL } from "./library/siteURL/determine"
import { withVanillaSplit } from "./library/vanilla/withVanillaSplit"

const nextConfig: NextConfig = {
  redirects: async () => [{ source: "/home", destination: "/", permanent: false }],

  // we check types manually using tsgo
  typescript: { ignoreBuildErrors: true },

  experimental: {
    // enable view transition support
    viewTransition: true,

    // enable filesystem caching for build and dev
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },

  env: {
    // our site's URL
    NEXT_PUBLIC_DEPLOY_URL: serverSiteURL,
  },

  // enable react compiler, error when a file can't be compiled
  reactCompiler: { panicThreshold: "all_errors" },

  turbopack: {
    // turbopack must be able to resolve packages from pnpm's global store
    root: "/",

    // importing inline SVGs as React components
    rules: {
      "*.inline.svg": {
        loaders: [{ loader: "@svgr/webpack", options: { ssr: true } }],

        as: "*.js",
      },
    },
  },
}

export default withVanillaSplit(nextConfig)
