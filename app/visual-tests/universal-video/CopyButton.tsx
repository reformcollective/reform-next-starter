"use client"

import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { useEffect, useRef, useState } from "react"

import { copyText } from "./copy"

const FEEDBACK_MS = 1500

/** Copies `getText()` as plain text and shows "Copied" briefly. */
export function CopyButton({ label, getText }: { label: string; getText: () => string }) {
	const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(
		() => () => {
			if (timeout.current) clearTimeout(timeout.current)
		},
		[],
	)

	const onClick = () => {
		copyText(getText())
			.then((ok) => {
				setState(ok ? "copied" : "failed")
				if (timeout.current) clearTimeout(timeout.current)
				timeout.current = setTimeout(() => setState("idle"), FEEDBACK_MS)
			})
			.catch(() => setState("failed"))
	}

	let text = label
	if (state === "copied") text = "Copied"
	else if (state === "failed") text = "Copy failed"

	return (
		<Button type="button" onClick={onClick}>
			{text}
		</Button>
	)
}

const Button = styled("button", [
	f.responsive(css`
		${textStyles.p3}
		padding: 4px 12px;
		border: 1px solid currentcolor;
		border-radius: 4px;
		cursor: pointer;
	`),
])
