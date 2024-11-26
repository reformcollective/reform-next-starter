"use client"

import { ScrollSmoother } from "gsap/all"
import UniversalLink from "library/Loader/UniversalLink"
import { useScrollLock } from "library/Scroll"
import { css, styled, unresponsive } from "library/styled"
import { useState } from "react"

const useScrollLockToggler = (type: "lock" | "unlock") => {
	const [locked, setLocked] = useScrollLock(type)

	return [
		locked,
		() => {
			setLocked(!locked)
		},
	] as const
}

export default function ScrollLock() {
	const [a, toggle_a] = useScrollLockToggler("lock")
	const [b, toggle_b] = useScrollLockToggler("lock")
	const [c, toggle_c] = useScrollLockToggler("lock")
	const [d, toggle_d] = useScrollLockToggler("lock")

	// and an externally controlled example
	const [e, setE] = useState(false)
	useScrollLock("lock", e)

	const [f, toggle_f] = useScrollLockToggler("unlock")
	const [g, toggle_g] = useScrollLockToggler("unlock")

	return (
		<Wrapper>
			<h1>scroll lock tests</h1>
			<h2 id="test" data-anchor-offset="-100">
				lockers
			</h2>
			<button type="button" onClick={toggle_a}>
				{a ? "unlock" : "lock"} a
			</button>
			<button type="button" onClick={toggle_b}>
				{b ? "unlock" : "lock"} b
			</button>
			<button type="button" onClick={toggle_c}>
				{c ? "unlock" : "lock"} c
			</button>
			<button type="button" onClick={toggle_d}>
				{d ? "unlock" : "lock"} d
			</button>
			<button type="button" onClick={() => setE(!e)}>
				{e ? "unlock" : "lock"} e
			</button>
			<br />
			<h2>locker overrides</h2>
			<button type="button" onClick={toggle_f}>
				{f ? "remove override" : "override all lockers"} f
			</button>
			<button type="button" onClick={toggle_g}>
				{g ? "remove override" : "override all lockers"} g
			</button>
			<br />
			<h2>manual setters</h2>
			<button
				type="button"
				onClick={() => {
					ScrollSmoother.get()?.paused(true)
				}}
			>
				manually pause (demo purposes, don't use on sites)
			</button>
			<button
				type="button"
				onClick={() => {
					ScrollSmoother.get()?.paused(false)
				}}
			>
				manually resume (demo purposes, don't use on sites)
			</button>
			<UniversalLink href="/visual-tests/lockers">go to top</UniversalLink>
			<UniversalLink href="/visual-tests/lockers#test">
				go to anchor
			</UniversalLink>
			<UniversalLink href="/" transition="instant">
				go home (lockers will remove on unmount)
			</UniversalLink>
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	unresponsive(css`
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 40px;
		padding: 100px;

		button,
		a {
			cursor: pointer;
			border: 1px solid gray;
			padding: 10px 20px;
			border-radius: 5px;
		}
	`),
)
