import "server-only"

export const token = process.env.SANITY_AUTH_TOKEN

if (!token) {
	throw new Error("Missing SANITY_AUTH_TOKEN")
}
