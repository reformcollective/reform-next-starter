"use client"

import { createVar } from "@vanilla-extract/css"
import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import ClientOnly from "library/ClientOnly"
import { PageCommitSignal } from "library/link/usePageTransition"
import { css, f, styled } from "library/styled"
import { BackgroundVideo } from "library/videos/BackgroundVideo"
import { CarouselBackgroundVideo } from "library/videos/CarouselBGVideo"
import { MuxVideo } from "library/videos/MuxVideo"
import { useRef, useState } from "react"

const DEFAULT_ID = "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe"
const DEFAULT_DURATION = 134
const BACKGROUNDS = { gray: "#808080", white: "#ffffff", black: "#000000" }
type Background = keyof typeof BACKGROUNDS
const FORMATS = ["jpg", "png", "webp"] as const

const imageUrl = (id: string, format: string, width: number, time?: number) => {
	const timeParam = time === undefined ? "" : `time=${time}&`
	return `https://image.mux.com/${id}/thumbnail.${format}?${timeParam}width=${width}`
}

export default function VideoVisualTestPage() {
	const video = useRef<HTMLVideoElement>(null)
	const [id, setId] = useState(DEFAULT_ID)
	const [width, setWidth] = useState(640)
	const [time, setTime] = useState(30)
	const [duration, setDuration] = useState(DEFAULT_DURATION)
	const [background, setBackground] = useState<Background>("gray")
	const [aspectRatio, setAspectRatio] = useState("16/9")
	const [carouselKey, setCarouselKey] = useState(0)
	const [backgroundKey, setBackgroundKey] = useState(0)

	const blurUrl = imageUrl(id, "webp", 32, 0)
	const bgColor = BACKGROUNDS[background]

	const seek = (value: number) => {
		setTime(value)
		const el = video.current
		if (!el) return
		el.pause()
		el.currentTime = value
	}

	return (
		<Wrapper>
			<PageCommitSignal />
			<Note>
				Compare in Chrome and Safari. The slider drives the video and all posters to the same time.
			</Note>

			<Controls>
				<Field>
					<FieldLabel>Playback ID</FieldLabel>
					<TextInput value={id} onChange={(e) => setId(e.target.value)} />
				</Field>
				<Field>
					<FieldLabel>Width</FieldLabel>
					<TextInput
						type="number"
						value={width}
						onChange={(e) => setWidth(Number(e.target.value) || 640)}
					/>
				</Field>
				<Field>
					<FieldLabel>Time {time.toFixed(2)}s</FieldLabel>
					<input
						type="range"
						min={0}
						max={duration}
						step={0.01}
						value={time}
						onChange={(e) => seek(Number(e.target.value))}
					/>
				</Field>
				<Field>
					<FieldLabel>Exact time (type a value)</FieldLabel>
					<TextInput
						type="number"
						step={0.01}
						min={0}
						value={time}
						onChange={(e) => seek(Math.max(0, Number(e.target.value) || 0))}
					/>
				</Field>
				<Field>
					<FieldLabel>Fine 0 to 0.2s</FieldLabel>
					<input
						type="range"
						min={0}
						max={0.2}
						step={0.005}
						value={Math.min(time, 0.2)}
						onChange={(e) => seek(Number(e.target.value))}
					/>
				</Field>
				<Field>
					<FieldLabel>Background</FieldLabel>
					<Switch>
						{(Object.keys(BACKGROUNDS) as Background[]).map((name) => (
							<button
								type="button"
								key={name}
								data-active={name === background ? true : undefined}
								onClick={() => setBackground(name)}
							>
								{name}
							</button>
						))}
					</Switch>
				</Field>
			</Controls>

			<Heading>Same frame</Heading>
			<Row>
				<Item>
					<Stage boxWidth={width} bg={bgColor}>
						<ClientOnly>
							<MuxVideo
								ref={video}
								playbackId={id}
								muted
								loop
								playsInline
								onTimeUpdate={(e) => {
									const d = e.currentTarget.duration
									if (Number.isFinite(d) && d !== duration) setDuration(d)
								}}
							/>
						</ClientOnly>
					</Stage>
					<Caption>MuxVideo, paused and seeked to {time.toFixed(2)}s</Caption>
				</Item>
				{FORMATS.map((format) => (
					<Item key={format}>
						<Stage boxWidth={width} bg={bgColor}>
							{/* biome-ignore lint/performance/noImgElement: remote Mux poster under test */}
							<img src={imageUrl(id, format, width, time)} alt="" />
						</Stage>
						<Caption>
							thumbnail.{format}?time={time}&amp;width={width}
						</Caption>
					</Item>
				))}
			</Row>

			<Heading>Default frame vs time=0</Heading>
			<Row>
				{(["jpg", "webp"] as const).flatMap((format) => [
					<Item key={`${format}-0`}>
						<Stage boxWidth={width} bg={bgColor}>
							{/* biome-ignore lint/performance/noImgElement: remote Mux poster under test */}
							<img src={imageUrl(id, format, width, 0)} alt="" />
						</Stage>
						<Caption>
							thumbnail.{format}?time=0&amp;width={width}
						</Caption>
					</Item>,
					<Item key={`${format}-default`}>
						<Stage boxWidth={width} bg={bgColor}>
							{/* biome-ignore lint/performance/noImgElement: remote Mux poster under test */}
							<img src={imageUrl(id, format, width)} alt="" />
						</Stage>
						<Caption>
							thumbnail.{format}?width={width} (no time)
						</Caption>
					</Item>,
				])}
			</Row>

			<Heading>Old placeholder</Heading>
			<Item>
				<Stage boxWidth={width} bg={bgColor}>
					{/* biome-ignore lint/performance/noImgElement: remote Mux poster under test */}
					<img src={blurUrl} alt="" />
				</Stage>
				<Caption>
					thumbnail.webp?time=0&amp;width=32, scaled up: what the old blur layer looked like
				</Caption>
			</Item>

			<Heading>Real library components</Heading>
			<Controls>
				<Field>
					<FieldLabel>Aspect ratio</FieldLabel>
					<TextInput value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} />
				</Field>
			</Controls>
			<Row>
				<Item>
					<Box bg={bgColor}>
						<CarouselBackgroundVideo
							key={carouselKey}
							playbackId={id}
							videoBlurUrl={blurUrl}
							videoAspectRatio={aspectRatio}
							onLoadedMetadata={setDuration}
							eager
							muted
							loop
						/>
					</Box>
					<Caption>
						CarouselBackgroundVideo: persistent poster under the video, fades in on canplay.
					</Caption>
					<button type="button" onClick={() => setCarouselKey((k) => k + 1)}>
						Replay
					</button>
				</Item>
				<Item>
					<Box bg={bgColor}>
						<BackgroundVideo
							key={backgroundKey}
							playbackId={id}
							videoBlurUrl={blurUrl}
							videoAspectRatio={aspectRatio}
							eager
							muted
							loop
						/>
					</Box>
					<Caption>BackgroundVideo: the original background video component.</Caption>
					<button type="button" onClick={() => setBackgroundKey((k) => k + 1)}>
						Replay
					</button>
				</Item>
			</Row>
		</Wrapper>
	)
}

const boxWidthVar = createVar()
const bgVar = createVar()

const Wrapper = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 48px 0;
	`),
])

const Note = styled("p", [
	f.responsive(css`
		${textStyles.p1}
	`),
])

const Heading = styled("h2", [
	f.responsive(css`
		${textStyles.h3}
	`),
])

const Caption = styled("p", [
	f.responsive(css`
		${textStyles.p2}
		max-width: 400px;
	`),
])

const Controls = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: flex-end;
	`),
])

const FieldLabel = styled("span", [
	f.responsive(css`
		${textStyles.p2}
	`),
])

const Field = styled("label", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
	`),
])

const TextInput = styled("input", [
	f.responsive(css`
		${textStyles.p2}
		padding: 8px 12px;
		border: 1px solid ${colors.black};
		min-width: 120px;
	`),
])

const Switch = styled("div", [
	f.responsive(css`
		display: flex;
		gap: 8px;

		& button {
			${textStyles.p2}
			padding: 8px 12px;
			border: 1px solid ${colors.black};
		}

		& button[data-active] {
			background: ${colors.black};
			color: ${colors.white};
		}
	`),
])

const Row = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: flex-start;
	`),
])

const Item = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: flex-start;
	`),
])

const Stage = styled("div", {
	base: [
		f.unresponsive(css`
			width: ${boxWidthVar};
			max-width: 100%;
			background: ${bgVar};

			& img,
			& video,
			& mux-video {
				display: block;
				width: 100%;
				height: auto;
			}
		`),
	],
	tokens: {
		boxWidth: { token: boxWidthVar, unit: "px" },
		bg: bgVar,
	},
})

const Box = styled("div", {
	base: [
		f.unresponsive(css`
			width: 320px;
			background: ${bgVar};
			border: 1px solid ${colors.black};
		`),
	],
	tokens: {
		bg: bgVar,
	},
})
