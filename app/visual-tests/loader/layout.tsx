"use client"

/**
 * this is just for visual testing, usually you'd put this stuff in the main layout.
 */
import Preloader from "visual-tests/loader/Preloader"
import Transition from "visual-tests/loader/Transition"
import { useClientOnly } from "library/ClientOnly"
import { createPortal } from "react-dom"

export default function VisualTestsLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const isClient = useClientOnly(true)

	if (!isClient)
		return (
			<>
				<Preloader />
				<Transition />
				{children}
			</>
		)

	return (
		<>
			{createPortal(
				<>
					<Preloader />
					<Transition />
				</>,
				document.body,
			)}
			{children}
		</>
	)
}
