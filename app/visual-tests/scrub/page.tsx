"use client"

import textStyles from "app/styles/text"
import { PageCommitSignal } from "library/link/usePageTransition"
import { ScrubbedImageSequence } from "library/scrub/ScrubbedImageSequence"
import { css, f, styled } from "library/styled"
import { useRef } from "react"

export default function ScrubVisualTestPage() {
	const track = useRef<HTMLDivElement>(null)

	return (
		<Wrapper>
			<PageCommitSignal />
			<Intro>Scroll down: the frame number follows the scroll position.</Intro>
			<Track ref={track}>
				<Stage>
					<ScrubbedImageSequence
						basePath="/visual-tests/scrub/frame"
						ext="svg"
						lastFrame={12}
						trigger={track}
						fit="contain"
						alt="Twelve numbered frames"
					/>
				</Stage>
			</Track>
			<Outro>End of track.</Outro>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-column: main;
	`),
])

const Intro = styled("p", [
	f.responsive(css`
		${textStyles.p1}
		padding: 40px;
	`),
])

const Outro = styled("p", [
	f.responsive(css`
		${textStyles.p1}
		padding: 40px;
	`),
])

const Track = styled("div", [
	f.unresponsive(css`
		height: 400vh;
	`),
])

const Stage = styled("div", [
	f.unresponsive(css`
		position: sticky;
		top: 0;
		height: 100vh;
	`),
])
