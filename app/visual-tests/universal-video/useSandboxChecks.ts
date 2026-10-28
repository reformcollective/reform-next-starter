import type { UniversalVideoHandle, VideoLabels } from "library/videos/types"

import { DEFAULT_LABELS } from "library/videos/parts"
import { useEffect, useState } from "react"

import type { LogEntry } from "./EventLog"

import { type CheckResult, rect, useDomProbe, useHandleState } from "./Checks"
import { GERMAN } from "./sandboxModel"

const PLAY_TIMEOUT_MS = 10_000
const MIN_VISIBLE_HEIGHT = 40
const ASPECT_TOLERANCE = 0.05
const ADVANCE_SECONDS = 0.2

interface CheckInput {
	handle: UniversalVideoHandle | null
	/** The video is expected to start by itself (autoplay or background with a trigger, or play set). */
	expectPlay: boolean
	startTime: number
	expectError: boolean
	staleHost: string | undefined
	aspect: number | undefined
	oursControls: boolean
	checkPoster: boolean
	german: boolean
	captionsOn: boolean
	analyticsTitle: string | undefined
	trackingBlocked: boolean
	stubOn: boolean
	entries: LogEntry[]
}

function readProbe(element: HTMLElement) {
	const count = (selector: string) => element.querySelectorAll(selector).length
	const stage = element.firstElementChild
	const images = Array.from(element.querySelectorAll("img"))
	const labels = Array.from(
		element.querySelectorAll("[aria-label]"),
		(node) => node.getAttribute("aria-label") ?? "",
	)
	return {
		root: rect(element),
		stage: rect(stage),
		controls: rect(element.querySelector("[data-idle]")),
		iframe: rect(element.querySelector("iframe")),
		posterLoaded: images.some((image) => image.complete && image.naturalWidth > 0),
		imageSources: images.map((image) => image.currentSrc || image.src),
		labels,
		alerts: count('[role="alert"]'),
		statuses: count('[role="status"]'),
		text: element.textContent,
		fullscreen: count(
			`[aria-label="${DEFAULT_LABELS.fullscreen}"], [aria-label="${DEFAULT_LABELS.exitFullscreen}"]`,
		),
		pip: count(`[aria-label="${DEFAULT_LABELS.pictureInPicture}"]`),
		cast: count(`[aria-label="${DEFAULT_LABELS.cast}"]`),
		browserPip: document.pictureInPictureEnabled,
		browserCast: "remote" in HTMLMediaElement.prototype,
	}
}

function pick(condition: boolean | null): CheckResult["status"] {
	if (condition === null) return "pending"
	return condition ? "pass" : "fail"
}

/** pass/fail/pending results for what can be observed on one running sandbox video. */
export function useSandboxChecks(input: CheckInput): CheckResult[] {
	const { handle } = input
	const state = useHandleState(handle)
	const container = handle ? handle.container : null
	const probe = useDomProbe(container, readProbe)
	const [visible, setVisible] = useState(false)
	const [timedOut, setTimedOut] = useState(false)
	const [played, setPlayed] = useState(false)
	const [posterSeen, setPosterSeen] = useState(false)

	useEffect(() => {
		if (!container) return
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) if (entry.isIntersecting) setVisible(true)
			},
			{ threshold: 0.2 },
		)
		observer.observe(container)
		return () => observer.disconnect()
	}, [container])

	useEffect(() => {
		if (!visible) return
		const timer = setTimeout(() => setTimedOut(true), PLAY_TIMEOUT_MS)
		return () => clearTimeout(timer)
	}, [visible])

	const status = state ? state.status : null
	const currentTime = state ? state.currentTime : 0
	useEffect(() => {
		if (status === "playing" && currentTime > input.startTime + ADVANCE_SECONDS) setPlayed(true)
	}, [status, currentTime, input.startTime])

	const posterLoaded = probe ? probe.posterLoaded : false
	useEffect(() => {
		if (status !== "playing" && posterLoaded) setPosterSeen(true)
	}, [status, posterLoaded])

	const results: CheckResult[] = []

	if (input.expectPlay) {
		let verdict: boolean | null = null
		let detail = "waiting for the video to scroll into view"
		if (played) verdict = true
		else if (status === "blocked") {
			verdict = false
			detail = "autoplay blocked"
		} else if (status === "error") {
			verdict = false
			detail = "error before playing"
		} else if (visible && timedOut) {
			verdict = false
			detail = `status=${status ?? "none"} after 10 s`
		} else if (visible) detail = `status=${status ?? "mounting"}, t=${currentTime.toFixed(1)}`
		results.push({
			label: "Reaches playing and currentTime advances within 10 s of being in view",
			status: pick(verdict),
			detail,
		})
	}

	if (input.checkPoster) {
		let verdict: boolean | null = null
		if (posterSeen) verdict = true
		else if (status === "playing") verdict = false
		results.push({
			label: "Poster image visible before play",
			status: pick(verdict),
			detail: probe ? `${probe.imageSources.length} img` : undefined,
		})
	}

	if (probe) {
		const height = probe.root ? probe.root.height : 0
		results.push({
			label: "Layout not collapsed",
			status: pick(height >= MIN_VISIBLE_HEIGHT),
			detail: probe.root ? `${Math.round(probe.root.width)}x${Math.round(height)}` : undefined,
		})

		if (input.aspect && probe.stage && probe.stage.height > 0) {
			const ratio = probe.stage.width / probe.stage.height
			results.push({
				label: `Stage ratio matches aspectRatio (${input.aspect.toFixed(2)})`,
				status: pick(Math.abs(ratio - input.aspect) < ASPECT_TOLERANCE),
				detail: `ratio=${ratio.toFixed(2)}`,
			})
		}

		const errored = status === "error"
		if (input.expectError || errored) {
			results.push({
				label: input.expectError ? "Error state reached (expected)" : "Unexpected error state",
				status: errored ? pick(input.expectError) : "pending",
				detail:
					state && state.error
						? `${String(state.error.code)} ${state.error.message}`
						: `status=${status ?? "none"}`,
			})
			if (errored) {
				results.push({
					label: "Exactly one role=alert",
					status: pick(probe.alerts === 1),
					detail: `count=${probe.alerts}`,
				})
				results.push({
					label: "At most one role=status",
					status: pick(probe.statuses <= 1),
					detail: `count=${probe.statuses}`,
				})
				if (input.german) {
					results.push({
						label: "Error message uses the German label",
						status: pick(probe.text.includes(GERMAN.errorGeneric)),
					})
				}
			}
		}

		if (input.german) {
			const leaked: string[] = []
			for (const key of Object.keys(GERMAN) as (keyof VideoLabels)[]) {
				if (GERMAN[key] !== DEFAULT_LABELS[key] && probe.labels.includes(DEFAULT_LABELS[key])) {
					leaked.push(DEFAULT_LABELS[key])
				}
			}
			results.push({
				label: "German labels: no English default label left",
				status: probe.labels.length === 0 ? "pending" : pick(leaked.length === 0),
				detail: leaked.length > 0 ? leaked.join(", ") : undefined,
			})
		}

		if (input.staleHost) {
			const stale = probe.imageSources.filter((source) => source.includes(input.staleHost ?? ""))
			results.push({
				label: `No poster image from ${input.staleHost}`,
				status: pick(stale.length === 0),
				detail: `${probe.imageSources.length} img, ${stale.length} stale`,
			})
		}

		if (input.oursControls && handle) {
			const caps = handle.capabilities
			const pipCapable = caps.pip === "yes" || caps.pip === "best-effort"
			const castCapable = caps.remotePlayback === "yes" || caps.remotePlayback === "best-effort"
			results.push({
				label: "Fullscreen button rendered",
				status: probe.fullscreen > 0 ? "pass" : "pending",
				detail: `capability=${caps.fullscreen}`,
			})
			results.push({
				label: "PiP and Cast buttons only when capability and browser allow",
				status: pick(
					probe.pip > 0 === (pipCapable && probe.browserPip) &&
						probe.cast > 0 === (castCapable && probe.browserCast),
				),
				detail: `pip=${probe.pip} cast=${probe.cast}`,
			})
		}
	}

	if (input.captionsOn && state) {
		results.push({
			label: 'captions="on": a text track is reported',
			status: state.textTracks.length > 0 ? "pass" : "pending",
			detail: `tracks=${state.textTracks.length}, active=${String(state.activeTextTrack)}`,
		})
	}

	if (input.analyticsTitle) {
		const title = input.analyticsTitle
		const pushes = input.entries.filter(
			(entry) => entry.channel === "dataLayer" && entry.text.includes(title),
		)
		let verdict: boolean | null = null
		let detail = "waiting for playback"
		if (!input.stubOn) detail = "turn the dataLayer stub on"
		else if (input.trackingBlocked) {
			verdict = status === "playing" || pushes.length > 0 ? pushes.length === 0 : null
			detail = `canTrack false, pushes=${pushes.length}`
		} else if (pushes.length > 0) {
			verdict = true
			detail = pushes.map((entry) => entry.label).join(", ")
		} else if (status === "playing") {
			verdict = false
			detail = "playing, but nothing was pushed"
		}
		results.push({
			label: input.trackingBlocked
				? "canTrack false: nothing pushed to dataLayer"
				: "dataLayer received events for this video",
			status: pick(verdict),
			detail,
		})
	}

	return results
}
