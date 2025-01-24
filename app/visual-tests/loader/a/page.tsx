"use client"

import { loader } from "library/Loader"
import UniversalLink from "library/Loader/UniversalLink"
import { css, fresponsive, styled } from "library/styled"
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
			<h1>Loader Tests</h1>
			<UniversalLink href="/visual-tests/loader/b" transition="slide">
				Go to Loader B
			</UniversalLink>
			<UniversalLink href="/">go home</UniversalLink>
			<h2>these should both appear:</h2>
			<h3>{immediateLoad ? "immediate load" : "waiting for load"}</h3>
			<h3>{delayedLoad ? "delayed load" : "waiting for load"}</h3>
			<UniversalLink href="/visual-tests/loader/a#content-21">
				scroll to content 21
			</UniversalLink>
			<UniversalLink href="#content-21">
				scroll to content 21 (bare hash)
			</UniversalLink>
			<p>content 1</p>
			<p>content 2</p>
			<p>content 3</p>
			<p>content 4</p>
			<p>content 5</p>
			<p>content 6</p>
			<p>content 7</p>
			<p>content 8</p>
			<p>content 9</p>
			<p>content 10</p>
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
	fresponsive(css`
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
