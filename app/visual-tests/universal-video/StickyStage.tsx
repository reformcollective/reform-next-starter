"use client"

import type { UniversalVideoHandle, UniversalVideoProps } from "library/videos/types"

import { createVar } from "@vanilla-extract/css"
import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { useVideoScrollTrigger } from "library/videos/trigger/useVideoScrollTrigger"
import { UniversalVideo } from "library/videos/UniversalVideo"
import { useEffect, useRef, useState } from "react"

import type { StickyScene } from "./observe"
import type { StageVideoProps } from "./types"

import { Tabs } from "./Fields"

type Driver = StickyScene["driver"]

const DRIVERS: { value: Driver; label: string }[] = [
	{ value: "builtin", label: "Built-in trigger (IntersectionObserver)" },
	{ value: "controller", label: "Recommended: useVideoScrollTrigger on the cover" },
]

const POLL_MS = 100
const FULL_COVER = 0.98
const IN_VIEW = 0.5
const UNCOVERED = 0.3
const PAUSED_AGAIN_MS = 600
const GRACE_MS = 500

function overlapArea(a: DOMRect, b: DOMRect) {
	const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
	const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
	return width * height
}

interface Tally {
	last: number
	coveredMs: number
	coverRun: number
	pauseLagMs: number | null
	playRun: number
	maxCoveredPlayMs: number
	pausedRun: number
	overlapSeen: boolean
	revealedSeen: boolean
	playedRevealed: boolean
	pausedWhenCoveredAgain: boolean
	lastJson: string
}

function createTally(): Tally {
	return {
		last: 0,
		coveredMs: 0,
		coverRun: 0,
		pauseLagMs: null,
		playRun: 0,
		maxCoveredPlayMs: 0,
		pausedRun: 0,
		overlapSeen: false,
		revealedSeen: false,
		playedRevealed: false,
		pausedWhenCoveredAgain: false,
		lastJson: "",
	}
}

interface StickyStageProps {
	video: StageVideoProps
	/** The trigger the scenario's options describe; used by the built-in driver. */
	trigger: UniversalVideoProps["trigger"]
	handle: UniversalVideoHandle | null
	onHandle: (handle: UniversalVideoHandle | null) => void
	onScene: (scene: StickyScene) => void
}

/**
 * A full-viewport cover scrolls up over a video that is pinned with position: sticky. The video is inside the viewport the whole time
 * but hidden, which is what an IntersectionObserver cannot tell. The switcher compares the built-in trigger with a
 * ScrollTrigger on the cover that drives the controller.
 */
export function StickyStage(props: StickyStageProps) {
	const [driver, setDriver] = useState<Driver>("builtin")

	return (
		<Wrap>
			<Tabs value={driver} options={DRIVERS} onChange={setDriver} />
			<StickyInner key={driver} driver={driver} {...props} />
		</Wrap>
	)
}

function StickyInner({
	driver,
	video,
	trigger,
	handle,
	onHandle,
	onScene,
}: StickyStageProps & { driver: Driver }) {
	const [cover, setCover] = useState<HTMLDivElement | null>(null)
	const [trackEl, setTrackEl] = useState<HTMLDivElement | null>(null)
	const [aspect, setAspect] = useState(16 / 9)
	const tally = useRef<Tally>(createTally())

	useVideoScrollTrigger({
		handle: driver === "controller" ? handle : null,
		trigger: cover,
		start: "bottom 45%",
		endTrigger: trackEl,
		end: "bottom 50%",
	})

	useEffect(() => {
		const container = handle ? handle.container : null
		if (!container || !cover) return
		const t = tally.current
		t.last = performance.now()
		const poll = () => {
			const now = performance.now()
			const dt = Math.min(now - t.last, 500)
			t.last = now
			const box = container.getBoundingClientRect()
			const area = box.width * box.height
			if (area <= 0) return
			const measured = box.width / box.height
			setAspect((current) => (Math.abs(current - measured) < 0.01 ? current : measured))
			const coverage = overlapArea(box, cover.getBoundingClientRect()) / area
			const geometric =
				overlapArea(box, new DOMRect(0, 0, window.innerWidth, window.innerHeight)) / area
			const playing = handle?.getState().status === "playing"
			const inView = geometric >= IN_VIEW
			const covered = inView && coverage >= FULL_COVER

			if (covered) {
				t.overlapSeen = true
				t.coveredMs += dt
				t.coverRun += dt
				if (playing) {
					if (t.coverRun > GRACE_MS) {
						t.playRun += dt
						t.maxCoveredPlayMs = Math.max(t.maxCoveredPlayMs, t.playRun)
					}
					t.pausedRun = 0
				} else {
					t.playRun = 0
					if (t.pauseLagMs === null) t.pauseLagMs = t.coverRun <= dt ? 0 : t.coverRun
					t.pausedRun += dt
					if (t.playedRevealed && t.pausedRun >= PAUSED_AGAIN_MS) t.pausedWhenCoveredAgain = true
				}
			} else {
				t.playRun = 0
				t.pausedRun = 0
				t.coverRun = 0
				t.pauseLagMs = null
			}
			if (inView && coverage <= UNCOVERED) {
				t.revealedSeen = true
				if (playing) t.playedRevealed = true
			}

			const scene: StickyScene = {
				kind: "sticky",
				driver,
				coverage,
				geometric,
				coveredMs: t.coveredMs,
				pauseLagMs: t.pauseLagMs,
				maxCoveredPlayMs: t.maxCoveredPlayMs,
				overlapSeen: t.overlapSeen,
				revealedSeen: t.revealedSeen,
				playedRevealed: t.playedRevealed,
				pausedWhenCoveredAgain: t.pausedWhenCoveredAgain,
			}
			const json = JSON.stringify({ ...scene, coveredMs: Math.round(scene.coveredMs / 250) })
			if (json === t.lastJson) return
			t.lastJson = json
			onScene(scene)
		}
		const interval = setInterval(poll, POLL_MS)
		return () => clearInterval(interval)
	}, [handle, cover, driver, onScene])

	return (
		<Track ref={setTrackEl} data-scroll-anchor="">
			<VideoLayer>
				<VideoBox aspect={aspect}>
					<UniversalVideo {...video} trigger={trigger} ref={onHandle} />
				</VideoBox>
			</VideoLayer>
			<Cover ref={setCover}>
				<CoverText>
					COVER: the video is right behind this block, inside the viewport. Scroll down to uncover
					it.
				</CoverText>
			</Cover>
			<Tail />
		</Track>
	)
}

const Wrap = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	`),
])

const Track = styled("div", [
	f.responsive(css`
		position: relative;
	`),
])

const VideoLayer = styled("div", [
	f.responsive(css`
		position: sticky;
		top: 0;
		z-index: 1;
		display: grid;
		place-items: center;
		background: Canvas;
	`),
	f.unresponsive(css`
		height: 100vh;
		box-sizing: border-box;
		padding: 0 16px;
	`),
])

const aspectVar = createVar()

const VideoBox = styled("div", {
	tokens: { aspect: aspectVar },
	base: [
		f.responsive(css`
			width: 100%;
			max-width: 960px;
		`),
		f.unresponsive(css`
			width: min(100%, 960px, calc(70vh * ${aspectVar}));
		`),
	],
})

const Cover = styled("div", [
	f.responsive(css`
		position: relative;
		z-index: 2;
		display: grid;
		place-items: center;
		background: rgb(24 32 64);
		color: white;
	`),
	f.unresponsive(css`
		height: 150vh;
		margin-top: -100vh;
	`),
])

const CoverText = styled("p", [
	f.responsive(css`
		${textStyles.p2}
		max-width: 480px;
		text-align: center;
	`),
])

const Tail = styled("div", [
	f.unresponsive(css`
		height: 150vh;
	`),
])
