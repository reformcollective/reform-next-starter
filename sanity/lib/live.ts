import { type QueryParams } from "next-sanity"
import { defineLive, resolvePerspectiveFromCookies, type LivePerspective } from "next-sanity/live"
import { cookies, draftMode } from "next/headers"
import { client } from "sanity/lib/client"
import { token } from "sanity/lib/token"

export interface DynamicFetchOptions {
	perspective: LivePerspective
	stega: boolean
	isDraftMode: boolean
}

export const { sanityFetch, SanityLive } = defineLive({
	client,
	serverToken: token,
	browserToken: token,
	strict: true,
})

export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
	const { isEnabled: isDraftMode } = await draftMode()
	if (!isDraftMode) {
		return { perspective: "published", stega: false, isDraftMode }
	}

	const jar = await cookies()
	const perspective = await resolvePerspectiveFromCookies({ cookies: jar })
	return { perspective: perspective ?? "drafts", stega: true, isDraftMode }
}

export async function sanityFetchStaticParams<const QueryString extends string>({
	query,
	params = {},
}: {
	query: QueryString
	params?: QueryParams
}) {
	return client.fetch(query, params, {
		perspective: "published",
		stega: false,
		useCdn: true,
	})
}

export default SanityLive
