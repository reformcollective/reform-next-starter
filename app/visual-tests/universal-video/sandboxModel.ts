import type { VideoField } from "library/sanity/assetMetadata"
import type { VideoChapter, VideoLabels, VideoMode, VideoProvider } from "library/videos/types"

import { supports, type VideoFeature } from "library/videos/capabilities"

import type { ExampleProps } from "./Frame"

export type TriggerChoice = "default" | "off" | "custom"
export type ControlsChoice = "ours" | "provider" | "none"
export type PosterChoice = "default" | "uploaded" | "cleared"
export type FacadeChoice = "auto" | "on" | "off"
export type AnalyticsChoice = "default" | "on" | "off"
export type PlayChoice = "unset" | "play" | "pause"
export type AspectChoice = "auto" | "16/9" | "4/3" | "1/1" | "9/16"
export type PlacementChoice = "overlay" | "below"
export type LabelsChoice = "default" | "german"
export type PreferPlayback = "default" | "mse" | "native"
export type MaxResolution = "default" | "720p" | "1080p"

export interface Options {
	preset: string
	custom: string
	mode: VideoMode
	muted: boolean
	loop: boolean
	play: PlayChoice
	startTime: number
	endTime: number
	trigger: TriggerChoice
	threshold: number
	once: boolean
	pauseWhenOut: boolean
	showPause: boolean
	controls: ControlsChoice
	placement: PlacementChoice
	captions: boolean
	chapters: boolean
	facade: FacadeChoice
	priority: boolean
	eager: boolean
	loadMargin: string
	poster: PosterChoice
	posterTimeOn: boolean
	posterTime: number
	aspect: AspectChoice
	mainContent: boolean
	privacy: boolean
	label: string
	labels: LabelsChoice
	analytics: AnalyticsChoice
	blockTracking: boolean
	muxData: boolean
	maxResolution: MaxResolution
	preferPlayback: PreferPlayback
}

export const DEFAULT_OPTIONS: Options = {
	preset: "fixture",
	custom: "",
	mode: "click",
	muted: false,
	loop: false,
	play: "unset",
	startTime: 0,
	endTime: 0,
	trigger: "default",
	threshold: 0.25,
	once: false,
	pauseWhenOut: true,
	showPause: true,
	controls: "ours",
	placement: "overlay",
	captions: false,
	chapters: false,
	facade: "auto",
	priority: false,
	eager: false,
	loadMargin: "",
	poster: "default",
	posterTimeOn: false,
	posterTime: 1,
	aspect: "16/9",
	mainContent: false,
	privacy: true,
	label: "",
	labels: "default",
	analytics: "default",
	blockTracking: false,
	muxData: false,
	maxResolution: "default",
	preferPlayback: "default",
}

export const GERMAN: VideoLabels = {
	play: "Abspielen",
	pause: "Pausieren",
	mute: "Stummschalten",
	unmute: "Ton einschalten",
	volume: "Lautstärke",
	seek: "Suchen",
	fullscreen: "Vollbild",
	exitFullscreen: "Vollbild beenden",
	captions: "Untertitel",
	captionsOff: "Untertitel aus",
	playbackRate: "Wiedergabegeschwindigkeit",
	quality: "Qualität",
	audioTrack: "Tonspur",
	chapters: "Kapitel",
	pictureInPicture: "Bild-in-Bild",
	cast: "Übertragen",
	loading: "Wird geladen",
	retry: "Erneut versuchen",
	errorGeneric: "Dieses Video konnte nicht abgespielt werden.",
	playOverlay: "Video abspielen",
	live: "Live",
}

const SAMPLE_CHAPTERS: VideoChapter[] = [
	{ startTime: 0, title: "Start" },
	{ startTime: 3, title: "Middle" },
	{ startTime: 6, title: "End" },
]

const FILE_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
const HLS_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
const MUX_ID = "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe"
const MUX_TAGGED = "D3F3013ZPTNNKNY1e02ctl02z02IAw7lRyARzgryAFyPXXU"
const MUX_UNTAGGED = "00dcym00XaHxqy7BJMgsjIe01trdJH8VIzWfBJqoffRd02o"

interface Preset {
	id: string
	label: string
	/** Seeded videoTestCase key, loaded through the real Sanity video object. */
	caseKey?: string
	src?: string
	playbackId?: string
	note: string
	expectError?: boolean
	staleThumbnailHost?: string
}

export interface SandboxDef {
	id: string
	title: string
	/** Label on the source switcher. */
	short: string
	/** Preset id every scenario uses unless it asks for the error source. */
	main: string
	/** Preset id that must fail to load, or undefined when the source has no reliable failing input. */
	error?: string
	provider: VideoProvider
	summary: string
	presets: Preset[]
	custom: "url" | "playbackId"
	customHint: string
	initial: Partial<Options>
}

export const SANDBOXES: SandboxDef[] = [
	{
		id: "file",
		short: "MP4",
		main: "fixture",
		error: "bad",
		title: "File (MP4)",
		provider: "file",
		summary:
			"Plain MP4 through the file adapter. Ours replaces native controls; seek, volume and rate should all work.",
		presets: [
			{
				id: "fixture",
				label: "Seeded fixture (Sanity url)",
				caseKey: "source-file",
				note: "source-file",
			},
			{ id: "raw", label: "Plain src prop", src: FILE_URL, note: "MDN flower.mp4 passed as src." },
			{
				id: "bad",
				label: "404 URL (error state)",
				src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/does-not-exist.mp4",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "url",
		customHint: "https://example.com/video.mp4",
		initial: {},
	},
	{
		id: "hls",
		short: "HLS",
		main: "fixture",
		error: "bad",
		title: "HLS (.m3u8)",
		provider: "file",
		summary: "An .m3u8 URL loads hls.js once; the quality menu should appear.",
		presets: [
			{
				id: "fixture",
				label: "Seeded fixture (Sanity url)",
				caseKey: "source-hls",
				note: "source-hls",
			},
			{ id: "raw", label: "Plain src prop", src: HLS_URL, note: "Mux test stream passed as src." },
			{
				id: "bad",
				label: "404 playlist (error state)",
				src: "https://test-streams.mux.dev/x36xhzz/does-not-exist.m3u8",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "url",
		customHint: "https://example.com/stream.m3u8",
		initial: {},
	},
	{
		id: "mux",
		short: "Mux",
		main: "fixture",
		error: "bad",
		title: "Mux",
		provider: "mux",
		summary:
			"Playback ID path and Sanity asset path. The tagged and untagged assets compare poster color against the real frame.",
		presets: [
			{
				id: "fixture",
				label: "Sanity asset (untagged)",
				caseKey: "source-mux",
				note: "source-mux, reference to a dataset mux.videoAsset.",
			},
			{
				id: "tagged",
				label: "Sanity asset (tagged colors)",
				caseKey: "poster-mux-tagged",
				note: "Tagged bt709: the Mux thumbnail should match the frame.",
			},
			{
				id: "demo",
				label: "Playback ID DS00Spx1CV...",
				playbackId: MUX_ID,
				note: "134 s asset that fades up from black; try posterTime 0 versus 1.",
			},
			{
				id: "raw-tagged",
				label: "Playback ID (tagged)",
				playbackId: MUX_TAGGED,
				note: "Plain playbackId prop.",
			},
			{
				id: "raw-untagged",
				label: "Playback ID (untagged)",
				playbackId: MUX_UNTAGGED,
				note: "Plain playbackId prop.",
			},
			{
				id: "bad",
				label: "Invalid playback ID (error state)",
				playbackId: "invalidplaybackid0000000000000000",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "playbackId",
		customHint: "Mux public playback ID",
		initial: { preset: "demo" },
	},
	{
		id: "youtube",
		short: "YouTube",
		main: "fixture",
		error: "bad",
		title: "YouTube",
		provider: "youtube",
		summary: "Facade first, iframe on click. Controls are always placed below the player.",
		presets: [
			{ id: "fixture", label: "Seeded fixture", caseKey: "source-youtube", note: "source-youtube" },
			{
				id: "no-maxres",
				label: "No maxres thumbnail (Me at the zoo)",
				caseKey: "poster-iframe-thumbnail",
				note: "The poster must fall back instead of showing a placeholder.",
			},
			{
				id: "raw",
				label: "Plain src prop",
				src: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
				note: "Big Buck Bunny passed as src.",
			},
			{
				id: "bad",
				label: "Unknown video ID (error state)",
				src: "https://www.youtube.com/watch?v=ZZZZZZZZZZZ",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "url",
		customHint: "https://www.youtube.com/watch?v=...",
		initial: {},
	},
	{
		id: "vimeo",
		short: "Vimeo",
		main: "raw",
		error: "bad",
		title: "Vimeo",
		provider: "vimeo",
		summary:
			"Do-not-track embed. Background, rate and quality may need a paid plan. Unlisted videos need the hash in the URL (vimeo.com/ID/HASH or ?h=HASH).",
		presets: [
			{
				id: "raw",
				label: "Plain src prop (Big Buck Bunny)",
				src: "https://vimeo.com/1084537",
				note: "Verified public video (oEmbed returns 200).",
			},
			{
				id: "fixture",
				label: "Seeded fixture (video removed, 404)",
				caseKey: "source-vimeo",
				note: "source-vimeo points at vimeo.com/347119375, which now 404s. The seed needs a new URL.",
			},
			{
				id: "dead",
				label: "Dead fixture (error state)",
				caseKey: "source-vimeo-dead",
				note: "Expect a visible error, exactly one alert, no throw.",
				expectError: true,
			},
			{
				id: "bad",
				label: "404 URL (error state)",
				src: "https://vimeo.com/9999999999",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "url",
		customHint: "https://vimeo.com/ID or https://vimeo.com/ID/HASH",
		initial: {},
	},
	{
		id: "wistia",
		short: "Wistia",
		main: "fixture",
		error: "bad",
		title: "Wistia",
		provider: "wistia",
		summary: "Wistia embed through the media-element adapter.",
		presets: [
			{ id: "fixture", label: "Seeded fixture", caseKey: "source-wistia", note: "source-wistia" },
			{
				id: "invalid",
				label: "Invalid ID (error state)",
				caseKey: "source-wistia-invalid",
				note: "Must not throw; expect an error state.",
				expectError: true,
			},
			{
				id: "raw",
				label: "Plain src prop",
				src: "https://fast.wistia.com/embed/medias/e4a27b971d",
				note: "Wistia sample passed as src.",
			},
			{
				id: "bad",
				label: "Invalid ID (error state)",
				src: "https://home.wistia.com/medias/invalid0000",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "url",
		customHint: "https://fast.wistia.com/embed/medias/ID",
		initial: {},
	},
	{
		id: "cloudflare",
		short: "Cloudflare",
		main: "fixture",
		error: "bad",
		title: "Cloudflare Stream",
		provider: "cloudflare",
		summary:
			"Needs the full Stream URL including the customer code. Start time and default captions are read only at load; mobile autoplay is generally unsupported.",
		presets: [
			{
				id: "fixture",
				label: "Seeded fixture",
				caseKey: "source-cloudflare",
				note: "source-cloudflare",
			},
			{
				id: "raw",
				label: "Plain src prop",
				src: "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
				note: "Cloudflare demo video passed as src.",
			},
			{
				id: "bad",
				label: "Unknown video ID (error state)",
				src: "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/00000000000000000000000000000000/watch",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "url",
		customHint: "https://customer-CODE.cloudflarestream.com/ID/watch",
		initial: {},
	},
	{
		id: "twitch",
		short: "Twitch",
		main: "fixture",
		title: "Twitch",
		provider: "twitch",
		summary:
			"The embed parent is this page's hostname. No loop, no playback rate, no background mode; a channel may be offline. Use a /videos/ID URL for a video.",
		presets: [
			{
				id: "vod",
				label: "Recorded video (VOD)",
				src: "https://www.twitch.tv/videos/106400740",
				note: "Twitch VOD from the Video.js docs; unverified, old recordings can be deleted. A live channel stays offline and never plays.",
			},
			{
				id: "fixture",
				label: "Channel (seeded fixture)",
				caseKey: "source-twitch",
				note: "source-twitch, a channel.",
			},
			{
				id: "stale",
				label: "Stale YouTube thumbnail on a Twitch source",
				caseKey: "regression-stale-thumb-twitch",
				note: "The poster must not show the stored YouTube thumbnail.",
				staleThumbnailHost: "ytimg.com",
			},
			{
				id: "raw",
				label: "Channel (plain src prop)",
				src: "https://www.twitch.tv/monstercat",
				note: "Plain src prop.",
			},
		],
		custom: "url",
		customHint: "https://www.twitch.tv/CHANNEL or https://www.twitch.tv/videos/ID",
		initial: {},
	},
	{
		id: "tiktok",
		short: "TikTok",
		main: "fixture",
		error: "bad",
		title: "TikTok",
		provider: "tiktok",
		summary:
			"No volume control, no start time, no automatic poster; per-domain limits apply. Loop is set at load only.",
		presets: [
			{ id: "fixture", label: "Seeded fixture", caseKey: "source-tiktok", note: "source-tiktok" },
			{
				id: "stale",
				label: "Stale YouTube thumbnail on a TikTok source",
				caseKey: "regression-stale-thumb-tiktok",
				note: "The stored thumbnail belongs to another provider and must be ignored.",
				staleThumbnailHost: "ytimg.com",
			},
			{
				id: "raw",
				label: "Plain src prop",
				src: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
				note: "Plain src prop.",
			},
			{
				id: "bad",
				label: "Unknown video ID (error state)",
				src: "https://www.tiktok.com/@scout2015/video/1",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "url",
		customHint: "https://www.tiktok.com/@user/video/ID (full URL, no short links)",
		initial: { aspect: "9/16" },
	},
	{
		id: "spotify",
		short: "Spotify",
		main: "fixture",
		error: "bad",
		title: "Spotify",
		provider: "spotify",
		summary:
			"Audio-first embed: no mute, volume, loop, autoplay or background. Previews only without login. Switch the entity type with the presets.",
		presets: [
			{
				id: "fixture",
				label: "Episode (seeded fixture)",
				caseKey: "source-spotify",
				note: "source-spotify, a podcast episode.",
			},
			{
				id: "track",
				label: "Track",
				src: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
				note: "Plain src prop, track.",
			},
			{
				id: "playlist",
				label: "Playlist",
				src: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
				note: "Plain src prop, playlist.",
			},
			{
				id: "bad",
				label: "Unknown track ID (error state)",
				src: "https://open.spotify.com/track/0000000000000000000000",
				note: "A source that does not exist: expect an error message.",
				expectError: true,
			},
		],
		custom: "url",
		customHint: "https://open.spotify.com/track|album|playlist|episode|show/ID",
		initial: { aspect: "auto" },
	},
]

export const BLANK_VIDEO: VideoField = { _type: "video", muxVideo: null, posterImage: null }

const blockTracking = () => false

export function can(provider: VideoProvider, feature: VideoFeature) {
	return supports(provider, feature) !== "no"
}

export function aspectNumber(aspect: AspectChoice) {
	if (aspect === "auto") return undefined
	const [width, height] = aspect.split("/").map(Number)
	return width && height ? width / height : undefined
}

export function analyticsTitle(id: string) {
	return `Sandbox ${id}`
}

interface BuiltProps {
	/** Options that remount the video when they change. */
	load: ExampleProps
	/** Options the controller applies without a remount. */
	live: ExampleProps
}

export function buildProps(options: Options, def: SandboxDef): BuiltProps {
	const provider = def.provider
	const ours = options.controls === "ours"
	const triggerCustom = {
		threshold: options.threshold,
		once: options.once,
		pauseWhenOut: options.pauseWhenOut,
	}
	let trigger: ExampleProps["trigger"]
	if (options.trigger === "off") trigger = false
	else if (options.trigger === "custom") trigger = triggerCustom

	let controls: ExampleProps["controls"] = true
	if (options.controls === "provider") controls = "provider"
	else if (options.controls === "none") controls = false

	let facade: ExampleProps["facade"] = "auto"
	if (options.facade === "on") facade = true
	else if (options.facade === "off") facade = false

	let analytics: ExampleProps["analytics"]
	if (options.analytics === "on")
		analytics = { progress: [10, 25, 50, 75], title: analyticsTitle(def.id) }
	else if (options.analytics === "off") analytics = false

	const placementApplies = ours && provider !== "youtube" && provider !== "spotify"
	const muxOptions: NonNullable<ExampleProps["mux"]> = {}
	if (options.maxResolution !== "default") muxOptions.maxResolution = options.maxResolution
	if (options.preferPlayback !== "default") muxOptions.preferPlayback = options.preferPlayback
	const hasMuxOptions = Object.keys(muxOptions).length > 0

	const load: ExampleProps = {
		mode: options.mode,
		controls,
		trigger,
		facade,
		priority: options.priority,
		eager: options.eager,
		loadMargin: options.loadMargin || undefined,
		aspectRatio: aspectNumber(options.aspect),
		mainContent: options.mainContent,
		label: options.label || undefined,
		labels: options.labels === "german" ? GERMAN : undefined,
		analytics,
		canTrack: options.blockTracking ? blockTracking : undefined,
		controlsPlacement: placementApplies ? options.placement : undefined,
		privacy: can(provider, "privacy") ? options.privacy : undefined,
		captions: can(provider, "captions") && options.captions ? "on" : undefined,
		chapters: can(provider, "chapters") && options.chapters ? SAMPLE_CHAPTERS : undefined,
		posterTime: provider === "mux" && options.posterTimeOn ? options.posterTime : undefined,
		muxData: provider === "mux" ? options.muxData : undefined,
		mux: provider === "mux" && hasMuxOptions ? muxOptions : undefined,
	}

	let play: boolean | undefined
	if (options.play === "play") play = true
	else if (options.play === "pause") play = false

	const live: ExampleProps = {
		muted: can(provider, "muted") ? options.muted : undefined,
		loop: can(provider, "loop") ? options.loop : undefined,
		play,
		startTime: can(provider, "startTime") && options.startTime > 0 ? options.startTime : undefined,
		endTime: can(provider, "endTime") && options.endTime > 0 ? options.endTime : undefined,
		showPause: options.mode === "background" ? options.showPause : undefined,
	}

	return { load, live }
}
