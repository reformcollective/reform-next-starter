export const siteURL =
	// netlify branch URL
	process.env.DEPLOY_PRIME_URL ??
	// netlify production URL
	process.env.URL ??
	// vercel URL
	process.env.VERCEL_URL ??
	// localhost fallback
	"http://localhost:3000"

if (process.env.NODE_ENV === "production" && siteURL.includes("localhost")) {
	console.warn(
		"sitemap depends on NETLIFY or VERCEL environment variables, which are not present.",
	)
}
