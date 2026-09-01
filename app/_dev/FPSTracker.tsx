"use client"

import { css, f, styled } from "library/styled"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const toneFor = (fps: number) => (fps >= 55 ? "good" : fps >= 30 ? "warn" : "bad")

export default function FPSTracker() {
	const debug = useSearchParams().has("debug")
	const [fps, setFps] = useState(0)
	const [low, setLow] = useState(0)
	const frameRef = useRef(0)
	const lastTimeRef = useRef(performance.now())
	const rafRef = useRef<number>(0)
	const recentLows = useRef<number[]>([])

	useEffect(() => {
		if (!debug) return

		const tick = (now: number) => {
			frameRef.current++
			const elapsed = now - lastTimeRef.current

			if (elapsed >= 100) {
				const currentFps = Math.round((frameRef.current / elapsed) * 1000)
				setFps(currentFps)

				recentLows.current.push(currentFps)
				if (recentLows.current.length > 10) recentLows.current.shift()
				setLow(Math.min(...recentLows.current))

				frameRef.current = 0
				lastTimeRef.current = now
			}

			rafRef.current = requestAnimationFrame(tick)
		}

		rafRef.current = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(rafRef.current)
	}, [debug])

	if (!debug) return null

	return (
		<Panel>
			<Col>
				<Label>FPS</Label>
				<Value tone={toneFor(fps)}>{fps}</Value>
			</Col>
			<Divider />
			<Col>
				<Label>LOW</Label>
				<Value tone={toneFor(low)}>{low}</Value>
			</Col>
		</Panel>
	)
}

const Panel = styled("div", [
	f.responsive(css`
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 9999;
		background: rgb(0 0 0 / 80%);
		backdrop-filter: blur(4px);
		border-radius: 8px;
		padding: 10px 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-family: monospace;
		pointer-events: none;
	`),
])

const Col = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	`),
])

const Divider = styled("div", [
	f.responsive(css`
		width: 1px;
		height: 32px;
		background: rgb(255 255 255 / 15%);
	`),
])

const Label = styled("span", [
	f.responsive(css`
		font-size: 9px;
		color: rgb(255 255 255 / 40%);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	`),
])

const Value = styled("span", {
	base: [
		f.responsive(css`
			font-size: 22px;
			font-weight: 700;
			line-height: 1;
		`),
	],
	variants: {
		tone: {
			good: [{ color: "#4ade80" }],
			warn: [{ color: "#facc15" }],
			bad: [{ color: "#f87171" }],
		},
	},
})
