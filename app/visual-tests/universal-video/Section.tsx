"use client"

import type { ReactNode } from "react"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { useEffect, useRef, useState } from "react"

import { setScenarioRatio, useScenarioWriter } from "./report"

interface SectionProps {
	id: string
	kicker?: string
	title?: string
	note?: string
	/** Receives whether the section is within one viewport height of the screen. */
	children: (near: boolean) => ReactNode
}

const THRESHOLDS = [0, 0.1, 0.25, 0.5, 0.75, 1]

export function Section({ id, kicker, title, note, children }: SectionProps) {
	const ref = useRef<HTMLElement>(null)
	const [near, setNear] = useState(false)

	useEffect(() => {
		const element = ref.current
		if (!element) return
		const nearObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) setNear(entry.isIntersecting)
			},
			{ rootMargin: "100% 0px" },
		)
		const ratioObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) setScenarioRatio(id, entry.intersectionRatio)
			},
			{ threshold: THRESHOLDS },
		)
		nearObserver.observe(element)
		ratioObserver.observe(element)
		return () => {
			nearObserver.disconnect()
			ratioObserver.disconnect()
			setScenarioRatio(id, 0)
		}
	}, [id])

	return (
		<Frame id={id} ref={ref}>
			{kicker || title || note ? (
				<Head>
					{kicker ? <Kicker>{kicker}</Kicker> : null}
					{title ? <Title>{title}</Title> : null}
					{note ? <Note>{note}</Note> : null}
				</Head>
			) : null}
			{children(near)}
		</Frame>
	)
}

/** Light stand-in that holds the space of a scenario that is not near the viewport. */
export function Idle({ text }: { text: string }) {
	return <IdleBox>{text}</IdleBox>
}

/** An extra scenario whose content mounts only while it is near the viewport. */
export function LazySection({
	children,
	...rest
}: {
	id: string
	title: string
	note?: string
	children: ReactNode
}) {
	useScenarioWriter(
		rest.id,
		rest.title,
		() =>
			`Extra scenario: ${rest.title}\n${rest.note ?? ""}\n(no single props object; see the on-page readouts)`,
	)

	return (
		<Section {...rest} kicker="Extra">
			{(near) => (near ? children : <Idle text="Scroll closer to load this scenario." />)}
		</Section>
	)
}

const Frame = styled("section", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px 0;
		border-top: 1px solid rgb(128 128 128 / 35%);
	`),
	f.unresponsive(css`
		min-height: 100vh;
		scroll-margin-top: 120px;
	`),
])

const Head = styled("header", [
	f.responsive(css`
		display: flex;
		align-items: baseline;
		gap: 12px;
		max-width: 900px;
	`),
])

const Kicker = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
		opacity: 0.6;
		text-transform: uppercase;
	`),
])

const Title = styled("h2", [
	f.responsive(css`
		${textStyles.h8Sans}
	`),
])

const Note = styled("p", [
	f.responsive(css`
		${textStyles.p3}
		opacity: 0.8;
	`),
])

const IdleBox = styled("div", [
	f.responsive(css`
		display: grid;
		flex: 1;
		place-items: center;
		border: 1px dashed rgb(128 128 128 / 50%);
		border-radius: 8px;
		opacity: 0.6;
	`),
	f.unresponsive(css`
		min-height: 60vh;
	`),
])
