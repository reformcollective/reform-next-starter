"use client"

import type { UniversalVideoHandle, VideoChapter } from "library/videos/types"

import { css, f, styled } from "library/styled"
import { useVideo } from "library/videos/controller/useVideo"
import {
	Captions,
	ChaptersMenu,
	Controls,
	CurrentTime,
	Duration,
	FullscreenButton,
	MuteButton,
	PlayButton,
	QualityMenu,
	Scrubber,
	VolumeSlider,
} from "library/videos/parts"
import { UniversalVideo } from "library/videos/UniversalVideo"
import { useState } from "react"

import type { CaseMap, ShowcaseCase } from "./types"

import { Button, Checks, type CheckResult, useDomProbe } from "./Checks"
import { useEventLog } from "./EventLog"
import { Tabs } from "./Fields"
import { ExampleFrame, StateReadout } from "./Frame"

const WIDE = 16 / 9
const CHAPTERS: VideoChapter[] = [
	{ startTime: 0, title: "Start" },
	{ startTime: 3, title: "Middle" },
	{ startTime: 6, title: "End" },
]

function readParts(element: HTMLElement) {
	return {
		ranges: element.querySelectorAll('input[type="range"]').length,
		chapterMenus: element.querySelectorAll("select").length,
	}
}

function SiblingToggle() {
	const { state, controller } = useVideo()
	return (
		<Corner>
			<Button type="button" onClick={() => controller.toggle()}>
				useVideo: {state.status} {state.currentTime.toFixed(1)}s
			</Button>
		</Corner>
	)
}

function ByHandExample({ testCase }: { testCase: ShowcaseCase }) {
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)
	const { add } = useEventLog()
	const probe = useDomProbe(handle?.container ?? null, readParts)

	const checks: CheckResult[] = [
		{
			label: "Scrubber and VolumeSlider rendered (two range inputs)",
			status: !probe ? "pending" : probe.ranges >= 2 ? "pass" : "fail",
			detail: probe ? `ranges=${probe.ranges}` : undefined,
		},
		{
			label: "ChaptersMenu rendered from the chapters prop",
			status: !probe ? "pending" : probe.chapterMenus > 0 ? "pass" : "pending",
			detail: probe ? `selects=${probe.chapterMenus}` : undefined,
		},
	]

	return (
		<ExampleFrame
			title="Custom controls by hand on a Mux video with chapters"
			scenario="regression"
			note="Children replace DefaultControls: PlayButton, MuteButton, VolumeSlider, CurrentTime, Scrubber, Duration, QualityMenu, ChaptersMenu and FullscreenButton assembled inside Controls."
			props={{ mode: "click", controls: true, eager: true, chapters: CHAPTERS }}
		>
			<UniversalVideo
				video={testCase.video}
				mode="click"
				controls
				eager
				chapters={CHAPTERS}
				aspectRatio={WIDE}
				ref={setHandle}
				onVideoEvent={(event) => add("onVideoEvent", "custom-controls", event)}
			>
				<Captions />
				<Controls>
					<Bar>
						<PlayButton />
						<MuteButton />
						<VolumeSlider />
						<CurrentTime />
						<GrowScrubber />
						<Duration />
						<QualityMenu />
						<ChaptersMenu />
						<FullscreenButton />
					</Bar>
				</Controls>
			</UniversalVideo>
			<Checks results={checks} />
			<StateReadout controller={handle} />
		</ExampleFrame>
	)
}

function SiblingExample({ testCase }: { testCase: ShowcaseCase }) {
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)

	return (
		<ExampleFrame
			title="useVideo in a sibling child"
			scenario="regression"
			note="A plain child component calls useVideo for state and controller. Its button must toggle playback and its label must follow the live status."
			props={{ mode: "click", controls: true }}
		>
			<UniversalVideo
				video={testCase.video}
				mode="click"
				controls
				aspectRatio={WIDE}
				ref={setHandle}
			>
				<Controls>
					<Bar>
						<PlayButton />
						<GrowScrubber />
					</Bar>
				</Controls>
				<SiblingToggle />
			</UniversalVideo>
			<StateReadout controller={handle} />
		</ExampleFrame>
	)
}

type ControlsView = "by-hand" | "sibling"

const VIEWS: { value: ControlsView; label: string }[] = [
	{ value: "by-hand", label: "Parts assembled by hand (Mux, chapters)" },
	{ value: "sibling", label: "useVideo in a sibling child" },
]

/** Custom controls assembled as children and through useVideo, one at a time. */
export function CustomControlsExamples({ cases }: { cases: CaseMap }) {
	const [view, setView] = useState<ControlsView>("by-hand")
	const mux = cases["source-mux"]
	const file = cases["source-file"]

	let body = <ExampleFrame title="Custom controls" missingKey="source-mux" />
	if (view === "by-hand" && mux) body = <ByHandExample testCase={mux} />
	else if (view === "sibling" && file) body = <SiblingExample testCase={file} />
	else if (view === "sibling")
		body = <ExampleFrame title="useVideo in a sibling child" missingKey="source-file" />

	return (
		<>
			<Tabs value={view} options={VIEWS} onChange={setView} />
			{body}
		</>
	)
}

const GrowScrubber = styled(Scrubber, [
	f.responsive(css`
		flex: 1 1 120px;
		min-width: 0;
	`),
])

const Bar = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	`),
])

const Corner = styled("div", [
	f.responsive(css`
		position: absolute;
		top: 8px;
		right: 8px;
	`),
])
