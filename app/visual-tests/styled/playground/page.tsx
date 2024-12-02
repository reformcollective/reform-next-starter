"use client"

import { useEventListener } from "ahooks"
import { css, fmobile, fresponsive, ftablet, styled } from "library/styled"
import { useMemo, useState } from "react"

export default function Playground() {
	const [responsive, setResponsive] = useState("color: red; margin: 10px;")
	const [tablet, setTablet] = useState("color: orange; margin: 20px;")
	const [mobile, setMobile] = useState("color: green; margin: 30px;")

	const result = useMemo(() => {
		return {
			...fresponsive(responsive),
			...ftablet(tablet),
			...fmobile(mobile),
		}
	}, [responsive, tablet, mobile])

	/**
	 * when tab is pressed and a textarea is focused, insert space at cursor position
	 */
	useEventListener("keydown", (e) => {
		if (e.key === "Tab" && e.target instanceof HTMLTextAreaElement) {
			e.preventDefault()

			const selectionStart = e.target.selectionStart
			const selectionEnd = e.target.selectionEnd

			// add the space
			e.target.value = `${e.target.value.slice(
				0,
				selectionStart,
			)}${"    "}${e.target.value.slice(selectionEnd)}`

			// move the cursor back to where it was
			e.target.setSelectionRange(selectionStart + 4, selectionStart + 4)
		}
	})

	return (
		<Wrapper>
			<Texts>
				fresponsive
				<TextArea
					value={responsive}
					onChange={(e) => setResponsive(e.target.value)}
				/>
				ftablet
				<TextArea value={tablet} onChange={(e) => setTablet(e.target.value)} />
				fmobile
				<TextArea value={mobile} onChange={(e) => setMobile(e.target.value)} />
			</Texts>
			<Result>{JSON.stringify(result, null, 2)}</Result>
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 80vh;
		font-family: monospace;
	`),
)

const Texts = styled(
	"div",
	fresponsive(css`
		display: grid;
		grid-auto-rows: auto 1fr;
		gap: 10px;
	`),
)

const TextArea = styled(
	"textarea",
	fresponsive(css`
		border: 1px solid black;
		margin: 10px;
		padding: 10px;
	`),
)

const Result = styled(
	"pre",
	fresponsive(css`
		border: 1px solid black;
		margin: 10px;
		padding: 10px;
		background: whitesmoke;
	`),
)
