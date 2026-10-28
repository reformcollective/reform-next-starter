const MAX_LINES = 200
const INSTALLED = "__uvShowcaseConsole"

const lines: string[] = []

function stringify(value: unknown) {
	if (value instanceof Error) return `${value.name}: ${value.message}`
	if (typeof value === "string") return value
	return JSON.stringify(value, (_key, item: unknown) =>
		item instanceof Error ? item.message : item,
	)
}

function add(kind: string, parts: unknown[]) {
	const text = parts.map(stringify).join(" ")
	lines.push(`${(performance.now() / 1000).toFixed(2)}s ${kind} ${text}`)
	if (lines.length > MAX_LINES) lines.shift()
}

if (typeof window !== "undefined" && Reflect.get(window, INSTALLED) !== true) {
	Reflect.set(window, INSTALLED, true)
	const originalError = console.error.bind(console)
	const originalWarn = console.warn.bind(console)
	console.error = (...parts: unknown[]) => {
		add("console.error", parts)
		originalError(...parts)
	}
	console.warn = (...parts: unknown[]) => {
		add("console.warn", parts)
		originalWarn(...parts)
	}
	window.addEventListener("error", (event) => add("window.error", [event.message]))
	window.addEventListener("unhandledrejection", (event) =>
		add("unhandledrejection", [event.reason]),
	)
}

/** Console errors and warnings, window errors and unhandled rejections since this module loaded. */
export function getConsoleCapture() {
	return lines.slice()
}
