"use client"

import { createVar } from "@vanilla-extract/css"
import UniversalLink from "library/link"
import { loader } from "library/link/loader"
import { PageCommitSignal } from "library/link/usePageTransition"
import { css, f, styled } from "library/styled"
import { useEffect, useState } from "react"

export default function Loader() {
	const [immediateLoad, setImmediateLoad] = useState(false)
	const [delayedLoad, setDelayedLoad] = useState(false)

	loader.useEventListener("end", () => {
		setImmediateLoad(true)
	})

	useEffect(() => {
		if (immediateLoad)
			setTimeout(() => {
				loader.addEventListener("end", () => {
					setDelayedLoad(true)
				})
			}, 1000)
	}, [immediateLoad])

	return (
		<Wrapper>
			<PageCommitSignal />
			<h1>Loader Tests</h1>
			<UniversalLink href="/visual-tests/loader/b">Go to Loader B</UniversalLink>
			<UniversalLink href="/">go home</UniversalLink>
			<h2>these should both appear:</h2>
			<h3>{immediateLoad ? "immediate load" : "waiting for load"}</h3>
			<h3>{delayedLoad ? "delayed load" : "waiting for load"}</h3>
			<UniversalLink href="/visual-tests/loader/a#content-21">scroll to content 21</UniversalLink>
			<UniversalLink href="#content-21">scroll to content 21 (bare hash)</UniversalLink>
			<TransitionItem transitionName="thing-1">content 1</TransitionItem>
			<TransitionItem transitionName="thing-2">content 2</TransitionItem>
			<TransitionItem transitionName="thing-3">content 3</TransitionItem>
			<TransitionItem transitionName="thing-4">content 4</TransitionItem>
			<TransitionItem transitionName="thing-5">content 5</TransitionItem>
			<TransitionItem transitionName="thing-6">content 6</TransitionItem>
			<TransitionItem transitionName="thing-7">content 7</TransitionItem>
			<TransitionItem transitionName="thing-8">content 8</TransitionItem>
			<TransitionItem transitionName="thing-9">content 9</TransitionItem>
			<TransitionItem transitionName="thing-10">content 10</TransitionItem>
			<UniversalLink href="/visual-tests/loader/b">go to b</UniversalLink>
			<p>content 11</p>
			<p>content 12</p>
			<p>content 13</p>
			<p>content 14</p>
			<p>content 15</p>
			<p>content 16</p>
			<p>content 17</p>
			<p>content 18</p>
			<p>content 19</p>
			<p>content 20</p>
			<UniversalLink href="/visual-tests/loader/b">go to b</UniversalLink>
			<p id="content-21" data-anchor-offset="-100">
				content 21
			</p>
			<p>content 22</p>
			<p>content 23</p>
			<p>content 24</p>
			<p>content 25</p>
			<p>content 26</p>
			<p>content 27</p>
			<p>content 28</p>
			<p>content 29</p>
			<p>content 30</p>
			<UniversalLink href="/visual-tests/loader/b">go to b</UniversalLink>
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	f.responsive(css`
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 40px;
		padding: 100px;
		background: #ffe;
		color: black;

		p {
			opacity: 0.5;
		}
	`),
)

const transitionName = createVar()

const TransitionItem = styled("p", {
	base: [{ viewTransitionName: transitionName }],
	tokens: { transitionName },
})
