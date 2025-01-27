import { sleep } from "library/functions"
import UniversalLink from "library/Loader/UniversalLink"
import { css, fresponsive, styled } from "library/styled"

export default async function LoaderB() {
	await sleep(1000)

	return (
		<Wrapper>
			<h1>Loader Tests B</h1>
			<UniversalLink href="/visual-tests/loader/a">
				Go to Loader A
			</UniversalLink>
			<UniversalLink
				transition="instant"
				href="/visual-tests/loader/a#content-21"
			>
				instant to content 21
			</UniversalLink>
			<UniversalLink transition="fade" href="/visual-tests/loader/a#content-21">
				fade to content 21
			</UniversalLink>
			<UniversalLink
				transition="fade"
				href="/visual-tests/loader/a?query=true#content-21"
			>
				with query parameter
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
	`),
)
