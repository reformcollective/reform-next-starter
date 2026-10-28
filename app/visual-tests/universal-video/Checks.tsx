"use client"

import type { UniversalVideoHandle, VideoState } from "library/videos/types"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { useEffect, useState, useSyncExternalStore } from "react"

type CheckStatus = "pass" | "fail" | "pending"

export interface CheckResult {
	label: string
	status: CheckStatus
	detail?: string
}

const NO_UNSUBSCRIBE = () => undefined

/** Live state of a UniversalVideo handle, or null until it mounts. */
export function useHandleState(handle: UniversalVideoHandle | null): VideoState | null {
	const subscribe = (listener: () => void) => (handle ? handle.subscribe(listener) : NO_UNSUBSCRIBE)
	const getSnapshot = () => (handle ? handle.getState() : null)
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Re-reads the DOM under `element` on every mutation, resize and image load, and returns the latest result. */
export function useDomProbe<T extends object>(
	element: HTMLElement | null,
	read: (element: HTMLElement) => T,
): T | null {
	const [value, setValue] = useState<T | null>(null)

	useEffect(() => {
		if (!element) return
		const run = () => {
			const next = read(element)
			setValue((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next))
		}
		const mutations = new MutationObserver(run)
		mutations.observe(element, { subtree: true, childList: true, attributes: true })
		const resizes = new ResizeObserver(run)
		resizes.observe(element)
		element.addEventListener("load", run, true)
		return () => {
			mutations.disconnect()
			resizes.disconnect()
			element.removeEventListener("load", run, true)
		}
	}, [element, read])

	return value
}

export function rect(element: Element | null) {
	if (!element) return null
	const box = element.getBoundingClientRect()
	return { top: box.top, bottom: box.bottom, width: box.width, height: box.height }
}

/** pass/fail/pending lines under an example. */
export function Checks({ results }: { results: CheckResult[] }) {
	return (
		<List>
			{results.map((result) => (
				<Item key={result.label} data-status={result.status}>
					<Badge>{result.status.toUpperCase()}</Badge>
					<Text>
						{result.label}
						{result.detail ? ` (${result.detail})` : ""}
					</Text>
				</Item>
			))}
		</List>
	)
}

const List = styled("ul", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	`),
])

const Item = styled("li", [
	f.responsive(css`
		display: flex;
		align-items: baseline;
		gap: 8px;
		--check-color: rgb(128 128 128);

		&[data-status="pass"] {
			--check-color: rgb(30 150 70);
		}

		&[data-status="fail"] {
			--check-color: rgb(210 50 50);
		}
	`),
])

const Badge = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
		flex-shrink: 0;
		min-width: 56px;
		padding: 2px 6px;
		border-radius: 4px;
		color: white;
		text-align: center;
		background: var(--check-color);
	`),
])

const Text = styled("span", [
	f.responsive(css`
		${textStyles.p4}
		overflow-wrap: anywhere;
	`),
])

export const Wide = styled("div", [
	f.responsive(css`
		grid-column: 1 / -1;
		min-width: 0;
	`),
])

export const Row = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	`),
])

export const Button = styled("button", [
	f.responsive(css`
		${textStyles.p3}
		padding: 4px 12px;
		border: 1px solid currentcolor;
		border-radius: 4px;
		cursor: pointer;
	`),
])

export const Mini = styled("code", [
	f.responsive(css`
		${textStyles.p4}
		word-break: break-all;
	`),
])
