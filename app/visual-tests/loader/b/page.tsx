import { createVar } from "@vanilla-extract/css"
import { sleep } from "library/functions"
import UniversalLink from "library/link"
import { PageCommitSignal } from "library/link/usePageTransition"
import { css, f, styled } from "library/styled"

export default async function LoaderB() {
	await sleep(1000)

	return (
		<Wrapper>
			<PageCommitSignal />
			<h1>Loader Tests B</h1>
			<UniversalLink href="/visual-tests/loader/a">Go to Loader A</UniversalLink>
			<UniversalLink href="/visual-tests/loader/a">Slide to Loader A</UniversalLink>
			<UniversalLink href="/visual-tests/loader/a#content-21">instant to content 21</UniversalLink>
			<UniversalLink href="/visual-tests/loader/a#content-21">fade to content 21</UniversalLink>
			<UniversalLink href="/visual-tests/loader/a?query=true#content-21">
				with query parameter
			</UniversalLink>
			<TransitionItem transitionName="thing-1">content 1</TransitionItem>
			<TransitionItem transitionName="thing-2">content 2</TransitionItem>
			<TransitionItem transitionName="thing-3">content 3</TransitionItem>
			<TransitionItem transitionName="thing-4">content 4</TransitionItem>
			<TransitionItem transitionName="thing-6">content 6</TransitionItem>
			<TransitionItem transitionName="thing-5">content 5</TransitionItem>
			<TransitionItem transitionName="thing-7">content 7</TransitionItem>
			<TransitionItem transitionName="thing-8">content 8</TransitionItem>
			<TransitionItem transitionName="thing-9">content 9</TransitionItem>
			<TransitionItem transitionName="thing-10">content 10</TransitionItem>
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
		background: #eff;
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
