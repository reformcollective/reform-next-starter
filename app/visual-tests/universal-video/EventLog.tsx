"use client"

import type { ReactNode } from "react"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

type Channel = "dataLayer" | "onVideoEvent" | "handler"

export interface LogEntry {
	id: number
	channel: Channel
	label: string
	text: string
}

interface EventLogValue {
	entries: LogEntry[]
	add: (channel: Channel, label: string, detail: unknown) => void
	clear: () => void
	stub: boolean
	setStub: (stub: boolean) => void
}

const MAX_ENTRIES = 200
const SHOWN = 15

const EventLogContext = createContext<EventLogValue | null>(null)

export function useEventLog(): EventLogValue {
	const value = useContext(EventLogContext)
	if (!value) throw new Error("useEventLog must be used under EventLogProvider")
	return value
}

function summarize(detail: unknown): string {
	if (typeof detail === "string") return detail
	return JSON.stringify(detail)
}

/** Feeds the log from `window.dataLayer` pushes while the stub is on. With it off, no dataLayer exists and the component must push nothing. */
export function EventLogProvider({ children }: { children: ReactNode }) {
	const [entries, setEntries] = useState<LogEntry[]>([])
	const [stub, setStub] = useState(true)
	const nextId = useRef(0)

	const add = useCallback((channel: Channel, label: string, detail: unknown) => {
		const id = nextId.current
		nextId.current += 1
		const text = summarize(detail)
		setEntries((previous) => [...previous.slice(-(MAX_ENTRIES - 1)), { id, channel, label, text }])
	}, [])

	const clear = useCallback(() => {
		setEntries([])
	}, [])

	useEffect(() => {
		if (!stub) return
		const layer: unknown[] = []
		const originalPush = layer.push.bind(layer)
		layer.push = (...items: unknown[]) => {
			for (const item of items) {
				const name: unknown =
					typeof item === "object" && item !== null ? Reflect.get(item, "event") : null
				const label = typeof name === "string" ? name : "push"
				add("dataLayer", label, item)
			}
			return originalPush(...items)
		}
		Reflect.set(window, "dataLayer", layer)
		return () => {
			Reflect.deleteProperty(window, "dataLayer")
		}
	}, [stub, add])

	return (
		<EventLogContext value={{ entries, add, clear, stub, setStub }}>{children}</EventLogContext>
	)
}

export function entryLine(entry: LogEntry) {
	return `${entry.channel} / ${entry.label}: ${entry.text}`
}

/** Switches the `window.dataLayer` stub. With it off, analytics-enabled videos must push nothing. */
export function DataLayerToggle() {
	const { stub, setStub } = useEventLog()

	return (
		<Toggle>
			<input type="checkbox" checked={stub} onChange={(event) => setStub(event.target.checked)} />
			<ToggleText>window.dataLayer stub present (off: analytics must push nothing)</ToggleText>
		</Toggle>
	)
}

/** Newest-first event list; `match` limits it to the entries of one scenario. */
export function EventLogList({
	match,
	title,
}: {
	match?: (entry: LogEntry) => boolean
	title: string
}) {
	const { entries, clear } = useEventLog()
	const shown = (match ? entries.filter(match) : entries).toReversed().slice(0, SHOWN)

	return (
		<Panel>
			<Header>
				<Heading>
					{title} (newest {SHOWN})
				</Heading>
				<Button type="button" onClick={clear}>
					Clear all
				</Button>
			</Header>
			<List>
				{shown.length === 0 ? <Hint>No events yet.</Hint> : null}
				{shown.map((entry) => (
					<Row key={entry.id} data-channel={entry.channel}>
						<Tag>
							{entry.channel} / {entry.label}
						</Tag>
						<Body>{entry.text}</Body>
					</Row>
				))}
			</List>
		</Panel>
	)
}

const Panel = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border: 1px solid rgb(128 128 128 / 40%);
		border-radius: 8px;
		background: rgb(128 128 128 / 8%);
	`),
])

const Header = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		justify-content: space-between;
	`),
])

const Heading = styled("h3", [
	f.responsive(css`
		${textStyles.kicker1}
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

const Hint = styled("p", [
	f.responsive(css`
		${textStyles.p4}
		opacity: 0.7;
	`),
])

const List = styled("ol", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	`),
])

const Row = styled("li", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-bottom: 8px;
		border-bottom: 1px solid rgb(128 128 128 / 25%);
	`),
])

const Tag = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
	`),
])

const Body = styled("code", [
	f.responsive(css`
		${textStyles.p4}
		word-break: break-all;
	`),
])
