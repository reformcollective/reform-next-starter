"use client"

import type { UniversalVideoHandle, VideoEvent, VideoInViewTrigger } from "library/videos/types"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { useVideo } from "library/videos/controller/useVideo"
import { useVideoScrollTrigger } from "library/videos/trigger/useVideoScrollTrigger"
import { UniversalVideo } from "library/videos/UniversalVideo"
import { useEffect, useState } from "react"

import type { CaseMap, ShowcaseCase } from "./types"

import { useEventLog } from "./EventLog"
import { Tabs } from "./Fields"
import { ExampleFrame, StateReadout } from "./Frame"

const noop = () => undefined

function useVideoLogging(label: string) {
	const { add } = useEventLog()
	return {
		onVideoEvent: (event: VideoEvent) => add("onVideoEvent", label, event),
	}
}

function InViewDemo({
	testCase,
	title,
	trigger,
}: {
	testCase: ShowcaseCase
	title: string
	trigger: VideoInViewTrigger
}) {
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)
	const logging = useVideoLogging(title)

	return (
		<ExampleFrame
			title={title}
			scenario={testCase.scenario}
			note={testCase.note}
			props={{ mode: "autoplay", muted: true, loop: true, trigger }}
		>
			<Spacer>Scroll the video out of view and back.</Spacer>
			<UniversalVideo
				video={testCase.video}
				mode="autoplay"
				muted
				loop
				controls
				aspectRatio={16 / 9}
				trigger={trigger}
				ref={setHandle}
				{...logging}
			/>
			<Row>
				<Button type="button" onClick={() => handle?.pause()}>
					Pause (manual)
				</Button>
				<Button type="button" onClick={() => handle?.releaseManualControl()}>
					Release manual control
				</Button>
			</Row>
			<StateReadout controller={handle} />
			<Spacer>Below the video.</Spacer>
		</ExampleFrame>
	)
}

function GsapDemo({ testCase }: { testCase: ShowcaseCase }) {
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)
	const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)
	const logging = useVideoLogging("trigger-gsap")

	useVideoScrollTrigger({ handle, trigger: wrapper, start: "top 70%", end: "bottom 30%" })

	return (
		<ExampleFrame
			title={testCase.title}
			scenario={testCase.scenario}
			note={testCase.note}
			props={{ mode: "autoplay", muted: true, loop: true, trigger: false }}
		>
			<Spacer>
				Scroll down: a ScrollTrigger calls handle.playFromTrigger() and pauseFromTrigger().
			</Spacer>
			<div ref={setWrapper}>
				<UniversalVideo
					video={testCase.video}
					mode="autoplay"
					muted
					loop
					controls
					trigger={false}
					aspectRatio={16 / 9}
					ref={setHandle}
					{...logging}
				/>
			</div>
			<StateReadout controller={handle} />
			<Spacer>Below the video.</Spacer>
		</ExampleFrame>
	)
}

function ObserverDriver({ target }: { target: HTMLElement | null }) {
	const { controller } = useVideo()

	useEffect(() => {
		if (!target) return
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) controller.play().catch(noop)
					else controller.pause()
				}
			},
			{ threshold: 0.5 },
		)
		observer.observe(target)
		return () => observer.disconnect()
	}, [target, controller])

	return null
}

function CustomControls() {
	const { state, controller } = useVideo()

	return (
		<Custom>
			<Button type="button" onClick={() => controller.toggle()}>
				{state.paused ? "Play" : "Pause"}
			</Button>
			<Button type="button" onClick={() => controller.setMuted(!state.muted)}>
				{state.muted ? "Unmute" : "Mute"}
			</Button>
			<input
				type="range"
				min={0}
				max={state.duration || 0}
				step={0.1}
				value={state.currentTime}
				onChange={(event) => controller.seek(Number(event.target.value))}
			/>
		</Custom>
	)
}

function HookDemo({ testCase }: { testCase: ShowcaseCase }) {
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)
	const [target, setTarget] = useState<HTMLDivElement | null>(null)
	const logging = useVideoLogging("trigger-hook")

	return (
		<ExampleFrame
			title={testCase.title}
			scenario={testCase.scenario}
			note={testCase.note}
			props={{ mode: "click", muted: true, loop: true, controls: false, trigger: false }}
		>
			<Spacer>
				Scroll the video into view: an IntersectionObserver in a child calls useVideo().
			</Spacer>
			<div ref={setTarget}>
				<UniversalVideo
					video={testCase.video}
					mode="click"
					muted
					loop
					controls={false}
					trigger={false}
					aspectRatio={16 / 9}
					ref={setHandle}
					{...logging}
				>
					<ObserverDriver target={target} />
					<CustomControls />
				</UniversalVideo>
			</div>
			<StateReadout controller={handle} />
			<Spacer>Below the video.</Spacer>
		</ExampleFrame>
	)
}

type TriggerView = "inview-threshold" | "inview-once" | "gsap" | "hook"

const VIEWS: { value: TriggerView; label: string }[] = [
	{ value: "inview-threshold", label: "inView threshold 0.6, pauses when out" },
	{ value: "inview-once", label: "inView once, keeps playing" },
	{ value: "gsap", label: "GSAP ScrollTrigger" },
	{ value: "hook", label: "useVideo + IntersectionObserver" },
]

/** One trigger variant at a time, chosen with the switcher. */
export function Triggers({ cases }: { cases: CaseMap }) {
	const [view, setView] = useState<TriggerView>("inview-threshold")
	const inView = cases["trigger-inview"]
	const gsapCase = cases["trigger-gsap"]
	const hook = cases["trigger-hook"]

	let body = <ExampleFrame title="trigger" missingKey="trigger-inview" />
	if (view === "inview-threshold" && inView) {
		body = (
			<InViewDemo
				testCase={inView}
				title="inView: threshold 0.6, pauses when out"
				trigger={{ threshold: 0.6, rootMargin: "0px", once: false, pauseWhenOut: true }}
			/>
		)
	} else if (view === "inview-once" && inView) {
		body = (
			<InViewDemo
				testCase={inView}
				title="inView: once, keeps playing when out"
				trigger={{ threshold: 0.3, once: true, pauseWhenOut: false }}
			/>
		)
	} else if (view === "gsap") {
		body = gsapCase ? (
			<GsapDemo testCase={gsapCase} />
		) : (
			<ExampleFrame title="trigger-gsap" missingKey="trigger-gsap" />
		)
	} else if (view === "hook") {
		body = hook ? (
			<HookDemo testCase={hook} />
		) : (
			<ExampleFrame title="trigger-hook" missingKey="trigger-hook" />
		)
	}

	return (
		<>
			<Tabs value={view} options={VIEWS} onChange={setView} />
			{body}
		</>
	)
}

const Spacer = styled("p", [
	f.responsive(css`
		${textStyles.p3}
		padding: 25vh 0;
		opacity: 0.6;
		text-align: center;
	`),
])

const Row = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	`),
])

const Custom = styled("div", [
	f.responsive(css`
		position: absolute;
		inset: auto 0 0;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		background: rgb(0 0 0 / 60%);
		color: white;
	`),
])

const Button = styled("button", [
	f.responsive(css`
		${textStyles.p3}
		padding: 4px 12px;
		border: 1px solid currentcolor;
		border-radius: 4px;
		cursor: pointer;
	`),
])
