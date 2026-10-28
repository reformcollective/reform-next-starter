import { useEffect } from "react"

import { getConsoleCapture } from "./consoleCapture"

interface Writer {
	title: string
	text: () => string
}

const ratios = new Map<string, number>()
const writers = new Map<string, Writer>()

export function setScenarioRatio(id: string, ratio: number) {
	ratios.set(id, ratio)
}

/** Registers how to describe a scenario in the page report while it is mounted. */
export function useScenarioWriter(id: string, title: string, text: () => string) {
	useEffect(() => {
		writers.set(id, { title, text })
		return () => {
			writers.delete(id)
		}
	})
}

function activeScenario() {
	let best: { id: string; ratio: number; writer: Writer } | null = null
	for (const [id, writer] of writers) {
		const ratio = ratios.get(id) ?? 0
		if (!best || ratio > best.ratio) best = { id, ratio, writer }
	}
	return best
}

/** One plain-text report of the page environment, the scenario most in view, events and console output. */
export function buildReport(events: string[], dataLayerStub: boolean) {
	const active = activeScenario()
	const out: string[] = [
		"UniversalVideo showcase report",
		`time: ${new Date().toISOString()}`,
		`href: ${location.href}`,
		`userAgent: ${navigator.userAgent}`,
		`window: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}x`,
		`window.dataLayer stub: ${dataLayerStub ? "on" : "off"}`,
		"",
	]
	if (active) {
		out.push(
			`== Active scenario: ${active.writer.title} (${active.id}, ${Math.round(active.ratio * 100)}% visible) ==`,
		)
		out.push(active.writer.text())
	} else {
		out.push("== Active scenario: none mounted ==")
	}
	out.push("", `== Events captured (${events.length}) ==`, ...events)
	const consoleLines = getConsoleCapture()
	out.push(
		"",
		`== Console errors and warnings since page load (${consoleLines.length}) ==`,
		...consoleLines,
	)
	return out.join("\n")
}
