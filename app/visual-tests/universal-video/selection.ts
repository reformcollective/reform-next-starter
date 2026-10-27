import { useSyncExternalStore } from "react"

const EVENT = "uv-selection"

function subscribe(listener: () => void) {
	window.addEventListener("popstate", listener)
	window.addEventListener(EVENT, listener)
	return () => {
		window.removeEventListener("popstate", listener)
		window.removeEventListener(EVENT, listener)
	}
}

const getSearch = () => window.location.search
const getServerSearch = () => ""

/** The source and scenario ids from `?source=...&scenario=...` (not the hash: the preloader treats a hash as a selector), and a setter that rewrites the query in place. */
export function useSelection() {
	const search = useSyncExternalStore(subscribe, getSearch, getServerSearch)
	const params = new URLSearchParams(search)
	const source = params.get("source")
	const scenario = params.get("scenario")

	const select = (next: { source?: string; scenario?: string }) => {
		const updated = new URLSearchParams(window.location.search)
		if (next.source) updated.set("source", next.source)
		if (next.scenario) updated.set("scenario", next.scenario)
		window.history.replaceState(
			null,
			"",
			`${window.location.pathname}?${updated.toString()}${window.location.hash}`,
		)
		window.dispatchEvent(new Event(EVENT))
	}

	return { source, scenario, select }
}
