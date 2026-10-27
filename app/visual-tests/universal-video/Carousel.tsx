"use client"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { getVideoDebugStats, UniversalVideo } from "library/videos/UniversalVideo"
import { StrictMode, useEffect, useState } from "react"

import type { ShowcaseCase } from "./types"

import { ExampleFrame } from "./Frame"

const SLIDE_COUNT = 12
const STRESS_INTERVAL_MS = 100
const STRESS_DURATION_MS = 10_000
const STATS_POLL_MS = 500

export function CarouselDemo({ testCase }: { testCase: ShowcaseCase }) {
	const [mounted, setMounted] = useState(true)
	const [stress, setStress] = useState(false)
	const [stats, setStats] = useState({ mounted: 0, observers: 0, playing: 0, elements: 0 })
	const [rejections, setRejections] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => setStats(getVideoDebugStats()), STATS_POLL_MS)
		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		const onRejection = () => setRejections((count) => count + 1)
		window.addEventListener("unhandledrejection", onRejection)
		return () => window.removeEventListener("unhandledrejection", onRejection)
	}, [])

	useEffect(() => {
		if (!stress) return
		const interval = setInterval(() => setMounted((value) => !value), STRESS_INTERVAL_MS)
		const timeout = setTimeout(() => {
			setStress(false)
			setMounted(true)
		}, STRESS_DURATION_MS)
		return () => {
			clearInterval(interval)
			clearTimeout(timeout)
		}
	}, [stress])

	const slides = Array.from({ length: SLIDE_COUNT }, (_, index) => index)

	return (
		<ExampleFrame
			title={testCase.title}
			scenario={testCase.scenario}
			note={testCase.note}
			props={{
				mode: "background",
				loop: true,
				muted: true,
				controls: false,
				loadMargin: "200px",
				slides: SLIDE_COUNT,
				strictMode: true,
			}}
		>
			<Row>
				<Button type="button" onClick={() => setMounted((value) => !value)} disabled={stress}>
					{mounted ? "Unmount carousel" : "Mount carousel"}
				</Button>
				<Button type="button" onClick={() => setStress(true)} disabled={stress}>
					{stress ? "Stressing (10s)" : "Mount/unmount every 100ms for 10s"}
				</Button>
			</Row>
			<Stats>
				mounted={stats.mounted} observers={stats.observers} playing={stats.playing} elements=
				{stats.elements} unhandledrejections={rejections}
			</Stats>
			<StrictMode>
				{mounted ? (
					<Strip>
						{slides.map((index) => (
							<Slide key={index}>
								<UniversalVideo
									video={testCase.video}
									mode="background"
									loop
									muted
									controls={false}
									loadMargin="200px"
									aspectRatio={16 / 9}
									label={`Slide ${index + 1}`}
								/>
								<Index>{index + 1}</Index>
							</Slide>
						))}
					</Strip>
				) : null}
			</StrictMode>
		</ExampleFrame>
	)
}

const Row = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
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

const Stats = styled("code", [
	f.responsive(css`
		${textStyles.p4}
	`),
])

const Strip = styled("div", [
	f.responsive(css`
		display: flex;
		gap: 12px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
	`),
])

const Slide = styled("div", [
	f.responsive(css`
		position: relative;
		flex: 0 0 320px;
		scroll-snap-align: start;
	`),
])

const Index = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
		position: absolute;
		top: 8px;
		left: 8px;
		color: white;
		pointer-events: none;
	`),
])
