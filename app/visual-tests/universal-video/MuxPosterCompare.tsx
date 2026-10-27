"use client"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { useVideo, useVideoContext } from "library/videos/controller/useVideo"
import { DefaultControls } from "library/videos/parts/DefaultControls"
import { DEFAULT_MUX_POSTER_TIME } from "library/videos/poster/posterUrls"
import { UniversalVideo } from "library/videos/UniversalVideo"

import { ExampleFrame } from "./Frame"

const PLAYBACK_ID = "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe"

const VARIANTS: { label: string; posterTime?: number; brightness: number }[] = [
	{ label: "posterTime={0.04}", posterTime: 0.04, brightness: 81 },
	{ label: "posterTime={0.1}", posterTime: 0.1, brightness: 81 },
	{ label: "posterTime={0}", posterTime: 0, brightness: 38 },
	{ label: "posterTime={1}", posterTime: 1, brightness: 82 },
	{ label: "no posterTime (library default, 0.04)", brightness: 81 },
]

function thumbnailUrl(posterTime: number | undefined) {
	const base = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg`
	return `${base}?time=${posterTime ?? DEFAULT_MUX_POSTER_TIME}`
}

function Probe() {
	const { state, media } = useVideo()
	const { playerMounted } = useVideoContext()
	const element = media?.firstElementChild
	const video = element && element instanceof HTMLMediaElement ? element : null
	const readyState = video ? video.readyState : "no element"
	const networkState = video ? video.networkState : "no element"
	const mediaError = video?.error ? `${video.error.code} ${video.error.message}` : "none"
	const error = state.error ? `${state.error.code} ${state.error.message}` : "none"
	return (
		<ProbeText>
			status {state.status} | mounted {String(playerMounted)} | readyState {readyState} |
			networkState {networkState} | time {state.currentTime.toFixed(2)} | media error {mediaError} |
			error {error}
		</ProbeText>
	)
}

export function MuxPosterCompare() {
	return (
		<ExampleFrame
			title="Mux poster by posterTime (poster only, nothing plays)"
			scenario="poster"
			note="One 134 s asset that fades up from black. Click mode, so each poster stays visible. Brightness is the 0-255 average of the raw thumbnail."
			props={{ playbackId: PLAYBACK_ID, mode: "click", aspectRatio: "16/9" }}
		>
			<Row>
				{VARIANTS.map((variant) => {
					const url = thumbnailUrl(variant.posterTime)
					return (
						<Cell key={variant.label}>
							<Label>{variant.label}</Label>
							<UniversalVideo
								playbackId={PLAYBACK_ID}
								mode="click"
								posterTime={variant.posterTime}
								aspectRatio={16 / 9}
							>
								<DefaultControls />
								<Probe />
							</UniversalVideo>
							<Url>
								{url} (brightness {variant.brightness})
							</Url>
						</Cell>
					)
				})}
			</Row>
		</ExampleFrame>
	)
}

const Row = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	`),
	f.small(css`
		grid-template-columns: minmax(0, 1fr);
	`),
])

const Cell = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	`),
])

const Label = styled("code", [
	f.responsive(css`
		${textStyles.kicker2}
	`),
])

const Url = styled("code", [
	f.responsive(css`
		${textStyles.p4}
		word-break: break-all;
		opacity: 0.7;
	`),
])

const ProbeText = styled("code", [
	f.responsive(css`
		${textStyles.p4}
		position: absolute;
		inset: auto 0 0;
		padding: 4px 6px;
		background: rgb(0 0 0 / 70%);
		color: #fff;
		pointer-events: none;
	`),
])
