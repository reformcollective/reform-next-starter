"use client"

import type { UniversalVideoHandle } from "library/videos/types"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { UniversalVideo } from "library/videos/UniversalVideo"
import { useEffect, useRef, useState } from "react"

import type { ShowcaseCase } from "./types"

import { useEventLog } from "./EventLog"
import { ExampleFrame, StateReadout } from "./Frame"

type Hiding = "visible" | "display" | "visibility" | "offscreen" | "fade"

const CASES: { hiding: Exclude<Hiding, "visible">; label: string }[] = [
	{ hiding: "display", label: "(a) ancestor display:none" },
	{ hiding: "visibility", label: "(b) visibility:hidden" },
	{ hiding: "offscreen", label: "(c) offscreen transform" },
	{ hiding: "fade", label: "(e) opacity 0 to 1 crossfade" },
]

const HIDDEN_FOR_MS = 1500

export function SafariHiddenDemo({ testCase }: { testCase: ShowcaseCase }) {
	const [hiding, setHiding] = useState<Hiding>("visible")
	const [handle, setHandle] = useState<UniversalVideoHandle | null>(null)
	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
	const { add } = useEventLog()

	useEffect(
		() => () => {
			if (timeout.current) clearTimeout(timeout.current)
		},
		[],
	)

	const run = (next: Exclude<Hiding, "visible">) => {
		if (timeout.current) clearTimeout(timeout.current)
		setHiding(next)
		add("handler", "safari", `hidden with ${next} for ${HIDDEN_FOR_MS}ms`)
		timeout.current = setTimeout(() => {
			setHiding("visible")
			add("handler", "safari", "visible again")
		}, HIDDEN_FOR_MS)
	}

	return (
		<ExampleFrame
			title={testCase.title}
			scenario={testCase.scenario}
			note={`${testCase.note} Also test (d) switch tabs and back, and (f) navigate away and use back/forward.`}
			props={{ mode: "background", loop: true, muted: true, controls: false, trigger: true }}
		>
			<Row>
				{CASES.map((item) => (
					<Button key={item.hiding} type="button" onClick={() => run(item.hiding)}>
						{item.label}
					</Button>
				))}
			</Row>
			<Hider hiding={hiding}>
				<UniversalVideo
					video={testCase.video}
					mode="background"
					loop
					muted
					controls={false}
					aspectRatio={16 / 9}
					ref={setHandle}
					label="Safari hidden video"
				/>
			</Hider>
			<StateReadout controller={handle} />
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

const Hider = styled("div", {
	base: [
		f.unresponsive(css`
			transition: opacity 600ms ease;
		`),
	],
	variants: {
		hiding: {
			visible: [{ opacity: 1 }],
			display: [{ display: "none" }],
			visibility: [{ visibility: "hidden" }],
			offscreen: [{ transform: "translateX(-200vw)" }],
			fade: [{ opacity: 0 }],
		},
	},
	defaultVariants: { hiding: "visible" },
})
