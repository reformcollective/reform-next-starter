/**
 * Seeds the `videoTestCase` fixtures read by /visual-tests/universal-video: one document per
 * source, mode, trigger, carousel, Safari, poster and analytics case. Every document has a fixed
 * `_id`, so re-running replaces rather than duplicates, and it leaves anything it did not create
 * alone.
 *
 * Mux cases reference the starter dataset's existing `mux.videoAsset` documents by id, and the
 * uploaded-poster case references the baseline photo asset, so against a different dataset those
 * documents are created but their media does not resolve. Every other source uses a public URL.
 *
 * Requires an editor-scoped token in SANITY_SEED_TOKEN.
 *
 *   node --env-file=.env --experimental-strip-types scripts/seed-video-tests.ts --dry-run
 *   node --env-file=.env --experimental-strip-types scripts/seed-video-tests.ts
 */

import { createClient, type Transaction } from "@sanity/client"

const MUX_UNTAGGED = "00dcym00XaHxqy7BJMgsjIe01trdJH8VIzWfBJqoffRd02o"
const MUX_TAGGED = "D3F3013ZPTNNKNY1e02ctl02z02IAw7lRyARzgryAFyPXXU"

const MUX_ASSET_IDS: Record<string, string> = {
	[MUX_TAGGED]: "05d43c1c-d443-443d-a22f-60e21d1e041d",
	[MUX_UNTAGGED]: "f6f97e10-d994-42d4-81c6-84683b9f5c0f",
}

const PHOTO = "image-61add4858baf2a430ce3ea35698733fc9e87ff0e-3376x2252-jpg"

const FILE_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
const HLS_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"

const dryRun = process.argv.includes("--dry-run")

const token = process.env.SANITY_SEED_TOKEN
if (!token && !dryRun) {
	console.error("SANITY_SEED_TOKEN is required to write. Add it to .env, or pass --dry-run.")
	process.exit(1)
}

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
	apiVersion: "2025-12-11",
	useCdn: false,
	token,
})

type Scenario =
	| "source"
	| "mode"
	| "trigger"
	| "carousel"
	| "safari"
	| "poster"
	| "analytics"
	| "regression"

interface TestCase {
	key: string
	scenario: Scenario
	title: string
	note: string
	video: Record<string, unknown>
}

const mux = (playbackId: string, extra: Record<string, unknown> = {}) => ({
	_type: "video",
	sourceType: "mux",
	muxVideo: {
		_type: "mux.video",
		asset: { _type: "reference", _ref: MUX_ASSET_IDS[playbackId] },
	},
	...extra,
})

const url = (value: string, extra: Record<string, unknown> = {}) => ({
	_type: "video",
	sourceType: "url",
	url: value,
	...extra,
})

const provider = (sourceType: string, value: string, extra: Record<string, unknown> = {}) => ({
	_type: "video",
	sourceType,
	url: value,
	...extra,
})

const STALE_YOUTUBE_THUMBNAIL = {
	url: "https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
	width: 1280,
	height: 720,
	provider: "youtube",
	fetchedAt: "2026-10-27T00:00:00.000Z",
}

const cases: TestCase[] = [
	{
		key: "source-file",
		scenario: "source",
		title: "File (MP4)",
		note: "Plain MP4 through the file adapter. Native controls are replaced by ours; seek, volume and rate should all work.",
		video: url(FILE_URL, { mode: "click", controls: "ours", title: "Flower (MP4)" }),
	},
	{
		key: "source-hls",
		scenario: "source",
		title: "File (HLS)",
		note: "An .m3u8 URL: loads hls.js once, quality menu should appear.",
		video: url(HLS_URL, { mode: "click", controls: "ours", title: "Big Buck Bunny (HLS)" }),
	},
	{
		key: "source-mux",
		scenario: "source",
		title: "Mux (untagged asset)",
		note: "Dataset Mux asset through the Sanity reference path. Public playback ID.",
		video: mux(MUX_UNTAGGED, { mode: "click", controls: "ours", title: "Mux asset" }),
	},
	{
		key: "source-youtube",
		scenario: "source",
		title: "YouTube",
		note: "Facade first, iframe on click. Controls placement is always below. Privacy (nocookie) on.",
		video: provider("youtube", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", {
			mode: "click",
			privacy: true,
			title: "Big Buck Bunny (YouTube)",
		}),
	},
	{
		key: "source-vimeo",
		scenario: "source",
		title: "Vimeo",
		note: "Vimeo embed with do-not-track. Background, rate and quality may need a paid plan.",
		video: provider("vimeo", "https://vimeo.com/1084537", {
			mode: "click",
			privacy: true,
			title: "Vimeo sample",
		}),
	},
	{
		key: "source-vimeo-dead",
		scenario: "source",
		title: "Vimeo (dead URL)",
		note: "Error path: the video is unavailable. Expect a visible error message with no throw.",
		video: provider("vimeo", "https://vimeo.com/9999999999", {
			mode: "click",
			title: "Dead Vimeo",
		}),
	},
	{
		key: "source-wistia",
		scenario: "source",
		title: "Wistia",
		note: "Wistia embed through the media-element adapter.",
		video: provider("wistia", "https://fast.wistia.com/embed/medias/e4a27b971d", {
			mode: "click",
			title: "Wistia sample",
		}),
	},
	{
		key: "source-wistia-invalid",
		scenario: "source",
		title: "Wistia (invalid ID)",
		note: "Invalid Wistia ID must not throw; expect an error state.",
		video: provider("wistia", "https://home.wistia.com/medias/invalid0000", {
			mode: "click",
			title: "Invalid Wistia",
		}),
	},
	{
		key: "source-cloudflare",
		scenario: "source",
		title: "Cloudflare Stream",
		note: "Cloudflare Stream demo video.",
		video: provider(
			"cloudflare",
			"https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
			{ mode: "click", title: "Cloudflare sample" },
		),
	},
	{
		key: "source-twitch",
		scenario: "source",
		title: "Twitch",
		note: "Needs the parent domain (this host). No loop, no playback rate; may show offline.",
		video: provider("twitch", "https://www.twitch.tv/monstercat", {
			mode: "click",
			title: "Twitch channel",
		}),
	},
	{
		key: "source-tiktok",
		scenario: "source",
		title: "TikTok",
		note: "No volume control, no start time, no poster; per-domain limits apply.",
		video: provider("tiktok", "https://www.tiktok.com/@scout2015/video/6718335390845095173", {
			mode: "click",
			title: "TikTok sample",
		}),
	},
	{
		key: "source-spotify",
		scenario: "source",
		title: "Spotify",
		note: "Audio embed: no volume, mute, loop or autoplay. Preview only without a logged-in session.",
		video: provider("spotify", "https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5", {
			mode: "click",
			title: "Spotify episode",
		}),
	},
	{
		key: "mode-background",
		scenario: "mode",
		title: "Background",
		note: "Muted loop, no controls, a single pause button. Plays when in view, pauses when out.",
		video: mux(MUX_UNTAGGED, { mode: "background", loop: true, muted: true, controls: "none" }),
	},
	{
		key: "mode-autoplay",
		scenario: "mode",
		title: "Autoplay",
		note: "Muted autoplay when in view with controls shown. Unmute is a user gesture.",
		video: url(FILE_URL, {
			mode: "autoplay",
			muted: true,
			controls: "ours",
			title: "Autoplay flower",
		}),
	},
	{
		key: "mode-click-facade",
		scenario: "mode",
		title: "Click with facade",
		note: "Poster plus play overlay; nothing loads until the click. Network panel should show no player assets before it.",
		video: provider("youtube", "https://www.youtube.com/watch?v=jNQXAC9IVRw", {
			mode: "click",
			title: "Me at the zoo",
		}),
	},
	{
		key: "mode-main-content",
		scenario: "mode",
		title: "Main content with JSON-LD",
		note: "Eager player and a VideoObject JSON-LD script in the server HTML. Only one per page.",
		video: mux(MUX_UNTAGGED, {
			mode: "click",
			controls: "ours",
			mainContent: true,
			title: "Main content video",
			jsonLd: {
				description: "A Mux test asset used to verify VideoObject structured data.",
				uploadDate: "2026-10-27",
				duration: "PT10S",
				creatorName: "Reform",
			},
		}),
	},
	{
		key: "trigger-inview",
		scenario: "trigger",
		title: "Built-in inView trigger",
		note: "Plays on entering view, pauses on leaving. A manual pause makes the trigger step aside.",
		video: url(FILE_URL, { mode: "autoplay", muted: true, loop: true, controls: "ours" }),
	},
	{
		key: "trigger-gsap",
		scenario: "trigger",
		title: "GSAP ScrollTrigger driving the controller",
		note: "trigger={false}; a ScrollTrigger calls play and pause on the handle. Every call is manual control.",
		video: url(FILE_URL, { mode: "autoplay", muted: true, loop: true, controls: "ours" }),
	},
	{
		key: "trigger-hook",
		scenario: "trigger",
		title: "IntersectionObserver driving useVideo",
		note: "A child component outside the compound parts drives the controller through useVideo.",
		video: url(FILE_URL, { mode: "click", muted: true, loop: true, controls: "none" }),
	},
	{
		key: "carousel-clone",
		scenario: "carousel",
		title: "Carousel with cloned slides",
		note: "Twelve slides clone one playback ID. The concurrency cap holds, offscreen clones load nothing, and unmounting leaves no stats behind.",
		video: mux(MUX_UNTAGGED, { mode: "background", loop: true, muted: true, controls: "none" }),
	},
	{
		key: "safari-hidden",
		scenario: "safari",
		title: "Safari hidden video",
		note: "Background video hidden and shown by display, visibility and offscreen transform. It must paint within a second of becoming visible.",
		video: mux(MUX_UNTAGGED, { mode: "background", loop: true, muted: true, controls: "none" }),
	},
	{
		key: "poster-uploaded",
		scenario: "poster",
		title: "Uploaded poster",
		note: "An uploaded poster wins over any automatic one and is never blurred.",
		video: mux(MUX_UNTAGGED, {
			mode: "click",
			controls: "ours",
			posterImage: { _type: "image", asset: { _type: "reference", _ref: PHOTO } },
		}),
	},
	{
		key: "poster-mux-tagged",
		scenario: "poster",
		title: "Mux tagged asset",
		note: "Tagged colors (bt709 tv): Mux thumbnail should match the video frame.",
		video: mux(MUX_TAGGED, { mode: "click", controls: "ours" }),
	},
	{
		key: "poster-mux-untagged",
		scenario: "poster",
		title: "Mux untagged asset",
		note: "Untagged colors: the Mux thumbnail can look lighter than the video. Compare the poster, the first frame and the thumbnail.",
		video: mux(MUX_UNTAGGED, { mode: "click", controls: "ours" }),
	},
	{
		key: "poster-first-frame",
		scenario: "poster",
		title: "Non-hero Mux first frame",
		note: "No uploaded poster and not a hero: the video's own first frame is shown.",
		video: mux(MUX_UNTAGGED, { mode: "click", controls: "ours" }),
	},
	{
		key: "poster-lcp-hero",
		scenario: "poster",
		title: "LCP hero without poster",
		note: "priority hero with no uploaded poster: dev warning, eager poster, crossfade to the video.",
		video: mux(MUX_UNTAGGED, { mode: "background", loop: true, muted: true, controls: "none" }),
	},
	{
		key: "poster-iframe-thumbnail",
		scenario: "poster",
		title: "Iframe thumbnail (404 case)",
		note: "jNQXAC9IVRw has no maxres thumbnail; the poster must fall back instead of showing a placeholder.",
		video: provider("youtube", "https://www.youtube.com/watch?v=jNQXAC9IVRw", {
			mode: "click",
			title: "Me at the zoo",
		}),
	},
	{
		key: "analytics-file",
		scenario: "analytics",
		title: "Analytics on a file",
		note: "Start, pause, progress at 10/25/50/75 and complete land in the dataLayer stub once each.",
		video: url(FILE_URL, { mode: "click", controls: "ours", title: "Analytics flower" }),
	},
	{
		key: "analytics-youtube",
		scenario: "analytics",
		title: "Analytics on YouTube",
		note: "Same events from an iframe provider. With GA4 enhanced measurement on, YouTube also double counts.",
		video: provider("youtube", "https://www.youtube.com/watch?v=aqz-KE-bpKQ", {
			mode: "click",
			title: "Analytics YouTube",
		}),
	},
	{
		key: "regression-stale-thumb-twitch",
		scenario: "regression",
		title: "Stale YouTube thumbnail on a Twitch source",
		note: "video.thumbnail was stored by the youtube provider but sourceType is twitch (the editor switched sources). The poster must not show that thumbnail.",
		video: provider("twitch", "https://www.twitch.tv/monstercat", {
			mode: "click",
			title: "Twitch with stale thumbnail",
			thumbnail: STALE_YOUTUBE_THUMBNAIL,
		}),
	},
	{
		key: "regression-stale-thumb-tiktok",
		scenario: "regression",
		title: "Stale YouTube thumbnail on a TikTok source",
		note: "Same as the Twitch case, for TikTok: the stored thumbnail belongs to another provider and must be ignored.",
		video: provider("tiktok", "https://www.tiktok.com/@scout2015/video/6718335390845095173", {
			mode: "click",
			title: "TikTok with stale thumbnail",
			thumbnail: STALE_YOUTUBE_THUMBNAIL,
		}),
	},
]

async function main() {
	console.log(
		`${dryRun ? "DRY RUN: nothing will be written" : "WRITING"} to dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}"\n`,
	)

	const documents = cases.map((testCase, index) => ({
		_id: `video-test-${testCase.key}`,
		_type: "videoTestCase",
		title: testCase.title,
		key: testCase.key,
		scenario: testCase.scenario,
		note: testCase.note,
		order: index,
		video: testCase.video,
	}))

	for (const document of documents) {
		console.log(`${document.scenario.padEnd(10)} ${document._id}`)
	}

	if (dryRun) {
		console.log(`\n${documents.length} documents would be created or replaced.`)
		return
	}

	const transaction: Transaction = client.transaction()
	for (const document of documents) transaction.createOrReplace(document)
	await transaction.commit()
	console.log(`\n${documents.length} documents written.`)
}

main().catch((error: unknown) => {
	console.error(error)
	process.exit(1)
})
