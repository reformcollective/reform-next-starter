"use client"

import type { UniversalVideoHandle, VideoState } from "library/videos/types"
import type { ReactNode } from "react"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { useEffect, useRef } from "react"

import type { SandboxDef } from "./sandboxModel"

import { type CheckResult, Checks } from "./Checks"
import { CopyButton } from "./CopyButton"
import { entryLine, useEventLog } from "./EventLog"
import { buildReport } from "./report"
import { availability, type Scenario } from "./scenarios"

/** Copies the whole page report, including the selected source, scenario and expectation results. */
export function CopyEverything() {
	const { entries, stub } = useEventLog()

	return (
		<CopyButton
			label="Copy everything"
			getText={() =>
				buildReport(
					entries.map((entry) => entryLine(entry)),
					stub,
				)
			}
		/>
	)
}

/** A collapsed-by-default section. The body grows to its full height and never scrolls. */
export function Accordion({ title, children }: { title: ReactNode; children: ReactNode }) {
	return (
		<Details>
			<Summary>{title}</Summary>
			<Body>{children}</Body>
		</Details>
	)
}

interface SourceSwitcherProps {
	defs: SandboxDef[]
	activeId: string
	onSelect: (id: string) => void
}

/** One click per source. Only the active source's video is ever mounted. */
export function SourceSwitcher({ defs, activeId, onSelect }: SourceSwitcherProps) {
	return (
		<Block>
			<Kicker>Source</Kicker>
			<SourceGrid>
				{defs.map((def) => (
					<SourceButton
						key={def.id}
						type="button"
						aria-pressed={def.id === activeId}
						data-active={def.id === activeId ? "" : undefined}
						onClick={() => onSelect(def.id)}
					>
						{def.short}
					</SourceButton>
				))}
			</SourceGrid>
		</Block>
	)
}

interface ScenarioPickerProps {
	def: SandboxDef
	scenarios: Scenario[]
	activeId: string
	onSelect: (id: string) => void
}

function isFormTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false
	return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

/** Scenario buttons for the active source. Left/right arrows anywhere, up/down while focus is in the list. */
export function ScenarioPicker({ def, scenarios, activeId, onSelect }: ScenarioPickerProps) {
	const root = useRef<HTMLDivElement>(null)
	const enabled = scenarios.filter(
		(scenario) => availability(def, scenario).state !== "unavailable",
	)
	const position = enabled.findIndex((scenario) => scenario.id === activeId)
	const active = scenarios.find((scenario) => scenario.id === activeId)
	const activeAvailability = active ? availability(def, active) : null

	const step = (direction: 1 | -1) => {
		if (enabled.length === 0) return
		const from = position === -1 ? (direction === 1 ? -1 : 0) : position
		const next = enabled[(from + direction + enabled.length) % enabled.length]
		if (next) onSelect(next.id)
	}

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.altKey || event.ctrlKey || event.metaKey || isFormTarget(event.target)) return
			const inside = root.current ? root.current.contains(document.activeElement) : false
			let direction: 1 | -1 | 0 = 0
			if (event.key === "ArrowRight" || (inside && event.key === "ArrowDown")) direction = 1
			else if (event.key === "ArrowLeft" || (inside && event.key === "ArrowUp")) direction = -1
			if (direction === 0) return
			event.preventDefault()
			step(direction)
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	})

	return (
		<Block ref={root}>
			<HeadRow>
				<Kicker>
					Scenario {position === -1 ? "-" : position + 1} / {enabled.length}
				</Kicker>
				<Pair>
					<MiniButton type="button" onClick={() => step(-1)} aria-label="Previous scenario">
						Prev
					</MiniButton>
					<MiniButton type="button" onClick={() => step(1)} aria-label="Next scenario">
						Next
					</MiniButton>
				</Pair>
			</HeadRow>
			<ScenarioGrid>
				{scenarios.map((scenario, index) => {
					const state = availability(def, scenario)
					return (
						<ScenarioButton
							key={scenario.id}
							type="button"
							disabled={state.state === "unavailable"}
							title={state.reason ?? scenario.description}
							aria-pressed={scenario.id === activeId}
							data-active={scenario.id === activeId ? "" : undefined}
							data-state={state.state}
							onClick={() => onSelect(scenario.id)}
						>
							{index + 1}. {scenario.title}
							{state.state === "best-effort" ? " ~" : ""}
						</ScenarioButton>
					)
				})}
			</ScenarioGrid>
			{active ? (
				<ActiveBox>
					<ActiveTitle>{active.title}</ActiveTitle>
					<span>{active.description}</span>
					{activeAvailability && activeAvailability.reason ? (
						<Reason data-state={activeAvailability.state}>{activeAvailability.reason}</Reason>
					) : null}
				</ActiveBox>
			) : null}
		</Block>
	)
}

/** "What you should see" with a live PASS, FAIL or PENDING per expectation. */
export function Checklist({ results }: { results: CheckResult[] }) {
	const passed = results.filter((result) => result.status === "pass").length
	const failed = results.filter((result) => result.status === "fail").length

	return (
		<Block>
			<HeadRow>
				<Kicker>What you should see</Kicker>
				<Summary2 data-fail={failed > 0 ? "" : undefined}>
					{passed}/{results.length} pass{failed > 0 ? `, ${failed} fail` : ""}
				</Summary2>
			</HeadRow>
			<Checks results={results} />
		</Block>
	)
}

export type ScrollWhere = "video" | "past" | "above" | "cover" | "half" | "reveal"

const SCROLL_LABELS: Record<ScrollWhere, string> = {
	video: "Scroll to video",
	past: "Scroll past video",
	above: "Scroll above video",
	cover: "Scroll to cover",
	half: "Scroll half uncovered",
	reveal: "Scroll to uncovered",
}

const DEFAULT_SCROLL: ScrollWhere[] = ["video", "past", "above"]

interface QuickActionsProps {
	handle: UniversalVideoHandle | null
	state: VideoState | null
	onRemount: () => void
	/** Scrolls the page to the video or past it. Shown only for the scroll-based scenarios. */
	onScroll?: (where: ScrollWhere) => void
	/** Which scroll buttons to show; defaults to video, past and above. */
	scrollTargets?: ScrollWhere[]
}

export function QuickActions({
	handle,
	state,
	onRemount,
	onScroll,
	scrollTargets = DEFAULT_SCROLL,
}: QuickActionsProps) {
	const off = handle === null
	const duration = state ? state.duration : 0
	const muted = state ? state.muted : false

	return (
		<Block>
			<Kicker>Quick actions</Kicker>
			<ActionGrid>
				<MiniButton
					type="button"
					disabled={off}
					onClick={() => handle?.play().catch(() => undefined)}
				>
					Play
				</MiniButton>
				<MiniButton type="button" disabled={off} onClick={() => handle?.pause()}>
					Pause
				</MiniButton>
				<MiniButton type="button" disabled={off} onClick={() => handle?.restart()}>
					Restart
				</MiniButton>
				<MiniButton type="button" disabled={off} onClick={() => handle?.setMuted(!muted)}>
					{muted ? "Unmute" : "Mute"} toggle
				</MiniButton>
				<MiniButton type="button" disabled={off} onClick={() => handle?.seek(0)}>
					Seek to 0
				</MiniButton>
				<MiniButton
					type="button"
					disabled={off || duration <= 0}
					onClick={() => handle?.seek(duration / 2)}
				>
					Seek to 50%
				</MiniButton>
				<MiniButton type="button" disabled={off} onClick={() => handle?.retry()}>
					Retry
				</MiniButton>
				<MiniButton type="button" disabled={off} onClick={() => handle?.releaseManualControl()}>
					Release control
				</MiniButton>
				<MiniButton type="button" onClick={onRemount}>
					Remount
				</MiniButton>
				{onScroll
					? scrollTargets.map((where) => (
							<MiniButton key={where} type="button" onClick={() => onScroll(where)}>
								{SCROLL_LABELS[where]}
							</MiniButton>
						))
					: null}
			</ActionGrid>
		</Block>
	)
}

export const Code = styled("code", [
	f.responsive(css`
		${textStyles.p4}
		white-space: pre-wrap;
		word-break: break-all;
	`),
])

const Block = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	`),
])

const Kicker = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
		opacity: 0.6;
		text-transform: uppercase;
	`),
])

const HeadRow = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	`),
])

const Pair = styled("div", [
	f.responsive(css`
		display: flex;
		gap: 6px;
	`),
])

const Summary2 = styled("span", [
	f.responsive(css`
		${textStyles.p4}

		&[data-fail] {
			color: rgb(210 50 50);
		}
	`),
])

const MiniButton = styled("button", [
	f.responsive(css`
		${textStyles.p4}
		padding: 4px 8px;
		border: 1px solid currentcolor;
		border-radius: 4px;
		cursor: pointer;

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	`),
])

const SourceGrid = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 4px;
	`),
])

const SourceButton = styled("button", [
	f.responsive(css`
		${textStyles.p4}
		padding: 5px 2px;
		border: 1px solid rgb(128 128 128 / 60%);
		border-radius: 4px;
		cursor: pointer;

		&[data-active] {
			border-color: CanvasText;
			background: CanvasText;
			color: Canvas;
		}
	`),
])

const ScenarioGrid = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 4px;
	`),
])

const ScenarioButton = styled("button", [
	f.responsive(css`
		${textStyles.p4}
		padding: 6px 8px;
		border: 1px solid rgb(128 128 128 / 60%);
		border-radius: 4px;
		text-align: left;
		cursor: pointer;

		&[data-active] {
			border-color: CanvasText;
			background: CanvasText;
			color: Canvas;
		}

		&:disabled {
			opacity: 0.35;
			cursor: not-allowed;
			text-decoration: line-through;
		}
	`),
])

const ActiveBox = styled("p", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 6px 8px;
		border-left: 3px solid CanvasText;
		background: rgb(128 128 128 / 12%);
	`),
])

const ActiveTitle = styled("strong", [
	f.responsive(css`
		${textStyles.p3}
	`),
])

const Reason = styled("span", [
	f.responsive(css`
		&[data-state="unavailable"] {
			color: rgb(210 50 50);
		}

		&[data-state="best-effort"] {
			color: rgb(190 120 0);
		}
	`),
])

const ActionGrid = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 4px;
	`),
])

const Details = styled("details", [
	f.responsive(css`
		min-width: 0;
		border-top: 1px solid rgb(128 128 128 / 35%);
		padding-top: 4px;
	`),
])

const Summary = styled("summary", [
	f.responsive(css`
		${textStyles.p4}
		cursor: pointer;
	`),
])

const Body = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		padding-top: 8px;
	`),
])
