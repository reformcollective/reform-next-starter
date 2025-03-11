import { sleep } from "library/functions"
import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled"

export default async function LoaderB() {
	await sleep(1000)

	return (
		<Wrapper>
			<h1>Loader Tests B</h1>
			<UniversalLink href="/visual-tests/loader/a">
				Go to Loader A
			</UniversalLink>
			<UniversalLink href="/visual-tests/loader/a" transition="slide">
				Slide to Loader A
			</UniversalLink>
			<UniversalLink
				transition="instant"
				href="/visual-tests/loader/a#content-21"
			>
				instant to content 21
			</UniversalLink>
			<UniversalLink
				transition="default"
				href="/visual-tests/loader/a#content-21"
			>
				fade to content 21
			</UniversalLink>
			<UniversalLink
				transition="default"
				href="/visual-tests/loader/a?query=true#content-21"
			>
				with query parameter
			</UniversalLink>
			<p style={{ viewTransitionName: "thing-1" }}>content 1</p>
			<p style={{ viewTransitionName: "thing-2" }}>content 2</p>
			<p style={{ viewTransitionName: "thing-3" }}>content 3</p>
			<p style={{ viewTransitionName: "thing-4" }}>content 4</p>
			<p style={{ viewTransitionName: "thing-6" }}>content 6</p>
			<p style={{ viewTransitionName: "thing-5" }}>content 5</p>
			<p style={{ viewTransitionName: "thing-7" }}>content 7</p>
			<p style={{ viewTransitionName: "thing-8" }}>content 8</p>
			<p style={{ viewTransitionName: "thing-9" }}>content 9</p>
			<p style={{ viewTransitionName: "thing-10" }}>content 10</p>
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
		background: #eff;
		color: black;

		p {
			opacity: 0.5;
		}
	`),
)
