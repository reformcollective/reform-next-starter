"use client"

import type { VideoField } from "library/sanity/assetMetadata"
import type { UniversalVideoHandle } from "library/videos/types"
import type { ReactNode } from "react"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { BackgroundVideo } from "library/videos/BackgroundVideo"
import { BatterySaverVideo } from "library/videos/BatterySaverVideo"
import { CarouselBackgroundVideo } from "library/videos/CarouselBGVideo"
import { LazyVideo } from "library/videos/LazyVideo"
import { MuxVideo } from "library/videos/MuxVideo"
import { UniversalVideo } from "library/videos/UniversalVideo"
import { VideoEmbed } from "library/videos/VideoEmbed"
import { useEffect, useRef, useState } from "react"

import type { CaseMap } from "./types"

import { Button, Mini, Row, Wide } from "./Checks"
import { Tabs } from "./Fields"
import { ExampleFrame } from "./Frame"

const WIDE = 16 / 9
const MUX_ID = "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe"
const FILE_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
const FILE_SOURCES = [{ src: FILE_URL, type: "video/mp4" }]
const FLUSH_MS = 400

type Hit = (name: string) => void

function useTally() {
	const tally = useRef<Record<string, number>>({})
	const [counts, setCounts] = useState<Record<string, number>>({})

	useEffect(() => {
		const timer = setInterval(() => {
			setCounts((previous) =>
				JSON.stringify(previous) === JSON.stringify(tally.current)
					? previous
					: { ...tally.current },
			)
		}, FLUSH_MS)
		return () => clearInterval(timer)
	}, [])

	const hit: Hit = (name) => {
		tally.current[name] = (tally.current[name] ?? 0) + 1
	}
	return { counts, hit }
}

function Tally({ counts }: { counts: Record<string, number> }) {
	const text = Object.entries(counts)
		.map(([name, count]) => `${name}:${count}`)
		.join("  ")
	return <Mini>events: {text || "none yet"}</Mini>
}

function Pair({
	title,
	note,
	toolbar,
	legacy,
	modern,
}: {
	title: string
	note: string
	toolbar?: ReactNode
	legacy: (hit: Hit) => ReactNode
	modern: (hit: Hit) => ReactNode
}) {
	const old = useTally()
	const next = useTally()

	return (
		<Wide>
			<ExampleFrame title={title} scenario="regression" note={note}>
				{toolbar}
				<Columns>
					<Side>
						<Label>Old component</Label>
						{legacy(old.hit)}
						<Tally counts={old.counts} />
					</Side>
					<Side>
						<Label>UniversalVideo equivalent</Label>
						{modern(next.hit)}
						<Tally counts={next.counts} />
					</Side>
				</Columns>
			</ExampleFrame>
		</Wide>
	)
}

function EmbedPair({ video, title }: { video: VideoField; title: string }) {
	const [playing, setPlaying] = useState(false)

	return (
		<Pair
			title={title}
			note="VideoEmbed with the playing prop against UniversalVideo play. Toggle it; both must start and pause."
			toolbar={
				<Row>
					<Button type="button" onClick={() => setPlaying((value) => !value)}>
						playing={String(!playing)}
					</Button>
					<Mini>current: {String(playing)}</Mini>
				</Row>
			}
			legacy={(hit) => (
				<VideoEmbed
					video={video}
					playing={playing}
					muted
					controls
					onReady={() => hit("onReady")}
					onPlay={() => hit("onPlay")}
					onPause={() => hit("onPause")}
					onEnded={() => hit("onEnded")}
					onTimeUpdate={() => hit("onTimeUpdate")}
					onError={() => hit("onError")}
				/>
			)}
			modern={(hit) => (
				<UniversalVideo
					video={video}
					play={playing}
					muted
					controls
					aspectRatio={WIDE}
					onReady={() => hit("onReady")}
					onPlay={() => hit("onPlay")}
					onPause={() => hit("onPause")}
					onEnded={() => hit("onEnded")}
					onTimeUpdate={() => hit("onTimeUpdate")}
					onError={() => hit("onError")}
				/>
			)}
		/>
	)
}

function MuxPair() {
	const mediaRef = useRef<HTMLVideoElement>(null)
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)
	const [legacyInfo, setLegacyInfo] = useState("not read")
	const [modernInfo, setModernInfo] = useState("not read")

	const readLegacy = () => {
		const element = mediaRef.current
		setLegacyInfo(
			element ? `${element.tagName} t=${element.currentTime.toFixed(2)}` : "ref is null",
		)
	}
	const readModern = () => {
		const state = handle?.getState()
		setModernInfo(
			handle && state
				? `${handle.media?.tagName ?? "no media"} t=${state.currentTime.toFixed(2)}`
				: "handle is null",
		)
	}

	return (
		<Pair
			title="MuxVideo vs UniversalVideo (onTimeUpdate and ref)"
			note="MuxVideo forwards a video element ref and a media-style onTimeUpdate. Read the ref after pressing play."
			toolbar={
				<Row>
					<Button type="button" onClick={readLegacy}>
						Read old ref
					</Button>
					<Mini>{legacyInfo}</Mini>
					<Button type="button" onClick={readModern}>
						Read new handle
					</Button>
					<Mini>{modernInfo}</Mini>
				</Row>
			}
			legacy={(hit) => (
				<MuxVideo
					playbackId={MUX_ID}
					controls
					ref={mediaRef}
					onTimeUpdate={() => hit("onTimeUpdate")}
					onPlay={() => hit("onPlay")}
					onPause={() => hit("onPause")}
					onSeeked={() => hit("onSeeked")}
					onEnded={() => hit("onEnded")}
				/>
			)}
			modern={(hit) => (
				<UniversalVideo
					playbackId={MUX_ID}
					mode="click"
					controls
					aspectRatio={WIDE}
					ref={setHandle}
					onTimeUpdate={() => hit("onTimeUpdate")}
					onPlay={() => hit("onPlay")}
					onPause={() => hit("onPause")}
					onEnded={() => hit("onEnded")}
				/>
			)}
		/>
	)
}

function BackgroundPair() {
	return (
		<Pair
			title="BackgroundVideo vs UniversalVideo mode background"
			note="Both should loop muted when in view and report time updates."
			legacy={(hit) => (
				<Ratio>
					<BackgroundVideo
						playbackId={MUX_ID}
						videoAspectRatio="16/9"
						loop
						onTimeUpdate={() => hit("onTimeUpdate")}
						onEnded={() => hit("onEnded")}
						onLoadedMetadata={() => hit("onLoadedMetadata")}
					/>
				</Ratio>
			)}
			modern={(hit) => (
				<UniversalVideo
					playbackId={MUX_ID}
					mode="background"
					loop
					aspectRatio={WIDE}
					onTimeUpdate={() => hit("onTimeUpdate")}
					onEnded={() => hit("onEnded")}
					onReady={() => hit("onReady")}
				/>
			)}
		/>
	)
}

function CarouselPair() {
	const [play, setPlay] = useState(true)

	return (
		<Pair
			title="CarouselBackgroundVideo vs UniversalVideo mode background"
			note="Toggle play: the old wrapper takes play, the new one takes the play prop too."
			toolbar={
				<Row>
					<Button type="button" onClick={() => setPlay((value) => !value)}>
						play={String(!play)}
					</Button>
				</Row>
			}
			legacy={(hit) => (
				<Ratio>
					<CarouselBackgroundVideo
						playbackId={MUX_ID}
						videoAspectRatio="16/9"
						play={play}
						loop
						eager
						onPlaying={() => hit("onPlaying")}
						onTimeUpdate={() => hit("onTimeUpdate")}
						onLoadedMetadata={() => hit("onLoadedMetadata")}
					/>
				</Ratio>
			)}
			modern={(hit) => (
				<UniversalVideo
					playbackId={MUX_ID}
					mode="background"
					play={play}
					loop
					eager
					aspectRatio={WIDE}
					onPlay={() => hit("onPlay")}
					onTimeUpdate={() => hit("onTimeUpdate")}
					onReady={() => hit("onReady")}
				/>
			)}
		/>
	)
}

function BatterySaverPair() {
	return (
		<Pair
			title="BatterySaverVideo vs UniversalVideo with labels.playOverlay"
			note="Enable low power mode (Safari) to see the blocked-autoplay overlay text on both."
			legacy={(hit) => (
				<BatterySaverVideo
					playbackId={MUX_ID}
					autoPlay
					muted
					loop
					onPlay={() => hit("onPlay")}
					onPause={() => hit("onPause")}
					onTimeUpdate={() => hit("onTimeUpdate")}
				/>
			)}
			modern={(hit) => (
				<UniversalVideo
					playbackId={MUX_ID}
					mode="autoplay"
					muted
					loop
					aspectRatio={WIDE}
					labels={{ playOverlay: "Site paused by low power mode" }}
					onPlay={() => hit("onPlay")}
					onPause={() => hit("onPause")}
					onTimeUpdate={() => hit("onTimeUpdate")}
					onBlocked={() => hit("onBlocked")}
				/>
			)}
		/>
	)
}

function LazyPair() {
	return (
		<Pair
			title="LazyVideo vs UniversalVideo with a src array"
			note="LazyVideo is deliberately not wrapped in a sized box and passes no aspect ratio, so it also shows whether a sourceless-aspect file video collapses."
			legacy={(hit) => (
				<LazyVideo autoPlay muted loop onLoad={() => hit("onLoad")}>
					<source src={FILE_URL} type="video/mp4" />
				</LazyVideo>
			)}
			modern={(hit) => (
				<UniversalVideo
					src={FILE_SOURCES}
					mode="autoplay"
					muted
					loop
					controls={false}
					aspectRatio={WIDE}
					onReady={() => hit("onReady")}
					onPlay={() => hit("onPlay")}
				/>
			)}
		/>
	)
}

type CompatView =
	| "embed-youtube"
	| "embed-mux"
	| "mux"
	| "background"
	| "carousel"
	| "battery"
	| "lazy"

const VIEWS: { value: CompatView; label: string }[] = [
	{ value: "embed-youtube", label: "VideoEmbed (YouTube)" },
	{ value: "embed-mux", label: "VideoEmbed (Mux)" },
	{ value: "mux", label: "MuxVideo" },
	{ value: "background", label: "BackgroundVideo" },
	{ value: "carousel", label: "CarouselBackgroundVideo" },
	{ value: "battery", label: "BatterySaverVideo" },
	{ value: "lazy", label: "LazyVideo" },
]

/** Old library/videos wrappers next to their UniversalVideo equivalents, one pair at a time. */
export function CompatPairs({ cases }: { cases: CaseMap }) {
	const [view, setView] = useState<CompatView>("embed-youtube")
	const youtube = cases["source-youtube"]
	const mux = cases["source-mux"]

	let body: ReactNode = null
	if (view === "embed-youtube") {
		body = youtube ? (
			<EmbedPair video={youtube.video} title="VideoEmbed (YouTube url) vs UniversalVideo" />
		) : (
			<ExampleFrame title="VideoEmbed (YouTube)" missingKey="source-youtube" />
		)
	} else if (view === "embed-mux") {
		body = mux ? (
			<EmbedPair video={mux.video} title="VideoEmbed (Mux video) vs UniversalVideo" />
		) : (
			<ExampleFrame title="VideoEmbed (Mux)" missingKey="source-mux" />
		)
	} else if (view === "mux") body = <MuxPair />
	else if (view === "background") body = <BackgroundPair />
	else if (view === "carousel") body = <CarouselPair />
	else if (view === "battery") body = <BatterySaverPair />
	else body = <LazyPair />

	return (
		<>
			<Tabs value={view} options={VIEWS} onChange={setView} />
			{body}
		</>
	)
}

const Columns = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	`),
	f.small(css`
		grid-template-columns: minmax(0, 1fr);
	`),
])

const Side = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	`),
])

const Label = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
		opacity: 0.6;
		text-transform: uppercase;
	`),
])

const Ratio = styled("div", [
	f.responsive(css`
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: clip;
	`),
])
