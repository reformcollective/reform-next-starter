import type { UniversalVideoHandle, VideoState } from "library/videos/types"

import { DEFAULT_LABELS } from "library/videos/parts"
import { getVideoDebugStats } from "library/videos/UniversalVideo"
import { useEffect, useState } from "react"

import { useDomProbe, useHandleState } from "./Checks"

const STATS_INTERVAL_MS = 500
const SETTLE_MS = 2000
const REENTER_MS = 2500
const IN_VIEW = 0.5
const WRAP_DROP_SECONDS = 0.5
const WINDOW_START_TOLERANCE = 0.8
const RATIO_STEPS = [0, 0.1, 0.25, 0.5, 0.75, 1]

const CONTROL_LABELS: string[] = [
	DEFAULT_LABELS.mute,
	DEFAULT_LABELS.unmute,
	DEFAULT_LABELS.volume,
	DEFAULT_LABELS.seek,
	DEFAULT_LABELS.fullscreen,
	DEFAULT_LABELS.exitFullscreen,
	DEFAULT_LABELS.pictureInPicture,
	DEFAULT_LABELS.cast,
	DEFAULT_LABELS.playbackRate,
	DEFAULT_LABELS.quality,
	DEFAULT_LABELS.captions,
]

/** What the checks can see in the DOM under the video container. */
export function readScenarioProbe(element: HTMLElement) {
	const labels = Array.from(
		element.querySelectorAll("[aria-label]"),
		(node) => node.getAttribute("aria-label") ?? "",
	)
	const images = Array.from(element.querySelectorAll("img"))
	const video = element.querySelector("video")
	const buttons = Array.from(element.querySelectorAll("button"))
	return {
		hasVideo: video !== null,
		nativeControls: video ? video.controls : false,
		images: images.length,
		imagesLoaded: images.filter((image) => image.complete && image.naturalWidth > 0).length,
		imagePriority: images.some((image) => image.fetchPriority === "high"),
		imageEager: images.length > 0 && images.every((image) => image.loading !== "lazy"),
		preloadLinks: document.head.querySelectorAll('link[rel="preload"][as="image"]').length,
		controlButtons: labels.filter((label) => CONTROL_LABELS.includes(label)).length,
		playPauseButtons: labels.filter(
			(label) => label === DEFAULT_LABELS.play || label === DEFAULT_LABELS.pause,
		).length,
		overlayPlay: labels.includes(DEFAULT_LABELS.playOverlay),
		retryButton: buttons.some(
			(button) =>
				button.textContent.trim() === DEFAULT_LABELS.retry ||
				button.getAttribute("aria-label") === DEFAULT_LABELS.retry,
		),
		alerts: element.querySelectorAll('[role="alert"]').length,
		statuses: element.querySelectorAll('[role="status"]').length,
		height: element.getBoundingClientRect().height,
		text: element.textContent,
	}
}

export type ScenarioProbe = ReturnType<typeof readScenarioProbe>

/** Facts accumulated over time since the video mounted. */
export interface Acc {
	everPlaying: boolean
	firstPlayingTime: number | null
	playMax: number
	lastPlayTime: number | null
	wraps: number
	afterWrapMin: number | null
	belowStart: boolean
	everInView: boolean
	playedBeforeEnter: boolean
	playedInView: boolean
	pausedOut: boolean
	resumedOnReenter: boolean
	triggerPlayed: boolean
	posterSeen: boolean
	posterPriority: boolean
	posterEager: boolean
	sawError: boolean
	leftError: boolean
	sawMuted: boolean
	sawUnmuted: boolean
	sawPausedAfterPlay: boolean
	ended: boolean
}

export const INITIAL_ACC: Acc = {
	everPlaying: false,
	firstPlayingTime: null,
	playMax: 0,
	lastPlayTime: null,
	wraps: 0,
	afterWrapMin: null,
	belowStart: false,
	everInView: false,
	playedBeforeEnter: false,
	playedInView: false,
	pausedOut: false,
	resumedOnReenter: false,
	triggerPlayed: false,
	posterSeen: false,
	posterPriority: false,
	posterEager: false,
	sawError: false,
	leftError: false,
	sawMuted: false,
	sawUnmuted: false,
	sawPausedAfterPlay: false,
	ended: false,
}

/** What the carousel stage measured across all mounted slides, repeated copies included. Positions index the rendered items in DOM order. */
export interface CarouselScene {
	kind: "carousel"
	slides: number
	items: number
	/** Items at least 60% inside the viewport and the strip. */
	visible: number[]
	playing: number[]
	/** Items that kept playing for over a second while not visible. */
	offenders: number[]
	/** Offenders in the repeated copies beyond the first set of slides. */
	cloneOffenders: number[]
	everPlayed: boolean
	/** Times a different slide became the only one playing. */
	handovers: number
	/** Most play starts any single real slide has had. 2 or more means it played again after returning. */
	maxStarts: number
	mountedNow: number
	slotsNow: number
	peakSlots: number
	rejections: number
	/** Index of the centred slide that is meant to play, null before the first measurement. */
	activeIndex: number | null
	/** Measurements (every 100 ms) where a visible slide showed neither its poster nor a painted video frame. */
	popIns: number
	/** Times a slide started or stopped playing again within a second of its last change. */
	rapidToggles: number
	/** Longest time from a slide becoming the centred one to its first painted frame while playing, ms. */
	maxTtff: number
	ttffLimit: number
	/** Most players playing at the same moment. */
	peakPlaying: number
	/** Longest unbroken time more than one player played, ms. */
	overlapMs: number
	/** Visible slides that were not playing yet and had no poster showing. */
	neighborsPosterless: number
	cycle: {
		running: boolean
		done: number
		total: number
		/** Mounted instances after half the slide changes, null until then. */
		atHalf: number | null
		/** Mounted instances once the run finished, null until then. */
		atEnd: number | null
		peakMounted: number
		finished: boolean
	}
}

/** What the sticky-cover stage measured about the video and the block covering it. */
export interface StickyScene {
	kind: "sticky"
	driver: "builtin" | "controller"
	/** Share of the video covered by the cover block, 0 to 1. */
	coverage: number
	/** Share of the video inside the viewport, which is all the IntersectionObserver can see. */
	geometric: number
	coveredMs: number
	/** Ms from full coverage until playback stopped in the current covered stretch, null while still playing. */
	pauseLagMs: number | null
	/** Longest unbroken time it played while fully covered, after a grace period for scroll smoothing and the trigger to react. */
	maxCoveredPlayMs: number
	overlapSeen: boolean
	revealedSeen: boolean
	playedRevealed: boolean
	pausedWhenCoveredAgain: boolean
}

export type Scene = CarouselScene | StickyScene

/** Everything a scenario expectation can look at. */
export interface Observed {
	/** Measurements from a scenario's own stage (carousel, sticky cover), or null for the single-video stage. */
	scene: Scene | null
	handle: UniversalVideoHandle | null
	state: VideoState | null
	/** Share of the video container inside the viewport, 0 to 1. */
	ratio: number
	acc: Acc
	probe: ScenarioProbe | null
	stats: ReturnType<typeof getVideoDebugStats>
	/** Two seconds have passed since the video mounted. */
	settled: boolean
	/** The video has been back in view for a while after leaving it. */
	reenterHeld: boolean
}

function advance(
	prev: Acc,
	state: VideoState | null,
	ratio: number,
	posterLoaded: boolean,
	posterPriority: boolean,
	posterEager: boolean,
): Acc {
	if (!state) return prev
	const next: Acc = { ...prev }
	const playing = state.status === "playing"
	const inView = ratio >= IN_VIEW
	const out = ratio === 0
	if (inView) next.everInView = true
	if (!playing && posterLoaded && !next.everPlaying) {
		next.posterSeen = true
		if (posterPriority) next.posterPriority = true
		if (posterEager) next.posterEager = true
	}
	if (playing) {
		const time = state.currentTime
		if (next.firstPlayingTime === null) next.firstPlayingTime = time
		else if (time < WINDOW_START_TOLERANCE) next.belowStart = true
		if (prev.lastPlayTime !== null && time < prev.lastPlayTime - WRAP_DROP_SECONDS) {
			next.wraps += 1
			next.afterWrapMin = time
		} else if (next.afterWrapMin !== null) next.afterWrapMin = Math.min(next.afterWrapMin, time)
		next.playMax = Math.max(next.playMax, time)
		next.lastPlayTime = time
		next.everPlaying = true
		if (inView) next.playedInView = true
		if (out && !next.everInView) next.playedBeforeEnter = true
		if (next.pausedOut && inView) next.resumedOnReenter = true
		if (state.wantedOrigin === "trigger") next.triggerPlayed = true
	} else {
		next.lastPlayTime = null
		if (next.playedInView && out) next.pausedOut = true
		if (state.status === "paused" && next.everPlaying) next.sawPausedAfterPlay = true
	}
	if (state.status === "error") next.sawError = true
	else if (next.sawError) next.leftError = true
	if (state.muted) next.sawMuted = true
	else next.sawUnmuted = true
	if (state.status === "ended") next.ended = true
	for (const key of Object.keys(next) as (keyof Acc)[]) {
		if (next[key] !== prev[key]) return next
	}
	return prev
}

/** Live state, DOM probe, viewport ratio and accumulated history of one mounted video. Resets when the handle changes. */
export function useObserved(handle: UniversalVideoHandle | null, scene: Scene | null): Observed {
	const state = useHandleState(handle)
	const container = handle ? handle.container : null
	const probe = useDomProbe(container, readScenarioProbe)
	const [ratio, setRatio] = useState(0)
	const [acc, setAcc] = useState<Acc>(INITIAL_ACC)
	const [settled, setSettled] = useState(false)
	const [reenterHeld, setReenterHeld] = useState(false)
	const [stats, setStats] = useState(getVideoDebugStats)

	useEffect(() => {
		const timer = setInterval(() => setStats(getVideoDebugStats()), STATS_INTERVAL_MS)
		return () => clearInterval(timer)
	}, [])

	useEffect(() => {
		setAcc(INITIAL_ACC)
		setSettled(false)
		setReenterHeld(false)
		if (!handle) return
		const timer = setTimeout(() => setSettled(true), SETTLE_MS)
		return () => clearTimeout(timer)
	}, [handle])

	useEffect(() => {
		if (!container) return
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) setRatio(entry.intersectionRatio)
			},
			{ threshold: RATIO_STEPS },
		)
		observer.observe(container)
		return () => observer.disconnect()
	}, [container])

	const posterLoaded = probe ? probe.imagesLoaded > 0 : false
	const posterPriority = probe ? probe.imagePriority : false
	const posterEager = probe ? probe.imageEager : false
	useEffect(() => {
		setAcc((previous) => advance(previous, state, ratio, posterLoaded, posterPriority, posterEager))
	}, [state, ratio, posterLoaded, posterPriority, posterEager])

	const held = acc.pausedOut && ratio >= IN_VIEW
	useEffect(() => {
		if (!held) {
			setReenterHeld(false)
			return
		}
		const timer = setTimeout(() => setReenterHeld(true), REENTER_MS)
		return () => clearTimeout(timer)
	}, [held])

	return { scene, handle, state, ratio, acc, probe, stats, settled, reenterHeld }
}
