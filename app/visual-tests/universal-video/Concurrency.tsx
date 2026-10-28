"use client"

import type { UniversalVideoHandle } from "library/videos/types"

import { css, f, styled } from "library/styled"
import { VideoConfigProvider } from "library/videos/config"
import { getVideoDebugStats, UniversalVideo } from "library/videos/UniversalVideo"
import { useEffect, useState } from "react"

import type { ShowcaseCase } from "./types"

import { Button, Checks, Mini, Row, useHandleState } from "./Checks"
import { useEventLog } from "./EventLog"
import { ExampleFrame } from "./Frame"

const WIDE = 16 / 9
const CONCURRENT_VIDEOS = 5
const CONCURRENT_MAX = 2
const POLL_MS = 500

function ConcurrentTile({
	testCase,
	index,
	onHandle,
}: {
	testCase: ShowcaseCase
	index: number
	onHandle: (index: number, handle: UniversalVideoHandle | null) => void
}) {
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)
	const state = useHandleState(handle)
	const { add } = useEventLog()
	const label = `concurrent-${index + 1}`

	useEffect(() => {
		onHandle(index, handle)
	}, [index, handle, onHandle])

	return (
		<Tile>
			<UniversalVideo
				video={testCase.video}
				mode="autoplay"
				muted
				loop
				controls={false}
				aspectRatio={WIDE}
				ref={setHandle}
				onVideoEvent={(event) => add("onVideoEvent", label, event)}
			/>
			<Row>
				<Button type="button" onClick={() => handle?.pause()}>
					Pause #{index + 1}
				</Button>
				<Button type="button" onClick={() => handle?.releaseManualControl()}>
					Release
				</Button>
			</Row>
			<Mini>
				{state
					? `${state.status} wanted=${String(state.wanted)}/${String(state.wantedOrigin)}`
					: "mounting"}
			</Mini>
		</Tile>
	)
}

/** A few in-view autoplay videos under a low maxConcurrent, with slot-leak checks. */
export function Concurrency({ testCase }: { testCase: ShowcaseCase }) {
	const [handles, setHandles] = useState<(UniversalVideoHandle | null)[]>(() =>
		Array.from({ length: CONCURRENT_VIDEOS }, () => null),
	)
	const [snapshot, setSnapshot] = useState({ stats: getVideoDebugStats(), actual: 0 })

	const register = (index: number, handle: UniversalVideoHandle | null) => {
		setHandles((previous) => (previous[index] === handle ? previous : previous.with(index, handle)))
	}

	useEffect(() => {
		const timer = setInterval(() => {
			const actual = handles.filter((handle) => handle !== null && !handle.getState().paused).length
			setSnapshot({ stats: getVideoDebugStats(), actual })
		}, POLL_MS)
		return () => clearInterval(timer)
	}, [handles])

	const { stats, actual } = snapshot
	const indexes = Array.from({ length: CONCURRENT_VIDEOS }, (_, index) => index)

	return (
		<ExampleFrame
			title={`${CONCURRENT_VIDEOS} in-view autoplay videos, maxConcurrent=${CONCURRENT_MAX}`}
			scenario="concurrency"
			note="At most two may play. Pause some by hand, then release or pause all: playing must fall to 0 and recover, with no slot stuck."
			props={{
				mode: "autoplay",
				muted: true,
				loop: true,
				videos: CONCURRENT_VIDEOS,
				config: { maxConcurrent: CONCURRENT_MAX },
			}}
		>
			<VideoConfigProvider value={{ maxConcurrent: CONCURRENT_MAX }}>
				<Tiles>
					{indexes.map((index) => (
						<ConcurrentTile key={index} testCase={testCase} index={index} onHandle={register} />
					))}
				</Tiles>
			</VideoConfigProvider>
			<Row>
				<Button type="button" onClick={() => handles.forEach((handle) => handle?.pause())}>
					Pause all
				</Button>
				<Button
					type="button"
					onClick={() => handles.forEach((handle) => handle?.releaseManualControl())}
				>
					Release all
				</Button>
			</Row>
			<Mini>
				getVideoDebugStats: mounted={stats.mounted} observers={stats.observers} playing(slots)=
				{stats.playing} elements=
				{stats.elements} / actually unpaused={actual}
			</Mini>
			<Checks
				results={[
					{
						label: `Slots in use never exceed maxConcurrent (${CONCURRENT_MAX})`,
						status: stats.playing <= CONCURRENT_MAX ? "pass" : "fail",
						detail: `slots=${stats.playing}`,
					},
					{
						label: "Slots match unpaused videos (brief mismatch while loading is fine)",
						status: stats.playing === actual ? "pass" : "fail",
						detail: `slots=${stats.playing}, unpaused=${actual}`,
					},
				]}
			/>
		</ExampleFrame>
	)
}

const Tiles = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 12px;
	`),
])

const Tile = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	`),
])
