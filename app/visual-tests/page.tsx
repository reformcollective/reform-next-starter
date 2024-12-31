"use client"

import gsap from "gsap/all"
import { styled } from "library/styled"
import { useAnimation } from "library/useAnimation"
import { useRef } from "react"

export default function VisualTestsPage() {
	const box = useRef<HTMLDivElement>(null)

	useAnimation(() => {
		gsap.from(box.current, {
			background: "red",
			duration: 5,
		})
	})

	return (
		<div>
			<Test>
				<Box ref={box}>hellow</Box>
			</Test>
			<Test>
				<Box ref={box}>hellow</Box>
			</Test>
			<Test>
				<Box ref={box}>hellow</Box>
			</Test>
			<Test>
				<Box ref={box}>hellow</Box>
			</Test>
			<Test>
				<Box ref={box}>hellow</Box>
			</Test>
			<Test>
				<Box ref={box}>hellow</Box>
			</Test>
		</div>
	)
}

const Test = styled("div", {
	background: "whitesmoke",
	padding: "100px",
})

const Box = styled("div", {
	border: "1px solid black",
	background: "dodgerblue",
	borderRadius: "5px",
	padding: "10px",
	width: "100px",
	height: "100px",
})
