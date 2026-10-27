"use client"

import type { UniversalVideoHandle } from "library/videos/types"

import textStyles from "app/styles/text"
import { type InfiniteLoop, InfiniteSideScroll } from "library/InfiniteSideScroll"
import { css, f, styled } from "library/styled"
import { getVideoDebugStats, UniversalVideo } from "library/videos/UniversalVideo"
import { type RefObject, useEffect, useRef, useState } from "react"

import type { CarouselScene } from "./observe"
import type { StageVideoProps } from "./types"

import { Button, Mini, Row } from "./Checks"

const SLIDES = 5
const POLL_MS = 100
const SWITCH_MARGIN = 12
const TTFF_LIMIT_MS = 1500
const VISIBLE_SHARE = 0.6
const OFFENDER_MS = 1000
const CYCLE_TOTAL = 20
const CYCLE_HALF = 10
const CYCLE_STEP_MS = 1100
const CYCLE_SETTLE_MS = 1500
const MOVE = { duration: 0.8, ease: "power3.out" }

function overlapArea(a: DOMRect, b: DOMRect) {
	const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
	const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
	return width * height
}

/** Share of an element inside both the viewport and the clipping track, 0 to 1. GSAP moves slides with transforms, which getBoundingClientRect includes. */
function visibleShare(element: Element, clip: DOMRect) {
	const box = element.getBoundingClientRect()
	const area = box.width * box.height
	if (area <= 0) return 0
	const viewport = new DOMRect(0, 0, window.innerWidth, window.innerHeight)
	const inside = new DOMRect(
		Math.max(box.left, clip.left),
		Math.max(box.top, clip.top),
		Math.max(0, Math.min(box.right, clip.right) - Math.max(box.left, clip.left)),
		Math.max(0, Math.min(box.bottom, clip.bottom) - Math.max(box.top, clip.top)),
	)
	return overlapArea(inside, viewport) / area
}

/** One mounted slide: its DOM node and player handle. InfiniteSideScroll renders the children several times, so each copy has its own entry. */
interface Entry {
	number: number
	element: HTMLElement | null
	handle: UniversalVideoHandle | null
	wasPlaying: boolean
	lastToggle: number
	activeSince: number | null
	painted: boolean
}

interface CycleTrack {
	running: boolean
	done: number
	atHalf: number | null
	atEnd: number | null
	peakMounted: number
	finished: boolean
	endAt: number
	timer: ReturnType<typeof setInterval> | null
}

function freshCycle(): CycleTrack {
	return {
		running: false,
		done: 0,
		atHalf: null,
		atEnd: null,
		peakMounted: 0,
		finished: false,
		endAt: 0,
		timer: null,
	}
}

interface Track {
	entries: Set<Entry>
	offSince: Map<Entry, number>
	wasPlaying: Set<Entry>
	starts: Map<number, number>
	everPlayed: boolean
	handovers: number
	lastSole: number | null
	peakSlots: number
	rejections: number
	active: Entry | null
	popIns: number
	rapidToggles: number
	maxTtff: number
	peakPlaying: number
	overlapSince: number | null
	overlapMs: number
	lastJson: string
	lastHandle: UniversalVideoHandle | null
	cycle: CycleTrack
}

function createTrack(): Track {
	return {
		entries: new Set(),
		offSince: new Map(),
		wasPlaying: new Set(),
		starts: new Map(),
		everPlayed: false,
		handovers: 0,
		lastSole: null,
		peakSlots: 0,
		rejections: 0,
		active: null,
		popIns: 0,
		rapidToggles: 0,
		maxTtff: 0,
		peakPlaying: 0,
		overlapSince: null,
		overlapMs: 0,
		lastJson: "",
		lastHandle: null,
		cycle: freshCycle(),
	}
}

const EMPTY_SCENE: CarouselScene = {
	kind: "carousel",
	slides: SLIDES,
	items: 0,
	visible: [],
	playing: [],
	offenders: [],
	cloneOffenders: [],
	everPlayed: false,
	handovers: 0,
	maxStarts: 0,
	mountedNow: 0,
	slotsNow: 0,
	peakSlots: 0,
	rejections: 0,
	activeIndex: null,
	popIns: 0,
	rapidToggles: 0,
	maxTtff: 0,
	ttffLimit: TTFF_LIMIT_MS,
	peakPlaying: 0,
	overlapMs: 0,
	neighborsPosterless: 0,
	cycle: {
		running: false,
		done: 0,
		total: CYCLE_TOTAL,
		atHalf: null,
		atEnd: null,
		peakMounted: 0,
		finished: false,
	},
}

function orderedEntries(t: Track) {
	const list = Array.from(t.entries).filter((entry) => entry.element !== null)
	return list.sort((a, b) => {
		if (!a.element || !b.element) return 0
		return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
	})
}

/** The slide whose centre is nearest the carousel's centre. The current one is kept until another is clearly nearer, so a slide never flaps at the midpoint. */
function pickActive(order: Entry[], clip: DOMRect, current: Entry | null) {
	const centre = clip.left + clip.width / 2
	const distance = (entry: Entry) => {
		if (!entry.element) return Number.POSITIVE_INFINITY
		const box = entry.element.getBoundingClientRect()
		return Math.abs(box.left + box.width / 2 - centre)
	}
	let best: Entry | null = null
	for (const entry of order) if (!best || distance(entry) < distance(best)) best = entry
	if (!best) return null
	if (current && order.includes(current) && distance(best) + SWITCH_MARGIN > distance(current))
		return current
	return best
}

function measure(clipElement: Element, t: Track): { scene: CarouselScene; order: Entry[] } {
	const now = performance.now()
	const stats = getVideoDebugStats()
	const clip = clipElement.getBoundingClientRect()
	const order = orderedEntries(t)

	const active = pickActive(order, clip, t.active)
	t.active = active
	for (const entry of order) {
		if (!entry.handle) continue
		if (entry === active) entry.handle.playFromTrigger()
		else entry.handle.pauseFromTrigger()
	}
	let neighborsPosterless = 0
	let playingCount = 0
	for (const entry of order) {
		const handle = entry.handle
		if (!entry.element || !handle) continue
		const state = handle.getState()
		const isPlaying = state.status === "playing"
		if (isPlaying) playingCount += 1
		if (isPlaying !== entry.wasPlaying) {
			if (now - entry.lastToggle < 1000 && entry.lastToggle > 0) t.rapidToggles += 1
			entry.lastToggle = now
			entry.wasPlaying = isPlaying
		}
		if (entry === active) {
			if (entry.activeSince === null) {
				entry.activeSince = now
				entry.painted = false
			}
			if (!entry.painted && state.framePainted && isPlaying) {
				entry.painted = true
				t.maxTtff = Math.max(t.maxTtff, now - entry.activeSince)
			}
		} else {
			entry.activeSince = null
		}
		if (visibleShare(entry.element, clip) >= VISIBLE_SHARE) {
			const image = entry.element.querySelector("img")
			const posterShown =
				image !== null &&
				image.complete &&
				image.naturalWidth > 0 &&
				getComputedStyle(image).visibility !== "hidden"
			if (!state.framePainted && !posterShown) t.popIns += 1
			if (entry !== active && !state.framePainted && !posterShown) neighborsPosterless += 1
		}
	}
	t.peakPlaying = Math.max(t.peakPlaying, playingCount)
	if (playingCount > 1) {
		if (t.overlapSince === null) t.overlapSince = now
		t.overlapMs = Math.max(t.overlapMs, now - t.overlapSince)
	} else t.overlapSince = null
	const visible: number[] = []
	const playing: number[] = []
	const playingEntries = new Set<Entry>()
	const visibleEntries = new Set<Entry>()
	order.forEach((entry, index) => {
		if (entry.element && visibleShare(entry.element, clip) >= VISIBLE_SHARE) {
			visible.push(index)
			visibleEntries.add(entry)
		}
		if (entry.handle && entry.handle.getState().status === "playing") {
			playing.push(index)
			playingEntries.add(entry)
		}
	})

	const offenders: number[] = []
	order.forEach((entry, index) => {
		if (!playingEntries.has(entry) || visibleEntries.has(entry)) return
		const since = t.offSince.get(entry) ?? now
		t.offSince.set(entry, since)
		if (now - since > OFFENDER_MS) offenders.push(index)
	})
	for (const entry of Array.from(t.offSince.keys())) {
		if (!playingEntries.has(entry) || visibleEntries.has(entry) || !t.entries.has(entry))
			t.offSince.delete(entry)
	}

	for (const entry of playingEntries) {
		if (!t.wasPlaying.has(entry)) t.starts.set(entry.number, (t.starts.get(entry.number) ?? 0) + 1)
	}
	t.wasPlaying = playingEntries
	if (playing.length > 0) t.everPlayed = true
	const soleIndex = playing.length === 1 ? playing[0] : undefined
	const sole = soleIndex === undefined ? undefined : order[soleIndex]
	if (sole) {
		if (t.lastSole !== null && t.lastSole !== sole.number) t.handovers += 1
		t.lastSole = sole.number
	}
	t.peakSlots = Math.max(t.peakSlots, stats.playing)

	const cycle = t.cycle
	if (cycle.running || cycle.finished)
		cycle.peakMounted = Math.max(cycle.peakMounted, stats.mounted)
	if (cycle.running && cycle.done >= CYCLE_HALF && cycle.atHalf === null)
		cycle.atHalf = stats.mounted
	if (!cycle.running && !cycle.finished && cycle.done >= CYCLE_TOTAL && now >= cycle.endAt) {
		cycle.atEnd = stats.mounted
		cycle.finished = true
	}

	const scene: CarouselScene = {
		kind: "carousel",
		slides: SLIDES,
		items: order.length,
		visible,
		playing,
		offenders,
		cloneOffenders: offenders.filter((index) => index >= SLIDES),
		everPlayed: t.everPlayed,
		handovers: t.handovers,
		maxStarts: Math.max(0, ...t.starts.values()),
		mountedNow: stats.mounted,
		slotsNow: stats.playing,
		peakSlots: t.peakSlots,
		rejections: t.rejections,
		activeIndex: t.active ? order.indexOf(t.active) : null,
		popIns: t.popIns,
		rapidToggles: t.rapidToggles,
		maxTtff: Math.round(t.maxTtff),
		ttffLimit: TTFF_LIMIT_MS,
		peakPlaying: t.peakPlaying,
		overlapMs: Math.round(t.overlapMs),
		neighborsPosterless,
		cycle: {
			running: cycle.running,
			done: cycle.done,
			total: CYCLE_TOTAL,
			atHalf: cycle.atHalf,
			atEnd: cycle.atEnd,
			peakMounted: cycle.peakMounted,
			finished: cycle.finished,
		},
	}
	return { scene, order }
}

function PrevButton({ onClick }: { onClick?: VoidFunction }) {
	return (
		<Button type="button" onClick={onClick}>
			Prev
		</Button>
	)
}

function NextButton({ onClick }: { onClick?: VoidFunction }) {
	return (
		<Button type="button" onClick={onClick}>
			Next
		</Button>
	)
}

interface CarouselStageProps {
	video: StageVideoProps
	/** Receives the handle of the slide that is in view, so the panel's quick actions drive it. */
	onHandle: (handle: UniversalVideoHandle | null) => void
	onScene: (scene: CarouselScene) => void
}

/**
 * The site's real carousel, library/InfiniteSideScroll, with a UniversalVideo in every slide. The component repeats its React
 * children until the track is wide enough, so the copies are real mounted players; the stage measures them from the DOM.
 */
export function CarouselStage({ video, onHandle, onScene }: CarouselStageProps) {
	const [root, setRoot] = useState<HTMLDivElement | null>(null)
	const [scene, setScene] = useState<CarouselScene>(EMPTY_SCENE)
	const track = useRef<Track>(createTrack())
	const loopRef = useRef<InfiniteLoop | null>(null)

	useEffect(() => {
		if (!root) return
		const t = track.current
		const onRejection = () => {
			t.rejections += 1
		}
		const poll = () => {
			const clipElement = root.querySelector(".track")
			if (!clipElement) return
			const { scene: next, order } = measure(clipElement, t)
			const json = JSON.stringify(next)
			if (json !== t.lastJson) {
				t.lastJson = json
				setScene(next)
				onScene(next)
			}
			const firstVisible = next.visible[0]
			const visibleEntry = firstVisible === undefined ? undefined : order[firstVisible]
			const handle = visibleEntry?.handle ?? t.lastHandle
			if (handle !== t.lastHandle) {
				t.lastHandle = handle
				onHandle(handle)
			}
		}
		window.addEventListener("unhandledrejection", onRejection)
		const interval = setInterval(poll, POLL_MS)
		return () => {
			clearInterval(interval)
			if (t.cycle.timer) clearInterval(t.cycle.timer)
			window.removeEventListener("unhandledrejection", onRejection)
		}
	}, [root, onScene, onHandle])

	const startCycle = () => {
		const t = track.current
		if (t.cycle.running || !loopRef.current) return
		const cycle = freshCycle()
		cycle.running = true
		t.cycle = cycle
		cycle.timer = setInterval(() => {
			loopRef.current?.next(MOVE)
			cycle.done += 1
			if (cycle.done < CYCLE_TOTAL) return
			if (cycle.timer) clearInterval(cycle.timer)
			cycle.timer = null
			cycle.running = false
			cycle.endAt = performance.now() + CYCLE_SETTLE_MS
		}, CYCLE_STEP_MS)
	}

	const running = scene.cycle.running
	const cycleText = scene.cycle.finished ? "done" : `${scene.cycle.done}/${scene.cycle.total}`
	const copies = scene.items / SLIDES

	return (
		<Wrap ref={setRoot} data-scroll-anchor="">
			<Row>
				<Button type="button" disabled={running} onClick={startCycle}>
					{running ? `Cycling ${cycleText}` : "Cycle 20 slides"}
				</Button>
			</Row>
			<Mini>
				items={scene.items} ({copies} copies) visible=[{scene.visible.join(",")}] playing=[
				{scene.playing.join(",")}] mounted=
				{scene.mountedNow} slots={scene.slotsNow} peakSlots={scene.peakSlots} cycle={cycleText}{" "}
				rejections={scene.rejections}
			</Mini>
			<InfiniteSideScroll ArrowButton={NextButton} BackArrowButton={PrevButton} loopRef={loopRef}>
				{Array.from({ length: SLIDES }, (_, index) => (
					<CarouselSlide key={index} number={index + 1} track={track} video={video} />
				))}
			</InfiniteSideScroll>
		</Wrap>
	)
}

interface SlideProps {
	number: number
	track: RefObject<Track>
	video: StageVideoProps
}

function CarouselSlide({ number, track, video }: SlideProps) {
	const entryRef = useRef<Entry>({
		number,
		element: null,
		handle: null,
		wasPlaying: false,
		lastToggle: 0,
		activeSince: null,
		painted: false,
	})

	const registerElement = (element: HTMLElement | null) => {
		entryRef.current.element = element
		if (element) track.current.entries.add(entryRef.current)
		else track.current.entries.delete(entryRef.current)
	}
	const registerHandle = (handle: UniversalVideoHandle | null) => {
		entryRef.current.handle = handle
	}

	return (
		<Slide ref={registerElement}>
			<UniversalVideo {...video} eager trigger={false} ref={registerHandle} />
			<Tag>{number}</Tag>
		</Slide>
	)
}

const Wrap = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;

		& .track {
			gap: 12px;
		}

		& .buttons {
			display: flex;
			gap: 8px;
		}
	`),
])

const Slide = styled("div", [
	f.responsive(css`
		position: relative;
		flex: 0 0 31%;
		min-width: 0;
	`),
])

const Tag = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
		position: absolute;
		top: 8px;
		left: 8px;
		z-index: 1;
		padding: 2px 6px;
		border-radius: 4px;
		background: rgb(0 0 0 / 60%);
		color: white;
		pointer-events: none;
	`),
])
