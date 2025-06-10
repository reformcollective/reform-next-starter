import { client } from "@/sanity/lib/client"
import { token } from "@/sanity/lib/token"
import { defineLive } from "next-sanity"

// Define SanityLive locally with correct properties
const { sanityFetch, SanityLive: InternalLive } = defineLive({
	client,
	serverToken: token,
	browserToken: token,
})

// Export what's needed
export { sanityFetch }
export default InternalLive
