import { supports, type VideoFeature } from "library/videos/capabilities"
import { DEFAULT_LABELS } from "library/videos/parts"

import type { CarouselScene, Observed, StickyScene } from "./observe"
import type { Options, SandboxDef } from "./sandboxModel"

export interface Verdict {
	status: "pass" | "fail" | "pending"
	detail?: string
}

export interface Expectation {
	label: string
	check: (observed: Observed) => Verdict
	/** Hidden when it returns false (for example checks that only make sense for a <video> element). */
	applies?: (observed: Observed) => boolean
}

/**
 * A provider-neutral test recipe. `options` is laid over the defaults, the source's own defaults and nothing else,
 * so every source runs the same scenario. The source resolves through `source`.
 */
export interface Scenario {
	id: string
	title: string
	/** One line shown on the active scenario. */
	description: string
	/** "main" uses the source's known-good input, "error" its input that must fail. */
	source: "main" | "error"
	options: Partial<Options>
	/** Features a source must support to run this scenario at all. */
	requires: VideoFeature[]
	/** Adds tall blocks above and below the video so it can scroll in and out of view. */
	spacer?: boolean
	/** Replaces the single video with a stage of its own (a looping carousel, a sticky cover). */
	stage?: "carousel" | "sticky"
	/** Sandbox source ids (the source switcher entries) that can run this scenario; every other source is greyed out. Omitted means all. */
	sources?: string[]
	/** Why the other sources cannot run it, shown on the greyed-out scenario. */
	sourcesReason?: string
	expect: Expectation[]
	notes: string
}

const PHRASES: Partial<Record<VideoFeature, string>> = {
	background: "background mode",
	hideChrome: "hidden controls",
	startTime: "start time",
	endTime: "end time",
	autoplay: "autoplay",
	loop: "loop",
	muted: "muted playback",
	error: "error reporting",
}

export interface Availability {
	state: "ok" | "best-effort" | "unavailable"
	reason?: string
}

/** Whether a source can run a scenario, using the capability matrix. */
export function availability(def: SandboxDef, scenario: Scenario): Availability {
	if (scenario.source === "error" && !def.error) {
		return { state: "unavailable", reason: `${def.short}: no reliable failing input` }
	}
	const missing: string[] = []
	const partial: string[] = []
	for (const feature of scenario.requires) {
		const support = supports(def.provider, feature)
		const phrase = PHRASES[feature] ?? feature
		if (support === "no") missing.push(phrase)
		else if (support !== "yes") partial.push(phrase)
	}
	if (missing.length > 0)
		return { state: "unavailable", reason: `${def.short}: no ${missing.join(", ")}` }
	if (partial.length > 0)
		return { state: "best-effort", reason: `${def.short}: best-effort ${partial.join(", ")}` }
	return { state: "ok" }
}

const pass = (detail?: string): Verdict => ({ status: "pass", detail })
const fail = (detail?: string): Verdict => ({ status: "fail", detail })
const pending = (detail?: string): Verdict => ({ status: "pending", detail })
const when = (condition: boolean, detail?: string): Verdict =>
	condition ? pass(detail) : fail(detail)

function statusText(observed: Observed) {
	return observed.state ? `status=${observed.state.status}` : "not mounted"
}

function playsAndAdvances(observed: Observed): Verdict {
	const { acc, state } = observed
	const progressed = acc.playMax - (acc.firstPlayingTime ?? 0)
	if (acc.everPlaying && progressed > 0.4) return pass(`t=${acc.playMax.toFixed(1)}`)
	if (state && (state.status === "error" || state.status === "blocked"))
		return fail(statusText(observed))
	return pending(`${statusText(observed)}, scroll it into view if needed`)
}

function isMuted(observed: Observed): Verdict {
	if (!observed.state) return pending("not mounted")
	return when(observed.state.muted, `muted=${String(observed.state.muted)}`)
}

function noAutoplay(observed: Observed): Verdict {
	const { acc } = observed
	if (acc.triggerPlayed) return fail("it started by itself")
	if (acc.everPlaying) return pass("only after you pressed play")
	if (observed.settled)
		return pass(`still ${observed.state ? observed.state.status : "idle"} after 2 s`)
	return pending("watching for 2 s")
}

function playsAfterPress(observed: Observed): Verdict {
	const verdict = playsAndAdvances(observed)
	if (verdict.status === "pending") return pending("press Play (poster, overlay or panel button)")
	return verdict
}

function layoutHeight(observed: Observed): Verdict {
	if (!observed.probe) return pending("not mounted")
	return when(observed.probe.height >= 100, `${Math.round(observed.probe.height)} px high`)
}

const staysPausedBeforeEntering: Expectation = {
	label: "Does not play while it is off screen",
	check: ({ acc, settled }) => {
		if (acc.playedBeforeEnter) return fail("it played before scrolling into view")
		if (acc.everInView) return pass("it was never off-screen and playing")
		return settled ? pass("still not playing off screen") : pending("watching for 2 s")
	},
}

const playsOnEnter: Expectation = {
	label: "Plays when it scrolls into view",
	check: ({ acc }) => (acc.playedInView ? pass() : pending("scroll the page down to the video")),
}

const pausesOnLeave: Expectation = {
	label: "Pauses when it scrolls out of view",
	check: ({ acc }) =>
		acc.pausedOut
			? pass()
			: pending(acc.playedInView ? "scroll it fully out of view" : "needs to play first"),
}

function carouselOf(observed: Observed): CarouselScene | null {
	return observed.scene && observed.scene.kind === "carousel" ? observed.scene : null
}

function stickyOf(observed: Observed): StickyScene | null {
	return observed.scene && observed.scene.kind === "sticky" ? observed.scene : null
}

const positions = (list: number[]) => `#${list.join(", #")}`
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`

export const SCENARIOS: Scenario[] = [
	{
		id: "background",
		title: "Background loop",
		description: "Muted looping video, no controls, only a pause button.",
		source: "main",
		options: { mode: "background", muted: true, loop: true, controls: "none", showPause: true },
		requires: ["background", "loop", "muted"],
		expect: [
			{ label: "Starts by itself and the time advances", check: playsAndAdvances },
			{ label: "Muted", check: isMuted },
			{
				label: "Loops: the time wraps back instead of ending",
				check: ({ acc }) => {
					if (acc.ended) return fail("it ended instead of looping")
					if (acc.wraps > 0) return pass(`wrapped ${acc.wraps}x`)
					return pending("waiting for a wrap (the MP4 clip is about 5 s)")
				},
			},
			{
				label: "No seek, volume, mute or fullscreen controls",
				check: ({ probe }) =>
					probe
						? when(probe.controlButtons === 0, `${probe.controlButtons} control(s)`)
						: pending(),
			},
			{
				label: "A pause button is shown",
				check: ({ probe }) =>
					probe
						? when(probe.playPauseButtons > 0, `${probe.playPauseButtons} button(s)`)
						: pending(),
			},
		],
		notes:
			"Background mode forces muted, loop and no controls. The pause button is the only control. flower.mp4 is about 5 s, so the loop shows within seconds.",
	},
	{
		id: "autoplay",
		title: "Autoplay with controls",
		description: "Muted autoplay that starts in view, with the full control set.",
		source: "main",
		options: { mode: "autoplay", muted: true, controls: "ours" },
		requires: ["autoplay", "muted"],
		expect: [
			{ label: "Starts by itself and the time advances", check: playsAndAdvances },
			{ label: "Muted", check: isMuted },
			{
				label: "Play, mute and fullscreen controls are rendered",
				check: ({ probe }) =>
					probe
						? when(
								probe.controlButtons > 0 && probe.playPauseButtons > 0,
								`${probe.controlButtons} control(s)`,
							)
						: pending(),
			},
		],
		notes:
			"Autoplay is always muted. Browsers may block it on some pages; a blocked state counts as a failure here.",
	},
	{
		id: "click-poster",
		title: "Click to play, uploaded poster",
		description: "Shows the uploaded poster until you press play.",
		source: "main",
		options: { mode: "click", controls: "ours", poster: "uploaded", facade: "auto" },
		requires: [],
		expect: [
			{
				label: "The uploaded poster is visible before play",
				check: ({ acc, probe }) => {
					if (acc.posterSeen)
						return pass(probe ? `${probe.imagesLoaded} image(s) loaded` : undefined)
					if (acc.everPlaying) return fail("played without ever showing a loaded poster")
					return pending("waiting for the poster to load")
				},
			},
			{ label: "Does not start by itself", check: noAutoplay },
			{ label: "Plays after you press play", check: playsAfterPress },
		],
		notes: "Needs the poster-uploaded fixture; without it the poster option falls back to nothing.",
	},
	{
		id: "click-no-poster",
		title: "Click to play, no poster",
		description: "Poster and thumbnail cleared: shows what appears before play.",
		source: "main",
		options: { mode: "click", controls: "ours", poster: "cleared" },
		requires: [],
		expect: [
			{ label: "Does not start by itself", check: noAutoplay },
			{
				label: "A play affordance is visible",
				check: ({ probe, settled }) => {
					if (!probe) return pending()
					const detail = `images=${probe.images}, video element=${String(probe.hasVideo)}`
					if (probe.overlayPlay || probe.playPauseButtons > 0) return pass(detail)
					return settled ? fail(detail) : pending(detail)
				},
			},
			{ label: "The stage is not collapsed (100 px or more)", check: layoutHeight },
			{ label: "Plays after you press play", check: playsAfterPress },
		],
		notes:
			"Providers with their own thumbnail (YouTube, Vimeo) may still show it; the cleared option only removes the stored one. MP4 shows the first frame or a blank stage.",
	},
	{
		id: "in-view",
		title: "In-view trigger",
		description: "Scroll to play on enter and pause on leave, repeatedly.",
		source: "main",
		options: {
			mode: "autoplay",
			muted: true,
			controls: "ours",
			trigger: "custom",
			threshold: 0.5,
			once: false,
			pauseWhenOut: true,
		},
		requires: ["autoplay", "muted"],
		spacer: true,
		expect: [
			staysPausedBeforeEntering,
			playsOnEnter,
			pausesOnLeave,
			{
				label: "Plays again when it scrolls back in",
				check: ({ acc }) =>
					acc.resumedOnReenter
						? pass()
						: pending(acc.pausedOut ? "scroll back up to the video" : "needs a pause first"),
			},
		],
		notes:
			"Tall blocks sit above and below the video. After switching here, scroll down to the video, then past it, then back. Trigger: threshold 0.5, once false, pauseWhenOut true.",
	},
	{
		id: "in-view-once",
		title: "In-view trigger, once",
		description: "Plays the first time it enters view, never resumes.",
		source: "main",
		options: {
			mode: "autoplay",
			muted: true,
			controls: "ours",
			trigger: "custom",
			threshold: 0.5,
			once: true,
			pauseWhenOut: true,
		},
		requires: ["autoplay", "muted"],
		spacer: true,
		expect: [
			staysPausedBeforeEntering,
			playsOnEnter,
			pausesOnLeave,
			{
				label: "Does not resume when it scrolls back in",
				check: ({ acc, reenterHeld }) => {
					if (acc.resumedOnReenter) return fail("it played again")
					if (reenterHeld) return pass("still paused 2.5 s after re-entering")
					return pending(
						acc.pausedOut ? "scroll back up to the video and wait" : "needs a pause first",
					)
				},
			},
		],
		notes:
			"Same as the in-view scenario with once true. Scroll past the video and back: it must stay paused.",
	},
	{
		id: "window",
		title: "Start and end window",
		description: "startTime 1, endTime 3, looping inside that window.",
		source: "main",
		options: {
			mode: "autoplay",
			muted: true,
			loop: true,
			controls: "ours",
			startTime: 1,
			endTime: 3,
		},
		requires: ["autoplay", "muted", "loop", "startTime", "endTime"],
		expect: [
			{
				label: "Starts at the start time (first played time 0.8 s or more)",
				check: ({ acc }) => {
					if (acc.firstPlayingTime === null) return pending()
					return when(acc.firstPlayingTime >= 0.8, `first t=${acc.firstPlayingTime.toFixed(2)}`)
				},
			},
			{
				label: "Never plays past the end time (3.5 s)",
				check: ({ acc }) => {
					if (acc.playMax > 3.5) return fail(`reached t=${acc.playMax.toFixed(2)}`)
					return acc.playMax >= 2.5
						? pass(`max t=${acc.playMax.toFixed(2)}`)
						: pending(`max t=${acc.playMax.toFixed(2)}`)
				},
			},
			{
				label: "Loops back to the start time, not to 0",
				check: ({ acc }) => {
					if (acc.wraps === 0 || acc.afterWrapMin === null)
						return pending("waiting for the first loop")
					return when(
						acc.afterWrapMin >= 0.8,
						`lowest t after the loop ${acc.afterWrapMin.toFixed(2)}`,
					)
				},
			},
			{
				label: "No frame plays before the start time (press Seek to 0 to test)",
				check: ({ acc }) => {
					if (acc.belowStart) return fail("a playing sample was before 0.8 s")
					return acc.playMax >= 2 ? pass() : pending()
				},
			},
		],
		notes:
			"flower.mp4 is only about 5 s long, so a 1 to 3 s window with loop fits. Providers apply end time with best effort.",
	},
	{
		id: "provider-controls",
		title: "Provider controls",
		description: "The provider's own chrome instead of ours.",
		source: "main",
		options: { mode: "click", controls: "provider" },
		requires: [],
		expect: [
			{
				label: "Our control bar is not rendered",
				check: ({ probe }) =>
					probe
						? when(probe.controlButtons === 0, `${probe.controlButtons} of our control(s)`)
						: pending(),
			},
			{
				label: "Native controls are on the video element",
				applies: ({ probe }) => probe !== null && probe.hasVideo,
				check: ({ probe }) => (probe ? when(probe.nativeControls) : pending()),
			},
			{ label: "Plays after you press play", check: playsAfterPress },
		],
		notes:
			"For iframe providers the chrome sits inside the iframe and cannot be inspected; look at it by eye.",
	},
	{
		id: "external-controls",
		title: "No controls, external buttons",
		description: "Controls off; drive it with the quick-action buttons.",
		source: "main",
		options: { mode: "click", controls: "none", facade: "off", eager: true },
		requires: ["hideChrome"],
		expect: [
			{
				label: "No controls are rendered on the player",
				check: ({ probe }) =>
					probe
						? when(
								probe.controlButtons === 0 && probe.playPauseButtons === 0,
								`${probe.controlButtons + probe.playPauseButtons} control(s)`,
							)
						: pending(),
			},
			{
				label: "Play (panel button) starts playback",
				check: (observed) => {
					const verdict = playsAndAdvances(observed)
					return verdict.status === "pending" ? pending("press Play in the panel") : verdict
				},
			},
			{
				label: "Pause (panel button) pauses",
				check: ({ acc }) => (acc.sawPausedAfterPlay ? pass() : pending("play, then press Pause")),
			},
			{
				label: "Mute toggle flips the muted state",
				check: ({ acc }) =>
					acc.sawMuted && acc.sawUnmuted ? pass() : pending("press Mute toggle"),
			},
		],
		notes: "Nothing on the player can be clicked, so playback only changes through the handle.",
	},
	{
		id: "hero",
		title: "Hero / LCP",
		description: "priority and eager with an uploaded poster that should be preloaded.",
		source: "main",
		options: { mode: "click", controls: "ours", priority: true, eager: true, poster: "uploaded" },
		requires: [],
		expect: [
			{
				label: "The player is mounted at once, without a click",
				check: ({ handle }) =>
					handle && handle.media !== null ? pass() : pending("no media element yet"),
			},
			{
				label: "The poster image is loaded",
				check: ({ acc, probe }) => {
					if (acc.posterSeen)
						return pass(probe ? `${probe.imagesLoaded} loaded now` : "seen before play")
					if (acc.everPlaying) return fail("played without a loaded poster being seen first")
					return pending(probe ? `${probe.images} image(s)` : undefined)
				},
			},
			{
				label: "The poster is eager with high fetch priority",
				check: ({ acc }) => {
					if (!acc.posterSeen) return pending("waiting for the poster to load")
					return when(
						acc.posterPriority && acc.posterEager,
						`priority high=${String(acc.posterPriority)}, eager=${String(acc.posterEager)}`,
					)
				},
			},
			{
				label: "Exactly one video instance is mounted (debug stats)",
				check: ({ stats }) =>
					when(
						stats.mounted === 1,
						`mounted=${stats.mounted} observers=${stats.observers} playing=${stats.playing}`,
					),
			},
		],
		notes:
			"Only one priority video should exist per page. The stats come from getVideoDebugStats and only work in dev builds.",
	},
	{
		id: "carousel",
		title: "In the site carousel (autoplay)",
		description:
			"The real InfiniteSideScroll carousel, MP4 and Mux only: three slides in view, only the centred slide plays, the rest show their poster.",
		source: "main",
		options: {
			mode: "autoplay",
			muted: true,
			loop: true,
			controls: "none",
			trigger: "off",
			poster: "uploaded",
			eager: true,
		},
		requires: ["autoplay", "muted"],
		spacer: true,
		stage: "carousel",
		sources: ["file", "mux"],
		sourcesReason:
			"Carousels support MP4 and Mux only: iframe players cannot be loaded, paused or hidden reliably inside a looping carousel",
		expect: [
			{
				label: "Only the centred slide plays, the others stay paused",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.offenders.length > 0)
						return fail(`${positions(scene.offenders)} kept playing for over 1 s while out of view`)
					if (!scene.everPlayed) return pending("waiting for the visible slide to play")
					return pass(
						`playing ${scene.playing.length > 0 ? positions(scene.playing) : "none"}, in view ${scene.visible.length > 0 ? positions(scene.visible) : "none"}`,
					)
				},
			},
			{
				label: "Repeated copies of the slides never play out of view",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.cloneOffenders.length > 0)
						return fail(`copy ${positions(scene.cloneOffenders)} played out of view`)
					return scene.everPlayed
						? pass("copies are the extra React-rendered repeats of the five slides")
						: pending()
				},
			},
			{
				label: "Next and Prev (or dragging) hand playback to the new slide",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					return scene.handovers > 0
						? pass(`${scene.handovers} hand-over(s)`)
						: pending("press Next, or drag the strip with the mouse")
				},
			},
			{
				label: "Plays again when it returns to a slide",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					return scene.maxStarts >= 2 ? pass() : pending("go to the next slide and come back")
				},
			},
			{
				label: "Only one player plays at a time (peak 1, hand-over overlap under 400 ms)",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.peakPlaying > 2 || (scene.peakPlaying === 2 && scene.overlapMs > 400))
						return fail(`peak playing=${scene.peakPlaying}, overlap ${scene.overlapMs} ms`)
					return scene.everPlayed
						? pass(`peak playing=${scene.peakPlaying}, longest overlap ${scene.overlapMs} ms`)
						: pending()
				},
			},
			{
				label:
					"No visible slide shows neither its poster nor a painted video frame (pop-in count 0)",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.popIns > 0) return fail(`${scene.popIns} blank measurement(s)`)
					return scene.everPlayed ? pass("every visible slide had a poster or a frame") : pending()
				},
			},
			{
				label: "The poster is removed only after a frame was painted while playing",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.neighborsPosterless > 0)
						return fail(`${scene.neighborsPosterless} unplayed visible slide(s) without a poster`)
					return scene.everPlayed
						? pass("slides that have not played show their poster")
						: pending()
				},
			},
			{
				label: "A slide shows its first painted frame soon after it becomes the centred one",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					if (!scene.everPlayed) return pending("waiting for the centred slide to play")
					return when(
						scene.maxTtff <= scene.ttffLimit,
						`slowest ${scene.maxTtff} ms, limit ${scene.ttffLimit} ms`,
					)
				},
			},
			{
				label: "No flapping: a slide never starts or stops again within a second",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.rapidToggles > 0) return fail(`${scene.rapidToggles} rapid toggle(s)`)
					return scene.everPlayed ? pass() : pending()
				},
			},
			{
				label: "Cycle 20 slides: mounted instances stay within the slide count and stop growing",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					const { cycle } = scene
					if (cycle.running)
						return pending(`cycling ${cycle.done}/${cycle.total}, mounted=${scene.mountedNow}`)
					if (!cycle.finished || cycle.atHalf === null || cycle.atEnd === null)
						return pending("press Cycle 20 slides")
					const detail = `half=${cycle.atHalf}, end=${cycle.atEnd}, peak=${cycle.peakMounted}, rendered=${scene.items}`
					return when(cycle.peakMounted <= scene.items && cycle.atEnd <= cycle.atHalf, detail)
				},
			},
			{
				label: "No unhandled promise rejections",
				check: (observed) => {
					const scene = carouselOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.rejections > 0) return fail(`${scene.rejections} rejection(s)`)
					return scene.everPlayed ? pass() : pending()
				},
			},
		],
		notes:
			"Uses the real library/InfiniteSideScroll (GSAP horizontalLoop) with five slides, three in view at a time (31% wide each), repeated to fill the track. Supports MP4 and Mux only; HLS and iframe players (YouTube, Vimeo, Wistia, Cloudflare, Twitch, TikTok, Spotify) cannot be loaded, paused or hidden reliably inside a looping carousel. Recipe for slides in a looping carousel: put each video inside its own fixed-width wrapper element (the Slide here, 31% of the track), never sized by UniversalVideo itself; render every slide with `eager` (the player mounts and decodes before the slide arrives), `trigger={false}` and an uploaded poster (the poster stays until the video has painted a frame while playing, so nothing pops in), then play only the centred slide with handle.playFromTrigger() and pause the rest with handle.pauseFromTrigger(). The stage picks the centred element every 100 ms and keeps the current one until another is 12 px nearer, so it does not flap at the midpoint and also follows dragging. Use Prev and Next, drag, or press Cycle 20 slides.",
	},
	{
		id: "sticky-cover",
		title: "Under a sticky section (autoplay)",
		description: "A sticky video hidden by a cover block that scrolls away to reveal it.",
		source: "main",
		options: {
			mode: "autoplay",
			muted: true,
			loop: true,
			controls: "ours",
			trigger: "custom",
			threshold: 0.5,
			once: false,
			pauseWhenOut: true,
		},
		requires: ["autoplay", "muted"],
		spacer: true,
		stage: "sticky",
		expect: [
			{
				label: "The video is inside the viewport while fully covered (the case under test)",
				check: (observed) => {
					const scene = stickyOf(observed)
					if (!scene) return pending("not mounted")
					return scene.overlapSeen
						? pass(
								`in view ${Math.round(scene.geometric * 100)}%, covered ${Math.round(scene.coverage * 100)}%`,
							)
						: pending("press Scroll to cover")
				},
			},
			{
				label: "Does not play while fully covered",
				check: (observed) => {
					const scene = stickyOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.maxCoveredPlayMs > 300) {
						const reason =
							scene.driver === "builtin"
								? "known limitation: IntersectionObserver ignores overlap, so the built-in trigger plays under the cover. "
								: ""
						return fail(
							`${reason}still playing ${seconds(scene.maxCoveredPlayMs)} after the 0.5 s grace while hidden`,
						)
					}
					return scene.coveredMs >= 3000
						? pass(
								scene.pauseLagMs === null
									? `covered ${seconds(scene.coveredMs)}`
									: `paused ${Math.round(scene.pauseLagMs)} ms after fully covered`,
							)
						: pending("stay on the cover for 3 s")
				},
			},
			{
				label: "Plays once uncovered",
				check: (observed) => {
					const scene = stickyOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.playedRevealed) return pass()
					return pending(
						scene.revealedSeen ? "uncovered but not playing yet" : "press Scroll to uncovered",
					)
				},
			},
			{
				label: "Pauses when covered again",
				check: (observed) => {
					const scene = stickyOf(observed)
					if (!scene) return pending("not mounted")
					if (scene.pausedWhenCoveredAgain) return pass()
					if (!scene.playedRevealed) return pending("needs to play uncovered first")
					return pending("press Scroll to cover and wait")
				},
			},
		],
		notes:
			"A full-viewport cover (position: relative, above) scrolls up over a video pinned with position: sticky, so the video is in the viewport the whole time but hidden. Start on the Built-in trigger tab: the library observes the video's own box with an IntersectionObserver, which ignores overlap, so it plays under the cover and the second check FAILS. That is a real limitation, not a bug in the showcase. The Recommended tab uses useVideoScrollTrigger: a GSAP ScrollTrigger on the cover plays the video once the cover's bottom edge passes 45% of the viewport and pauses it when the cover comes back or the section leaves. The hook claims the trigger, so the built-in observer stays idle for that video and the trigger prop can stay at its default; it passes. Use Scroll to cover, Scroll half uncovered and Scroll to uncovered.",
	},
	{
		id: "error",
		title: "Error state",
		description: "A source that fails: one alert, a message and a working retry.",
		source: "error",
		options: { mode: "autoplay", muted: true, controls: "ours", facade: "off", eager: true },
		requires: ["autoplay", "error"],
		expect: [
			{
				label: "Reaches the error state, never plays",
				check: ({ acc, state }) => {
					if (acc.everPlaying) return fail("it played")
					if (acc.sawError)
						return pass(
							state && state.error
								? `${String(state.error.code)} ${state.error.message}`
								: undefined,
						)
					return pending(state ? `status=${state.status}` : "not mounted")
				},
			},
			{
				label: "Exactly one role=alert",
				check: ({ state, probe }) =>
					state && state.status === "error" && probe
						? when(probe.alerts === 1, `count=${probe.alerts}`)
						: pending("waiting for the error"),
			},
			{
				label: "A visible error message",
				check: ({ state, probe }) =>
					state && state.status === "error" && probe
						? when(probe.text.includes(DEFAULT_LABELS.errorGeneric), probe.text.slice(0, 60))
						: pending("waiting for the error"),
			},
			{
				label: "At most one role=status",
				check: ({ state, probe }) =>
					state && state.status === "error" && probe
						? when(probe.statuses <= 1, `count=${probe.statuses}`)
						: pending("waiting for the error"),
			},
			{
				label: "Retry button shown (only when the error is retryable)",
				check: ({ state, probe }) => {
					if (!state || state.status !== "error" || !probe) return pending("waiting for the error")
					if (state.error && !state.error.retryable) return pass("error is not retryable")
					return when(probe.retryButton)
				},
			},
			{
				label: "Retry restarts loading (press Retry on the player or in the panel)",
				check: ({ acc }) => (acc.leftError ? pass("status left error") : pending("press Retry")),
			},
		],
		notes:
			"Each source has a known-bad input (404 URL or unknown id). Twitch has none, so this scenario is unavailable there.",
	},
]
