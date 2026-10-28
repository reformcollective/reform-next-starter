"use client"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import {
	getVideoDebugEntries,
	isVideoDebug,
	setVideoDebug,
	subscribeVideoDebug,
	type VideoDebugEntry,
} from "library/videos/debug"
import { useEffect, useState, useSyncExternalStore } from "react"

import { CopyButton } from "./CopyButton"

const MAX_HISTORY = 200
const SHOWN = 15
const NO_ENTRIES: VideoDebugEntry[] = []
const history = new Map<string, VideoDebugEntry[]>()

/** The library keeps 20 records per label; this keeps up to 200 so a copied log is complete. */
function remember(label: string) {
	const known = history.get(label) ?? NO_ENTRIES
	const lastId = known.at(-1)?.id ?? 0
	const fresh = getVideoDebugEntries(label).filter((entry) => entry.id > lastId)
	if (fresh.length > 0) history.set(label, [...known, ...fresh].slice(-MAX_HISTORY))
}

const getServerLogging = () => false

function getHistory(label: string) {
	remember(label)
	return history.get(label) ?? NO_ENTRIES
}

/** Every remembered debug record of one label as plain text. */
export function debugLogText(label: string) {
	const entries = getHistory(label)
	if (entries.length === 0) return "(no debug records)"
	return entries
		.map(
			(entry) =>
				`${(entry.time / 1000).toFixed(2)}s ${entry.level === "warn" ? "WARN " : ""}${entry.text}`,
		)
		.join("\n")
}

if (typeof window !== "undefined" && Reflect.get(window, "__UV_DEBUG") === undefined) {
	setVideoDebug(true)
}

/** Switches `window.__UV_DEBUG`, which every UniversalVideo on the page reads. On by default. */
export function DebugToggle() {
	const [on, setOn] = useState(true)

	useEffect(() => {
		setVideoDebug(on)
	}, [on])

	return (
		<Toggle>
			<input
				type="checkbox"
				checked={on}
				onChange={(event) => {
					setOn(event.target.checked)
				}}
			/>
			<ToggleText>
				Video debug logging (window.__UV_DEBUG, console and the logs under each example)
			</ToggleText>
		</Toggle>
	)
}

/** Debug records of one example (last 200 kept, newest 15 shown; Copy log has all), collapsed by default, with a copy button. */
export function DebugLog({ label }: { label: string }) {
	const entries = useSyncExternalStore(
		(listener) => subscribeVideoDebug(label, listener),
		() => getHistory(label),
		() => NO_ENTRIES,
	)
	const logging = useSyncExternalStore(
		(listener) => subscribeVideoDebug(label, listener),
		isVideoDebug,
		getServerLogging,
	)
	const warnings = entries.filter((entry) => entry.level === "warn").length

	return (
		<Details>
			<Summary data-warn={warnings > 0 ? "" : undefined}>
				Debug log: {entries.length} events, {warnings} warnings
				{logging ? "" : " (logging is off)"}
			</Summary>
			<CopyButton label="Copy log" getText={() => debugLogText(label)} />
			<List>
				{entries.slice(-SHOWN).map((entry) => (
					<Item key={entry.id} data-level={entry.level}>
						{(entry.time / 1000).toFixed(2)}s {entry.level === "warn" ? "WARN " : ""}
						{entry.text}
					</Item>
				))}
			</List>
		</Details>
	)
}

const Toggle = styled("label", [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 8px;
	`),
])

const ToggleText = styled("span", [
	f.responsive(css`
		${textStyles.p3}
	`),
])

const Details = styled("details", [
	f.responsive(css`
		min-width: 0;
	`),
])

const Summary = styled("summary", [
	f.responsive(css`
		${textStyles.p4}
		cursor: pointer;

		&[data-warn] {
			color: #c62828;
		}
	`),
])

const List = styled("ol", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 4px 0 0;
		padding: 0;
		list-style: none;
	`),
])

const Item = styled("li", [
	f.responsive(css`
		${textStyles.p4}
		word-break: break-all;

		&[data-level="warn"] {
			color: #c62828;
			font-weight: 700;
		}
	`),
])
