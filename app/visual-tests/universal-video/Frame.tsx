"use client"

import type { UniversalVideoHandle, UniversalVideoProps } from "library/videos/types"
import type { ReactNode } from "react"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { useSyncExternalStore } from "react"

export type ExampleProps = Omit<UniversalVideoProps, "video" | "src" | "playbackId" | "ref">

interface ExampleFrameProps {
	title: string
	scenario?: string
	note?: string
	/** Missing fixture key; renders a placeholder instead of the children. */
	missingKey?: string
	/** Code-only props in use, printed under the example. Functions are omitted. */
	props?: unknown
	children?: ReactNode
}

export function ExampleFrame({
	title,
	scenario,
	note,
	missingKey,
	props,
	children,
}: ExampleFrameProps) {
	const printed = props === undefined ? null : JSON.stringify(props)

	return (
		<Frame>
			<Head>
				{scenario ? <Kicker>{scenario}</Kicker> : null}
				<Title>{title}</Title>
				{note ? <Note>{note}</Note> : null}
			</Head>
			{missingKey ? (
				<Missing>Missing fixture "{missingKey}". Run the seed script.</Missing>
			) : (
				children
			)}
			{printed ? <Props>{printed}</Props> : null}
		</Frame>
	)
}

function LiveState({ controller }: { controller: UniversalVideoHandle }) {
	const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState)
	const errorCode = state.error ? String(state.error.code) : "none"

	return (
		<Readout>
			status={state.status} paused={String(state.paused)} muted={String(state.muted)} t=
			{state.currentTime.toFixed(1)}/{state.duration.toFixed(1)} wanted={String(state.wanted)}/
			{String(state.wantedOrigin)} error={errorCode}
		</Readout>
	)
}

/** Live controller state, read through the example's ref handle. */
export function StateReadout({ controller }: { controller: UniversalVideoHandle | null }) {
	if (!controller) return <Readout>mounting</Readout>
	return <LiveState controller={controller} />
}

const Frame = styled("section", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
		padding: 16px;
		border: 1px solid rgb(128 128 128 / 35%);
		border-radius: 8px;
	`),
])

const Head = styled("header", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 6px;
	`),
])

const Kicker = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
		opacity: 0.6;
		text-transform: uppercase;
	`),
])

const Title = styled("h3", [
	f.responsive(css`
		${textStyles.kicker1}
	`),
])

const Note = styled("p", [
	f.responsive(css`
		${textStyles.p3}
		opacity: 0.8;
	`),
])

const Missing = styled("p", [
	f.responsive(css`
		${textStyles.p3}
		padding: 24px;
		border: 1px dashed currentcolor;
		border-radius: 4px;
	`),
])

const Props = styled("code", [
	f.responsive(css`
		${textStyles.p4}
		word-break: break-all;
		opacity: 0.7;
	`),
])

const Readout = styled("code", [
	f.responsive(css`
		${textStyles.p4}
		word-break: break-all;
	`),
])
