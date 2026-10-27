"use client"

import type { VideoMode } from "library/videos/types"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { CAPABILITIES } from "library/videos/capabilities"

import { Button } from "./Checks"
import { Choice, Group, NumberField, Slider, TextField, Toggle } from "./Fields"
import {
	type AnalyticsChoice,
	type AspectChoice,
	type ControlsChoice,
	can,
	type FacadeChoice,
	type LabelsChoice,
	type MaxResolution,
	type Options,
	type PlacementChoice,
	type PlayChoice,
	type PosterChoice,
	type PreferPlayback,
	type SandboxDef,
	type TriggerChoice,
} from "./sandboxModel"

interface OptionsPanelProps {
	def: SandboxDef
	options: Options
	set: <K extends keyof Options>(key: K, value: Options[K]) => void
	onRemount: () => void
	onReset: () => void
	uploadedPosterAvailable: boolean
}

function tag(def: SandboxDef, feature: Parameters<typeof can>[1]) {
	return CAPABILITIES[def.provider][feature] === "best-effort" ? " (best-effort)" : ""
}

/** Every option this source supports, grouped. Options the source cannot honor are not shown. */
export function OptionsPanel({
	def,
	options,
	set,
	onRemount,
	onReset,
	uploadedPosterAvailable,
}: OptionsPanelProps) {
	const provider = def.provider
	const isMux = provider === "mux"
	const modes: { value: VideoMode; label: string }[] = [{ value: "click", label: "click" }]
	if (can(provider, "autoplay"))
		modes.push({ value: "autoplay", label: `autoplay${tag(def, "autoplay")}` })
	if (can(provider, "background"))
		modes.push({ value: "background", label: `background${tag(def, "background")}` })

	const controlChoices: { value: ControlsChoice; label: string }[] = [
		{ value: "ours", label: "ours (true)" },
		{ value: "provider", label: "provider chrome" },
	]
	if (can(provider, "hideChrome"))
		controlChoices.push({ value: "none", label: `none (false)${tag(def, "hideChrome")}` })

	const presetChoices = [
		...def.presets.map((preset) => ({ value: preset.id, label: preset.label })),
		{ value: "custom", label: "Paste my own" },
	]
	const activePreset = def.presets.find((preset) => preset.id === options.preset)
	const placementApplies = options.controls === "ours" && provider !== "spotify"
	const custom = options.preset === "custom"

	return (
		<Panel>
			<Group title="Source">
				<Choice
					label="Source"
					value={options.preset}
					options={presetChoices}
					onChange={(value) => set("preset", value)}
				/>
				{custom ? (
					<TextField
						label={def.custom === "playbackId" ? "Playback ID" : "URL"}
						value={options.custom}
						placeholder={def.customHint}
						onChange={(value) => set("custom", value)}
					/>
				) : (
					<Hint>{activePreset ? activePreset.note : ""}</Hint>
				)}
			</Group>

			<Group title="Playback">
				<Choice
					label="mode"
					value={options.mode}
					options={modes}
					onChange={(value) => set("mode", value)}
				/>
				{can(provider, "muted") ? (
					<Toggle
						label={`muted${tag(def, "muted")}${options.mode === "click" ? "" : " (forced on outside click mode)"}`}
						checked={options.muted}
						disabled={options.mode !== "click"}
						onChange={(value) => set("muted", value)}
					/>
				) : null}
				{can(provider, "loop") ? (
					<Toggle
						label={`loop${tag(def, "loop")}`}
						checked={options.loop}
						onChange={(value) => set("loop", value)}
					/>
				) : null}
				<Choice
					label="play (declarative)"
					value={options.play}
					options={
						[
							{ value: "unset", label: "unset" },
							{ value: "play", label: "true" },
							{ value: "pause", label: "false" },
						] satisfies { value: PlayChoice; label: string }[]
					}
					onChange={(value) => set("play", value)}
				/>
				{can(provider, "startTime") ? (
					<NumberField
						label={`startTime (s, 0 = unset)${tag(def, "startTime")}`}
						value={options.startTime}
						min={0}
						step={1}
						onChange={(value) => set("startTime", value)}
					/>
				) : null}
				{can(provider, "endTime") ? (
					<NumberField
						label={`endTime (s, 0 = unset)${tag(def, "endTime")}`}
						value={options.endTime}
						min={0}
						step={1}
						onChange={(value) => set("endTime", value)}
					/>
				) : null}
				{options.mode === "background" ? (
					<Toggle
						label="showPause"
						checked={options.showPause}
						onChange={(value) => set("showPause", value)}
					/>
				) : null}
			</Group>

			<Group title="Trigger">
				<Choice
					label="trigger"
					value={options.trigger}
					options={
						[
							{ value: "default", label: "default for mode" },
							{ value: "off", label: "off (false)" },
							{ value: "custom", label: "custom object" },
						] satisfies { value: TriggerChoice; label: string }[]
					}
					onChange={(value) => set("trigger", value)}
				/>
				<Slider
					label="threshold"
					value={options.threshold}
					disabled={options.trigger !== "custom"}
					onChange={(value) => set("threshold", value)}
				/>
				<Toggle
					label="once"
					checked={options.once}
					disabled={options.trigger !== "custom"}
					onChange={(value) => set("once", value)}
				/>
				<Toggle
					label="pauseWhenOut"
					checked={options.pauseWhenOut}
					disabled={options.trigger !== "custom"}
					onChange={(value) => set("pauseWhenOut", value)}
				/>
			</Group>

			<Group title="Controls and captions">
				<Choice
					label="controls"
					value={options.controls}
					options={controlChoices}
					onChange={(value) => set("controls", value)}
				/>
				{placementApplies ? (
					<Choice
						label="controlsPlacement"
						value={options.placement}
						options={
							[
								{ value: "overlay", label: "overlay" },
								{ value: "below", label: "below" },
							] satisfies { value: PlacementChoice; label: string }[]
						}
						onChange={(value) => set("placement", value)}
					/>
				) : null}
				{can(provider, "captions") ? (
					<Toggle
						label={`captions="on"${tag(def, "captions")}`}
						checked={options.captions}
						onChange={(value) => set("captions", value)}
					/>
				) : null}
				{can(provider, "chapters") ? (
					<Toggle
						label="chapters (sample 0s / 3s / 6s)"
						checked={options.chapters}
						onChange={(value) => set("chapters", value)}
					/>
				) : null}
				<Choice
					label="labels"
					value={options.labels}
					options={
						[
							{ value: "default", label: "default (English)" },
							{ value: "german", label: "German override" },
						] satisfies { value: LabelsChoice; label: string }[]
					}
					onChange={(value) => set("labels", value)}
				/>
				<TextField
					label="label (accessible name)"
					value={options.label}
					onChange={(value) => set("label", value)}
				/>
			</Group>

			<Group title="Loading">
				<Choice
					label="facade"
					value={options.facade}
					options={
						[
							{ value: "auto", label: "auto" },
							{ value: "on", label: "true" },
							{ value: "off", label: "false" },
						] satisfies { value: FacadeChoice; label: string }[]
					}
					onChange={(value) => set("facade", value)}
				/>
				<Toggle
					label="priority (LCP)"
					checked={options.priority}
					onChange={(value) => set("priority", value)}
				/>
				<Toggle label="eager" checked={options.eager} onChange={(value) => set("eager", value)} />
				<TextField
					label="loadMargin (default 400px)"
					value={options.loadMargin}
					placeholder="400px"
					onChange={(value) => set("loadMargin", value)}
				/>
				<Toggle
					label="mainContent (JSON-LD)"
					checked={options.mainContent}
					onChange={(value) => set("mainContent", value)}
				/>
			</Group>

			<Group title="Poster and layout">
				<Choice
					label="poster"
					value={options.poster}
					options={
						[
							{ value: "default", label: "source default" },
							{
								value: "uploaded",
								label: uploadedPosterAvailable
									? "uploaded image"
									: "uploaded image (fixture missing)",
							},
							{ value: "cleared", label: "none (poster and thumbnail cleared)" },
						] satisfies { value: PosterChoice; label: string }[]
					}
					onChange={(value) => set("poster", value)}
				/>
				{isMux ? (
					<>
						<Toggle
							label="posterTime set"
							checked={options.posterTimeOn}
							onChange={(value) => set("posterTimeOn", value)}
						/>
						<NumberField
							label="posterTime (s)"
							value={options.posterTime}
							min={0}
							step={0.5}
							disabled={!options.posterTimeOn}
							onChange={(value) => set("posterTime", value)}
						/>
					</>
				) : null}
				<Choice
					label="aspectRatio"
					value={options.aspect}
					options={
						[
							{ value: "auto", label: "unset (layout collapse test)" },
							{ value: "16/9", label: "16/9" },
							{ value: "4/3", label: "4/3" },
							{ value: "1/1", label: "1/1" },
							{ value: "9/16", label: "9/16" },
						] satisfies { value: AspectChoice; label: string }[]
					}
					onChange={(value) => set("aspect", value)}
				/>
			</Group>

			{can(provider, "privacy") || isMux ? (
				<Group title={isMux ? "Mux" : "Provider"}>
					{can(provider, "privacy") ? (
						<Toggle
							label={`privacy${tag(def, "privacy")}`}
							checked={options.privacy}
							onChange={(value) => set("privacy", value)}
						/>
					) : null}
					{isMux ? (
						<>
							<Toggle
								label="muxData"
								checked={options.muxData}
								onChange={(value) => set("muxData", value)}
							/>
							<Choice
								label="mux.maxResolution"
								value={options.maxResolution}
								options={
									[
										{ value: "default", label: "default" },
										{ value: "720p", label: "720p" },
										{ value: "1080p", label: "1080p" },
									] satisfies { value: MaxResolution; label: string }[]
								}
								onChange={(value) => set("maxResolution", value)}
							/>
							<Choice
								label="mux.preferPlayback"
								value={options.preferPlayback}
								options={
									[
										{ value: "default", label: "default" },
										{ value: "mse", label: "mse" },
										{ value: "native", label: "native" },
									] satisfies { value: PreferPlayback; label: string }[]
								}
								onChange={(value) => set("preferPlayback", value)}
							/>
						</>
					) : null}
				</Group>
			) : null}

			<Group title="Analytics">
				<Choice
					label="analytics"
					value={options.analytics}
					options={
						[
							{ value: "default", label: "default for mode" },
							{ value: "on", label: "on (10/25/50/75)" },
							{ value: "off", label: "off (false)" },
						] satisfies { value: AnalyticsChoice; label: string }[]
					}
					onChange={(value) => set("analytics", value)}
				/>
				<Toggle
					label="canTrack returns false"
					checked={options.blockTracking}
					onChange={(value) => set("blockTracking", value)}
				/>
			</Group>

			<Actions>
				<Button type="button" onClick={onRemount}>
					Remount
				</Button>
				<Button type="button" onClick={onReset}>
					Reset to scenario
				</Button>
			</Actions>
			<Hint>
				Changing an option remounts the video, except muted, loop, play, startTime, endTime and
				showPause, which update live.
			</Hint>
		</Panel>
	)
}

const Panel = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	`),
])

const Actions = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	`),
])

const Hint = styled("p", [
	f.responsive(css`
		${textStyles.p4}
		opacity: 0.7;
	`),
])
