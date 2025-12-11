import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  turbopack: {
    // turbopack must be able to resolve packages from pnpm's global store
    root: "/",
  },

  // we check types manually using tsgo
  typescript: { ignoreBuildErrors: true },

  experimental: {
    // enable filesystem caching for build and dev
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
