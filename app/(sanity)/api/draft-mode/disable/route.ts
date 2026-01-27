import { disableDraftMode } from "library/sanity/disableDraftMode"

export async function GET() {
	await disableDraftMode()
	return Response.json({ message: "Draft mode disabled" }, { status: 200 })
}
