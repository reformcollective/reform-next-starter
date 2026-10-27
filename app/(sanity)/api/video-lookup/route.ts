import { siteURL } from "library/siteURL"
import { lookupCopy, parseLookupTarget, runLookup } from "library/videos/server/lookup"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }

function fail(message: string, status: number) {
	return Response.json({ error: message }, { status, headers: NO_STORE })
}

export async function GET(request: Request) {
	if (request.headers.get("sec-fetch-site") !== "same-origin") return fail("Forbidden", 403)

	const params = new URL(request.url).searchParams
	const kind = params.get("kind")
	if (kind !== "poster" && kind !== "meta" && kind !== "copy") return fail("Invalid kind", 400)

	const target = parseLookupTarget({
		provider: params.get("provider"),
		id: params.get("id"),
		hash: params.get("hash"),
		customerCode: params.get("customerCode"),
	})
	if (!target) return fail("Invalid provider or id", 400)

	const context = { siteURL, signal: request.signal }

	if (kind === "copy") {
		const copy = await lookupCopy(target, context)
		if ("error" in copy) return fail(copy.error, copy.status)
		return new Response(new Uint8Array(copy.bytes), {
			headers: { ...NO_STORE, "Content-Type": copy.contentType },
		})
	}

	const result = await runLookup(target, { ...context, want: kind })
	return Response.json(result, { headers: NO_STORE })
}
