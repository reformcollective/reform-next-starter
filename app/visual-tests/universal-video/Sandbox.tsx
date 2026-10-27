"use client"

import type { VideoField } from "library/sanity/assetMetadata"
import type { UniversalVideoHandle } from "library/videos/types"
import type { ReactNode } from "react"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { UniversalVideo } from "library/videos/UniversalVideo"
import { useState } from "react"

import type { CaseMap, StageVideoProps } from "./types"

import { CarouselStage } from "./CarouselStage"
import { type CheckResult, Button, Mini, Row } from "./Checks"
import { CopyButton } from "./CopyButton"
import { DebugLog, debugLogText } from "./DebugLog"
import { type LogEntry, EventLogList, useEventLog } from "./EventLog"
import { type Scene, useObserved } from "./observe"
import { OptionsPanel } from "./OptionsPanel"
import { useScenarioWriter } from "./report"
import {
	analyticsTitle,
	aspectNumber,
	BLANK_VIDEO,
	buildProps,
	can,
	DEFAULT_OPTIONS,
	type Options,
	SANDBOXES,
	type SandboxDef,
} from "./sandboxModel"
import {
	Accordion,
	Checklist,
	Code,
	CopyEverything,
	QuickActions,
	ScenarioPicker,
	SourceSwitcher,
	type ScrollWhere,
} from "./SandboxPanel"
import { SCENARIOS, availability, type Scenario } from "./scenarios"
import { Idle, Section } from "./Section"
import { useSelection } from "./selection"
import { StickyStage } from "./StickyStage"
import { useSandboxChecks } from "./useSandboxChecks"

interface ResolvedInput {
	note: string
	base: VideoField
	src: string | undefined
	playbackId: string | undefined
	missing: string | undefined
	caseKey: string | undefined
	expectError: boolean
	staleHost: string | undefined
}

function resolveInput(def: SandboxDef, options: Options, cases: CaseMap): ResolvedInput {
	const resolved: ResolvedInput = {
		note: "",
		base: BLANK_VIDEO,
		src: undefined,
		playbackId: undefined,
		missing: undefined,
		caseKey: undefined,
		expectError: false,
		staleHost: undefined,
	}
	if (options.preset === "custom") {
		const text = options.custom.trim()
		if (!text)
			resolved.missing = def.custom === "playbackId" ? "Paste a Mux playback ID." : "Paste a URL."
		else if (def.custom === "playbackId") resolved.playbackId = text
		else resolved.src = text
		return resolved
	}
	const preset = def.presets.find((item) => item.id === options.preset)
	if (!preset) {
		resolved.missing = "Unknown source."
		return resolved
	}
	resolved.note = preset.note
	resolved.src = preset.src
	resolved.playbackId = preset.playbackId
	resolved.expectError = preset.expectError === true
	resolved.staleHost = preset.staleThumbnailHost
	if (preset.caseKey) {
		const testCase = cases[preset.caseKey]
		resolved.caseKey = preset.caseKey
		if (testCase) resolved.base = testCase.video
		else
			resolved.missing = `Missing fixture "${preset.caseKey}". Run the seed script, or pick a plain-prop source.`
	}
	return resolved
}

export function Sandbox({ cases }: { cases: CaseMap }) {
	return <Section id="sandbox">{(near) => <Host cases={cases} near={near} />}</Section>
}

function Host({ cases, near }: { cases: CaseMap; near: boolean }) {
	const { source, scenario: scenarioId, select } = useSelection()
	const def = SANDBOXES.find((item) => item.id === source) ?? SANDBOXES[0]
	const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]
	if (!def || !scenario) return null

	return (
		<Rig
			key={`${def.id}/${scenario.id}`}
			def={def}
			scenario={scenario}
			cases={cases}
			near={near}
			select={select}
		/>
	)
}

function initialOptions(def: SandboxDef, scenario: Scenario): Options {
	const preset = scenario.source === "error" ? (def.error ?? def.main) : def.main
	return { ...DEFAULT_OPTIONS, ...def.initial, ...scenario.options, preset }
}

interface RigProps {
	def: SandboxDef
	scenario: Scenario
	cases: CaseMap
	near: boolean
	select: (next: { source?: string; scenario?: string }) => void
}

/** One source and one scenario. The key remounts everything when either changes. */
function Rig({ def, scenario, cases, near, select }: RigProps) {
	const initial = initialOptions(def, scenario)
	const [options, setOptions] = useState<Options>(initial)
	const [remount, setRemount] = useState(0)
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)
	const { add, entries, stub } = useEventLog()
	const [scene, setScene] = useState<Scene | null>(null)
	const observed = useObserved(handle, scene)
	const debugLabel = `sandbox-${def.id}`
	const fit = availability(def, scenario)

	const set = <K extends keyof Options>(key: K, value: Options[K]) => {
		setOptions((previous) => ({ ...previous, [key]: value }))
	}

	const input = resolveInput(def, options, cases)
	const uploadedPoster = cases["poster-uploaded"]?.video.posterImage ?? null
	let video = input.base
	if (options.poster === "uploaded") video = { ...input.base, posterImage: uploadedPoster }
	else if (options.poster === "cleared")
		video = { ...input.base, posterImage: null, thumbnail: null }

	const built = buildProps(options, def)
	const merged = { ...built.load, ...built.live }
	const readout = JSON.stringify(
		{
			video: input.caseKey ?? "(none)",
			src: input.src,
			playbackId: input.playbackId,
			poster: options.poster,
			canTrack: options.blockTracking ? "() => false" : undefined,
			...merged,
		},
		null,
		2,
	)
	const key = JSON.stringify([
		options.preset,
		options.custom,
		options.poster,
		options.blockTracking,
		built.load,
		remount,
	])

	const autoMode = options.mode !== "click" && options.trigger !== "off"
	const expectPlay =
		scenario.stage === undefined &&
		(autoMode || options.play === "play") &&
		can(def.provider, "autoplay") &&
		!input.expectError
	const checkPoster =
		options.mode === "click" &&
		options.facade !== "off" &&
		!options.eager &&
		!options.priority &&
		(options.poster === "uploaded" || can(def.provider, "providerPoster"))
	let shape: "wide" | "square" | "portrait" = "wide"
	if (options.aspect === "1/1") shape = "square"
	else if (options.aspect === "9/16") shape = "portrait"

	const extra = useSandboxChecks({
		handle,
		entries,
		stubOn: stub,
		expectPlay,
		startTime: merged.startTime ?? 0,
		expectError: input.expectError,
		staleHost: input.staleHost,
		aspect: aspectNumber(options.aspect),
		oursControls: options.controls === "ours",
		checkPoster,
		german: options.labels === "german",
		captionsOn: merged.captions === "on",
		analyticsTitle: options.analytics === "on" ? analyticsTitle(def.id) : undefined,
		trackingBlocked: options.blockTracking,
	})

	const results: CheckResult[] = scenario.expect
		.filter((expectation) => !expectation.applies || expectation.applies(observed))
		.map((expectation) => ({ label: expectation.label, ...expectation.check(observed) }))
	const modified = (Object.keys(options) as (keyof Options)[]).filter(
		(name) => options[name] !== initial[name],
	)

	const line = (result: CheckResult) =>
		`${result.status.toUpperCase()} ${result.label}${result.detail ? ` (${result.detail})` : ""}`
	useScenarioWriter("sandbox", `${def.title} / ${scenario.title}`, () =>
		[
			`source: ${def.id} (${def.title})`,
			`scenario: ${scenario.id} (${scenario.title})`,
			`options modified from the scenario: ${modified.length > 0 ? `yes (${modified.join(", ")})` : "no"}`,
			`availability: ${fit.state}${fit.reason ? ` - ${fit.reason}` : ""}`,
			"",
			"expectations:",
			...results.map(line),
			"",
			"props:",
			readout,
			"",
			"state:",
			describeState(handle),
			...(scene ? ["", "scene:", JSON.stringify(scene, null, 2)] : []),
			"",
			"extra automatic checks:",
			...(extra.length > 0 ? extra.map(line) : ["(none apply)"]),
			"",
			"debug log:",
			debugLogText(debugLabel),
		].join("\n"),
	)

	const reset = () => {
		setOptions(initial)
		setRemount((value) => value + 1)
	}
	const doRemount = () => setRemount((value) => value + 1)
	const match = (entry: LogEntry) => entry.channel === "dataLayer" || entry.label.startsWith(def.id)

	const { trigger: mergedTrigger, ...mergedRest } = merged
	const stageVideo: StageVideoProps = {
		video,
		src: input.src,
		playbackId: input.playbackId,
		...mergedRest,
		debugLabel,
	}

	let stage: ReactNode = <Idle text="Scroll closer to load the video." />
	if (fit.state === "unavailable")
		stage = <Missing>{fit.reason}. Pick another scenario or source.</Missing>
	else if (input.missing) stage = <Missing>{input.missing}</Missing>
	else if (near && scenario.stage === "carousel") {
		stage = <CarouselStage key={key} video={stageVideo} onHandle={setHandle} onScene={setScene} />
	} else if (near && scenario.stage === "sticky") {
		stage = (
			<StickyStage
				key={key}
				video={stageVideo}
				trigger={mergedTrigger}
				handle={handle}
				onHandle={setHandle}
				onScene={setScene}
			/>
		)
	} else if (near) {
		stage = (
			<UniversalVideo
				key={key}
				video={video}
				src={input.src}
				playbackId={input.playbackId}
				{...merged}
				debugLabel={debugLabel}
				ref={setHandle}
				onVideoEvent={(event) => add("onVideoEvent", def.id, event)}
				onError={(error) => add("handler", `${def.id} onError`, error)}
				onBlocked={() => add("handler", `${def.id} onBlocked`, "autoplay blocked")}
			/>
		)
	}

	const state = observed.state
	const stateSummary = state
		? `${state.status} ${state.currentTime.toFixed(1)}/${state.duration.toFixed(1)}s`
		: "not mounted"

	const scrollTo = (where: ScrollWhere) => {
		const stageEl =
			document.querySelector("[data-scroll-anchor]") ??
			document.querySelector("[data-universal-video]")
		if (!stageEl) return
		const rect = stageEl.getBoundingClientRect()
		const top = window.scrollY + rect.top
		const vh = window.innerHeight
		let target = top - 80
		if (where === "past") target = top + rect.height + vh * 0.5
		else if (where === "above") target = Math.max(0, top - vh * 0.9)
		else if (where === "cover") target = top + vh * 0.1
		else if (where === "half") target = top + vh
		else if (where === "reveal") target = top + vh * 1.6
		window.scrollTo({ top: target, behavior: "smooth" })
	}
	const scrollTargets: ScrollWhere[] | undefined =
		scenario.stage === "sticky" ? ["cover", "half", "reveal", "past", "above"] : undefined

	return (
		<Layout>
			<Main>
				{scenario.spacer ? <Spacer>Scroll down: the video is below this block.</Spacer> : null}
				{scenario.stage ? (
					stage
				) : (
					<Stage>
						<Player shape={shape}>{stage}</Player>
					</Stage>
				)}
				{scenario.spacer ? <Spacer>Scroll back up to the video.</Spacer> : null}
				<Notes>
					<span>{scenario.notes}</span>
					<span>{def.summary}</span>
					{input.note ? <span>Source: {input.note}</span> : null}
				</Notes>
				{options.mainContent ? (
					<Row>
						<JsonLdProbe />
					</Row>
				) : null}
				<EventLogList title="Analytics and video events" match={match} />
			</Main>
			<Rail>
				<SourceSwitcher
					defs={SANDBOXES}
					activeId={def.id}
					onSelect={(id) => select({ source: id })}
				/>
				<ScenarioPicker
					def={def}
					scenarios={SCENARIOS}
					activeId={scenario.id}
					onSelect={(id) => select({ scenario: id })}
				/>
				<Checklist results={results} />
				<QuickActions
					handle={handle}
					state={state}
					onRemount={doRemount}
					onScroll={scenario.spacer ? scrollTo : undefined}
					scrollTargets={scrollTargets}
				/>
				<Accordion title={`State: ${stateSummary}`}>
					<Code>{describeState(handle)}</Code>
				</Accordion>
				<Accordion
					title={
						modified.length > 0
							? `Advanced options (modified: ${modified.length})`
							: "Advanced options"
					}
				>
					{modified.length > 0 ? (
						<Row>
							<Modified>modified: {modified.join(", ")}</Modified>
							<Button type="button" onClick={reset}>
								Reset to scenario
							</Button>
						</Row>
					) : null}
					<OptionsPanel
						def={def}
						options={options}
						set={set}
						onRemount={doRemount}
						onReset={reset}
						uploadedPosterAvailable={uploadedPoster !== null}
					/>
				</Accordion>
				<Accordion title="Props in use">
					<CopyButton label="Copy props" getText={() => readout} />
					<Code>{readout}</Code>
				</Accordion>
				<DebugLog label={debugLabel} />
				<CopyEverything />
			</Rail>
		</Layout>
	)
}

function describeState(handle: UniversalVideoHandle | null) {
	if (!handle) return "not mounted"
	const state = handle.getState()
	const first = handle.media ? handle.media.firstElementChild : null
	const element = first instanceof HTMLMediaElement ? first : null
	const mediaError =
		element && element.error ? `${element.error.code} ${element.error.message}` : "none"
	const error = state.error ? `${String(state.error.code)} ${state.error.message}` : "none"
	return [
		`status=${state.status}`,
		`mounted=${String(handle.media !== null)}`,
		`readyState=${element ? element.readyState : "n/a (iframe or no media element)"}`,
		`networkState=${element ? element.networkState : "n/a"}`,
		`mediaError=${mediaError}`,
		`currentTime=${state.currentTime.toFixed(2)}`,
		`duration=${state.duration.toFixed(2)}`,
		`error=${error}`,
	].join("\n")
}

function JsonLdProbe() {
	const [found, setFound] = useState<string | null>(null)

	const count = () => {
		const scripts = document.querySelectorAll('script[type="application/ld+json"]')
		const types = Array.from(scripts, (script) => {
			const parsed: unknown = JSON.parse(script.textContent)
			const type: unknown =
				typeof parsed === "object" && parsed !== null ? Reflect.get(parsed, "@type") : null
			return typeof type === "string" ? type : "unknown"
		})
		setFound(`${scripts.length} script(s): ${types.join(", ") || "none"}`)
	}

	return (
		<>
			<Button type="button" onClick={count}>
				Check JSON-LD on this page
			</Button>
			{found ? <Mini>{found}</Mini> : null}
		</>
	)
}

const Layout = styled("div", [
	f.responsive(css`
		display: grid;
		gap: 24px;
		align-items: start;
	`),
	f.unresponsive(css`
		grid-template-columns: minmax(0, 1fr) 440px;
	`),
	f.small(css`
		grid-template-columns: minmax(0, 1fr);
	`),
])

const Main = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	`),
])

const Rail = styled("aside", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
		padding: 10px;
		border: 1px solid rgb(128 128 128 / 40%);
		border-radius: 8px;
		background: Canvas;
		color: CanvasText;
	`),
	f.large(css`
		position: sticky;
		align-self: start;
		top: calc(var(--site-header-height, 100px) + 8px);
	`),
	f.small(css`
		position: static;
	`),
])

const Stage = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: center;
	`),
	f.unresponsive(css`
		min-height: calc(100vh - var(--site-header-height, 100px) - 32px);
	`),
])

const Player = styled("div", {
	base: [
		f.unresponsive(css`
			width: 100%;
		`),
	],
	variants: {
		shape: {
			wide: [{}],
			square: [{ maxWidth: "80vh" }],
			portrait: [{ maxWidth: "45vh" }],
		},
	},
	defaultVariants: { shape: "wide" },
})

const Spacer = styled("div", [
	f.responsive(css`
		display: grid;
		place-items: center;
		border: 1px dashed rgb(128 128 128 / 50%);
		border-radius: 8px;
		opacity: 0.7;
	`),
	f.unresponsive(css`
		min-height: 100vh;
	`),
])

const Notes = styled("p", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 4px;
		opacity: 0.8;
	`),
])

const Modified = styled("span", [
	f.responsive(css`
		${textStyles.p4}
		padding: 2px 6px;
		border-radius: 4px;
		background: rgb(190 120 0);
		color: white;
	`),
])

const Missing = styled("p", [
	f.responsive(css`
		${textStyles.p3}
		padding: 24px;
		border: 1px dashed currentcolor;
		border-radius: 4px;
	`),
])
